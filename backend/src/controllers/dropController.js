const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendDropNotification } = require('../utils/email');
const { pick } = require('../middleware/validate');

const ALLOWED_DROP_FIELDS = ['title', 'description', 'products', 'launchDate', 'endDate', 'status', 'featuredImage', 'bannerImage', 'isPublished'];

// Helper to determine status
const updateDropStatus = (drop) => {
  const now = new Date();
  if (now < new Date(drop.launchDate)) {
    return 'upcoming';
  } else if (drop.endDate && now > new Date(drop.endDate)) {
    return 'archived';
  } else {
    return 'live';
  }
};

exports.getAllDrops = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status) where.status = status;
    
    const drops = await prisma.drop.findMany({
      where,
      orderBy: { launchDate: 'desc' }
    });
    
    // In Mongoose it used .populate('products'), so we should fetch the products if they exist
    for (const drop of drops) {
      if (drop.products && Array.isArray(drop.products) && drop.products.length > 0) {
        drop.productDetails = await prisma.product.findMany({
          where: { id: { in: drop.products } }
        });
      }
      drop._id = drop.id;
    }

    res.json(drops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDrop = async (req, res) => {
  try {
    const { id } = req.params;
    const drop = await prisma.drop.findFirst({
      where: {
        OR: [
          { id: id.length === 36 ? id : undefined },
          { slug: id }
        ]
      }
    });

    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    if (drop.products && Array.isArray(drop.products) && drop.products.length > 0) {
      drop.products = await prisma.product.findMany({
        where: { id: { in: drop.products } }
      });
    }

    res.json({ ...drop, _id: drop.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDrop = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_DROP_FIELDS);
    
    // Generate slug manually
    if (data.title && !data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Convert string dates to Date objects if needed
    if (data.launchDate) data.launchDate = new Date(data.launchDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const drop = await prisma.drop.create({ data });
    res.status(201).json({ ...drop, _id: drop.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDrop = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_DROP_FIELDS);
    
    if (data.title && !data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    if (data.launchDate) data.launchDate = new Date(data.launchDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    // Also update status dynamically based on dates
    let dropDataForStatus = { ...data };
    if (!dropDataForStatus.launchDate) {
      const existing = await prisma.drop.findUnique({ where: { id: req.params.id }});
      if (existing) {
        dropDataForStatus.launchDate = existing.launchDate;
        dropDataForStatus.endDate = data.endDate !== undefined ? data.endDate : existing.endDate;
      }
    }
    
    if (dropDataForStatus.launchDate) {
      data.status = updateDropStatus(dropDataForStatus);
    }

    const drop = await prisma.drop.update({
      where: { id: req.params.id },
      data
    });

    res.json({ ...drop, _id: drop.id });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Drop not found' });
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDrop = async (req, res) => {
  try {
    await prisma.drop.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Drop deleted' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Drop not found' });
    res.status(500).json({ message: error.message });
  }
};

exports.subscribeToNotification = async (req, res) => {
  try {
    const drop = await prisma.drop.findUnique({ where: { id: req.params.id } });
    
    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    let notifySubscribers = drop.notifySubscribers || [];
    if (!Array.isArray(notifySubscribers)) notifySubscribers = [];

    if (!notifySubscribers.includes(req.user.id)) {
      notifySubscribers.push(req.user.id);
      await prisma.drop.update({
        where: { id: req.params.id },
        data: { notifySubscribers }
      });
    }

    res.json({ message: 'Subscribed to notifications' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.launchDrop = async (req, res) => {
  try {
    const drop = await prisma.drop.update({
      where: { id: req.params.id },
      data: { status: 'live' }
    });
    
    // Send notifications
    const subscribers = drop.notifySubscribers || [];
    if (Array.isArray(subscribers) && subscribers.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: subscribers } }
      });
      
      for (const user of users) {
        await sendDropNotification(user.email, drop);
      }
    }

    res.json({ ...drop, _id: drop.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

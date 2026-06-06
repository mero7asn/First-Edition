const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { pick } = require('../middleware/validate');

const ALLOWED_BANNER_FIELDS = ['title', 'subtitle', 'description', 'image', 'mobileImage', 'ctaText', 'ctaLink', 'position', 'backgroundColor', 'textColor', 'order', 'isActive', 'startDate', 'endDate'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          {
            startDate: { lte: now },
            endDate: { gte: now }
          },
          {
            startDate: null,
            endDate: null
          }
        ]
      },
      orderBy: { order: 'asc' }
    });
    
    res.json(banners.map(b => ({ ...b, _id: b.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(banners.map(b => ({ ...b, _id: b.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_BANNER_FIELDS);
    
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const banner = await prisma.banner.create({ data });
    res.status(201).json({ ...banner, _id: banner.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_BANNER_FIELDS);
    
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data
    });

    res.json({ ...banner, _id: banner.id });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Banner not found' });
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await prisma.banner.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Banner not found' });
    res.status(500).json({ message: error.message });
  }
};

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Already subscribed' });
    }

    await prisma.newsletter.create({ data: { email } });
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

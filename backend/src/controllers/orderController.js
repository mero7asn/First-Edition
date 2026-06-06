const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendOrderConfirmation } = require('../utils/email');
const { safeRegex, pick } = require('../middleware/validate');

const ALLOWED_ORDER_UPDATE = ['status', 'trackingNumber', 'adminNotes'];

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, payment, pricing, coupon } = req.body;

    // We need to use a transaction to safely check and decrement stock
    const order = await prisma.$transaction(async (tx) => {
      // Validate stock and reduce inventory
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.product } });
        if (!product) throw new Error(`Product not found: ${item.name}`);

        const sizes = product.sizes || [];
        const sizeIndex = sizes.findIndex(v => v.size === item.size); // assuming color matching if needed
        
        if (sizeIndex === -1 || sizes[sizeIndex].stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        sizes[sizeIndex].stock -= item.quantity;
        
        await tx.product.update({
          where: { id: item.product },
          data: { sizes }
        });
      }

      // Create the order
      const orderNumber = 'FE' + Date.now() + Math.floor(Math.random() * 1000);
      
      return await tx.order.create({
        data: {
          orderNumber,
          userId: req.user.id,
          items,
          shippingAddress,
          billingAddress,
          payment,
          pricing,
          coupon
        }
      });
    });

    await sendOrderConfirmation(order, req.user);

    res.status(201).json({ ...order, _id: order.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    // Convert id to _id for frontend compatibility
    res.json(orders.map(o => ({ ...o, _id: o.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true } } }
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ ...order, _id: order.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (search) {
      where.orderNumber = {
        contains: safeRegex(search),
        mode: 'insensitive'
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(orders.map(o => ({ ...o, _id: o.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, adminNotes } = pick(req.body, ALLOWED_ORDER_UPDATE);
    
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const data = {};
    if (status) data.status = status;
    if (trackingNumber) data.trackingNumber = trackingNumber;
    if (adminNotes) data.adminNotes = adminNotes;

    if (status === 'shipped' && !order.shippedAt) {
      data.shippedAt = new Date();
    }
    if (status === 'delivered' && !order.deliveredAt) {
      data.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data
    });

    res.json({ ...updatedOrder, _id: updatedOrder.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    
    // Prisma aggregate
    // Since payment is JSON in Prisma, we have to fetch and sum manually if the database doesn't support JSON aggregations natively
    const paidOrders = await prisma.order.findMany();
    
    const totalRevenue = paidOrders
      .filter(o => o.payment && o.payment.status === 'paid')
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    const statusCounts = paidOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    const ordersByStatus = Object.keys(statusCounts).map(status => ({
      _id: status,
      count: statusCounts[status]
    }));

    res.json({
      totalOrders,
      totalRevenue,
      ordersByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

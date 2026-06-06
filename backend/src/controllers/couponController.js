const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { pick } = require('../middleware/validate');

const ALLOWED_COUPON_FIELDS = ['code', 'description', 'discountType', 'discountValue', 'minPurchase', 'maxDiscount', 'usageLimit', 'startDate', 'endDate', 'isActive'];

// Helper functions (formerly Mongoose methods)
const isCouponValid = (coupon, orderTotal) => {
  const now = new Date();
  if (!coupon.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (coupon.startDate && now < coupon.startDate) return { valid: false, message: 'Coupon not yet active' };
  if (coupon.endDate && now > coupon.endDate) return { valid: false, message: 'Coupon expired' };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderTotal < coupon.minPurchase) return { valid: false, message: `Minimum purchase of ${coupon.minPurchase} required` };
  return { valid: true };
};

const calculateDiscount = (coupon, orderTotal) => {
  if (coupon.discountType === 'percentage') {
    const discount = (orderTotal * coupon.discountValue) / 100;
    return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  }
  return Math.min(coupon.discountValue, orderTotal);
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    const validation = isCouponValid(coupon, orderTotal);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const discount = calculateDiscount(coupon, orderTotal);

    res.json({
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons.map(c => ({ ...c, _id: c.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_COUPON_FIELDS);
    // Ensure code is uppercase
    if (data.code) data.code = data.code.toUpperCase();
    
    const coupon = await prisma.coupon.create({ data });
    res.status(201).json({ ...coupon, _id: coupon.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_COUPON_FIELDS);
    if (data.code) data.code = data.code.toUpperCase();

    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data
    });
    
    res.json({ ...coupon, _id: coupon.id });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Coupon not found' });
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await prisma.coupon.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Coupon not found' });
    res.status(500).json({ message: error.message });
  }
};

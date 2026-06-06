const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ 
      data: { name, email, password: hashedPassword } 
    });
    
    const token = generateToken(user.id);

    res.status(201).json({
      _id: user.id, // Keeping _id for frontend compatibility
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    // Convert JSON wishlist back to frontend format if needed
    const wishlist = user.wishlist || [];
    
    res.json({
      ...user,
      _id: user.id,
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const dataToUpdate = {};
    if (req.body.name) dataToUpdate.name = req.body.name;
    if (req.body.phone) dataToUpdate.phone = req.body.phone;
    if (req.body.addresses) dataToUpdate.addresses = req.body.addresses;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate
    });
    
    res.json({ ...user, _id: user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    let wishlist = user.wishlist || [];
    // Ensure it's an array
    if (!Array.isArray(wishlist)) wishlist = [];

    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      await prisma.user.update({
        where: { id: req.user.id },
        data: { wishlist }
      });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    let wishlist = user.wishlist || [];
    if (!Array.isArray(wishlist)) wishlist = [];

    wishlist = wishlist.filter(id => id !== productId);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { wishlist }
    });

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

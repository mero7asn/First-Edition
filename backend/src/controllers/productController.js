const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { safeRegex, pick } = require('../middleware/validate');

const ALLOWED_FIELDS = ['name', 'description', 'price', 'images', 'sizes', 'colors', 'isAvailable', 'isFeatured', 'whatsappNumber', 'category'];

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, size, color } = req.query;
    
    // Build the WHERE clause for Prisma
    const where = {};
    
    if (category) where.category = category;
    
    if (search) {
      where.name = {
        contains: safeRegex(search),
        mode: 'insensitive' // Postgres case-insensitive
      };
    }

    // In Prisma, querying JSON arrays like 'colors' or 'sizes' requires specific syntax or raw queries.
    // For simplicity with Vercel Postgres JSONB, we'll use Prisma's JSON filtering if possible, 
    // but Prisma's native JSON array filtering is limited without raw queries in some versions.
    // To ensure compatibility, we'll fetch based on standard fields and filter in JS if complex, 
    // or use path array filtering if exact match.
    // Since 'colors' is a simple array of strings:
    if (color) {
      where.colors = {
        array_contains: color
      };
    }
    
    let orderBy = {};
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'price-low') orderBy = { price: 'asc' };
    else if (sort === 'price-high') orderBy = { price: 'desc' };
    else if (sort === 'featured') orderBy = { isFeatured: 'desc' };

    let products = await prisma.product.findMany({
      where,
      orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' }
    });

    // Handle complex array-of-objects filtering for 'sizes' in JavaScript memory
    // (Translating Mongoose $elemMatch on JSON arrays to pure Prisma can be difficult)
    if (size) {
      const upperSize = size.toUpperCase();
      products = products.filter(product => {
        const sizes = product.sizes || [];
        return sizes.some(s => s.size === upperSize && s.isAvailable && s.stock > 0);
      });
    }

    // Map `id` to `_id` for frontend compatibility
    products = products.map(p => ({ ...p, _id: p.id }));

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by ID or slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id.length === 36 ? id : undefined }, // UUID check
          { slug: id }
        ]
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ ...product, _id: product.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_FIELDS);
    
    // Generate slug manually (Mongoose pre-save hook replacement)
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const product = await prisma.product.create({ data });
    res.status(201).json({ ...product, _id: product.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_FIELDS);
    
    // Generate slug if name changes
    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data
    });

    res.json({ ...product, _id: product.id });
  } catch (error) {
    // Prisma throws an error if record not found
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 8
    });
    
    res.json(products.map(p => ({ ...p, _id: p.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: { isAvailable: !product.isAvailable }
    });

    res.json({ 
      message: `Product is now ${updatedProduct.isAvailable ? 'available' : 'unavailable'}`, 
      product: { ...updatedProduct, _id: updatedProduct.id }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

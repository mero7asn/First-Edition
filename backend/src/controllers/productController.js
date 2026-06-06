const Product = require('../models/Product');
const { safeRegex, pick } = require('../middleware/validate');

const ALLOWED_FIELDS = ['name', 'description', 'price', 'images', 'sizes', 'colors', 'isAvailable', 'isFeatured', 'whatsappNumber', 'category'];

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, size, color } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: safeRegex(search), $options: 'i' };
    if (color) filter.colors = { $regex: new RegExp(`^${safeRegex(color)}$`, 'i') };
    if (size) {
      filter.sizes = {
        $elemMatch: {
          size: size.toUpperCase(),
          isAvailable: true,
          stock: { $gt: 0 }
        }
      };
    }

    let query = Product.find(filter);

    if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else if (sort === 'price-low') query = query.sort({ price: 1 });
    else if (sort === 'price-high') query = query.sort({ price: -1 });
    else if (sort === 'featured') query = query.sort({ isFeatured: -1 });

    const products = await query;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      $or: [{ _id: req.params.id }, { slug: req.params.id }] 
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(pick(req.body, ALLOWED_FIELDS));
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body, ALLOWED_FIELDS), { new: true, runValidators: true });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.json({ message: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}`, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

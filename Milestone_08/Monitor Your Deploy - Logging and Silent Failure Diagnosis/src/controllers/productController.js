import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    // Bug: category can be undefined — returns empty array with no error
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('Error:', err.message)
    // No console.error — errors swallowed silently
    res.status(500).json({ error: 'Server error' });
  }
};

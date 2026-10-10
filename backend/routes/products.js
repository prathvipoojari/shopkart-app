const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');

function getProductsData() {
  try {
    const raw = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading products file:', err);
    return [];
  }
}

// GET /api/products (with search, category, and sort filters)
router.get('/', (req, res) => {
  let products = getProductsData();
  const { category, search, sort } = req.query;

  // Filter by category (if provided and not 'For You' / 'all')
  if (category && category.toLowerCase() !== 'for you' && category.toLowerCase() !== 'all') {
    products = products.filter(p => 
      p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by search keyword
  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sort === 'low-to-high') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'high-to-low') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  res.json({
    success: true,
    count: products.length,
    products
  });
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  const products = getProductsData();
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  res.json({
    success: true,
    categories
  });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const products = getProductsData();
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({
    success: true,
    product
  });
});

module.exports = router;

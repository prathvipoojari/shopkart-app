const express = require('express');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '..');

// SECURITY: never serve the backend folder
app.use('/backend', (req, res) => {
  res.status(404).send('Not found');
});

app.use(express.static(frontendPath, { dotfiles: 'ignore' }));

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShopKart Backend Server is running smoothly!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'home.html'));
});

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🛒 ShopKart Server running on http://localhost:${PORT}`);
  console.log(`🌐 Open Home Page : http://localhost:${PORT}/home.html`);
  console.log(`📦 Products API   : http://localhost:${PORT}/api/products`);
  console.log(`🔐 Auth API       : http://localhost:${PORT}/api/auth`);
  console.log('====================================================');
});
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ordersFilePath = path.join(__dirname, '../data/orders.json');

function getOrders() {
  try {
    const raw = fs.readFileSync(ordersFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

function saveOrders(orders) {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing orders file:', err);
    return false;
  }
}

// Helper to compute realistic delivery date
function getEstimatedDelivery() {
  const date = new Date();
  date.setDate(date.getDate() + 2); // 2 days from today
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// POST /api/orders (Place new order)
router.post('/', (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, customerName, customerEmail } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Cannot place order.' });
    }

    const orders = getOrders();
    const newOrder = {
      orderId: 'OD' + Date.now().toString().slice(-8),
      items,
      totalAmount: Number(totalAmount) || 0,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || 'guest@shopkart.com',
      shippingAddress: shippingAddress || 'Standard Delivery Address',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'Placed',
      estimatedDelivery: getEstimatedDelivery(),
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for shopping with ShopKart.',
      order: newOrder
    });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ success: false, message: 'Server error placing order.' });
  }
});

// GET /api/orders (supports filter by ?email=...)
router.get('/', (req, res) => {
  let orders = getOrders();
  const { email } = req.query;

  if (email && email !== 'guest@shopkart.com') {
    const norm = email.toLowerCase().trim();
    orders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === norm);
  }

  res.json({ success: true, count: orders.length, orders });
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', (req, res) => {
  const orders = getOrders();
  const order = orders.find(o => o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (order.status === 'Delivered') {
    return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled.' });
  }

  order.status = 'Cancelled';
  order.cancelledAt = new Date().toISOString();
  saveOrders(orders);

  res.json({ success: true, message: 'Order cancelled successfully.', order });
});

module.exports = router;

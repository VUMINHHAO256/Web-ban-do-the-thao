const express = require('express');
const router  = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const protect = [authMiddleware, adminMiddleware];

// GET /api/dashboard/summary
router.get('/summary',  ...protect, dashboardController.getSummary);

// GET /api/dashboard/revenue
router.get('/revenue',  ...protect, dashboardController.getRevenue);

// GET /api/dashboard/products
router.get('/products', ...protect, dashboardController.getProducts);

// GET /api/dashboard/orders
router.get('/orders',   ...protect, dashboardController.getOrders);

// GET /api/dashboard/users
router.get('/users',    ...protect, dashboardController.getUsers);

module.exports = router;
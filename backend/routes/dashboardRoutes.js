const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { isSuperAdmin, isAdmin, isFarmer } = require('../middleware/rbac');

router.use(authenticate);

router.get('/super-admin', isSuperAdmin, DashboardController.getSuperAdminDashboard);
router.get('/admin', isAdmin, DashboardController.getAdminDashboard);
router.get('/farmer', isFarmer, DashboardController.getFarmerDashboard);

module.exports = router;
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { isSuperAdmin, isAdmin } = require('../middleware/rbac');
const { userValidation } = require('../validators/authValidator');

// All routes require authentication
router.use(authenticate);

// Super Admin routes
router.get('/', isSuperAdmin, UserController.getAll);
router.get('/admins', isSuperAdmin, UserController.getAll);
router.post('/', isSuperAdmin, userValidation, UserController.create);

// Admin routes - get farmers
router.get('/farmers', isAdmin, UserController.getFarmers);
router.get('/farmers-compliance', isAdmin, UserController.getFarmersWithCompliance);

// Common routes
router.get('/:id', UserController.getById);
router.put('/:id', UserController.update);
router.delete('/:id', isSuperAdmin, UserController.deactivate);

module.exports = router;
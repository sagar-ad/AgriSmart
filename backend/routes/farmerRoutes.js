const express = require('express');
const router = express.Router();
const FarmerController = require('../controllers/farmerController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { farmerCropValidation } = require('../validators/authValidator');

router.use(authenticate);

// Admin routes
router.get('/', isAdmin, FarmerController.getAll);
router.get('/compliance', isAdmin, FarmerController.getFarmersWithCompliance);

// Common routes
router.get('/:id', FarmerController.getById);
router.post('/', isAdmin, FarmerController.create);
router.put('/:id', FarmerController.update);
router.post('/:id/crops', isAdmin, farmerCropValidation, FarmerController.assignCrop);
router.get('/:id/tasks', FarmerController.getTasks);
router.put('/:id/crops/:cropId', isAdmin, FarmerController.updateCrop);

module.exports = router;
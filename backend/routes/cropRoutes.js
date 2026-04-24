const express = require('express');
const router = express.Router();
const CropController = require('../controllers/cropController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { cropValidation } = require('../validators/authValidator');

router.use(authenticate);
router.use(isAdmin);

router.get('/', CropController.getAll);
router.get('/:id', CropController.getById);
router.post('/', cropValidation, CropController.create);
router.put('/:id', CropController.update);
router.delete('/:id', CropController.delete);

module.exports = router;
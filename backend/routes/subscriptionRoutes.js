const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', SubscriptionController.getAll);
router.get('/active', SubscriptionController.getActive);
router.get('/admin/:adminId', SubscriptionController.getByAdminId);
router.post('/', isSuperAdmin, SubscriptionController.create);
router.put('/:id', isSuperAdmin, SubscriptionController.update);

module.exports = router;
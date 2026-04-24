const express = require('express');
const router = express.Router();
const ScheduleController = require('../controllers/scheduleController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { scheduleTemplateValidation } = require('../validators/authValidator');

router.use(authenticate);
router.use(isAdmin);

router.get('/', ScheduleController.getAll);
router.get('/:id', ScheduleController.getById);
router.post('/', scheduleTemplateValidation, ScheduleController.create);
router.put('/:id', ScheduleController.update);
router.delete('/:id', ScheduleController.delete);

module.exports = router;
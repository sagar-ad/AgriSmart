const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { taskValidation, taskCompletionValidation } = require('../validators/authValidator');

router.use(authenticate);

router.get('/', TaskController.getAll);
router.get('/pending', TaskController.getPending);
router.get('/today', TaskController.getToday);
router.get('/compliance', TaskController.getCompliance);
router.get('/:id', TaskController.getById);
router.put('/:id', taskValidation, TaskController.update);
router.post('/:id/complete', taskCompletionValidation, TaskController.complete);

module.exports = router;
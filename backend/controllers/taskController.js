const FarmerTask = require('../models/FarmerTask');
const { successResponse, notFoundResponse, errorResponse } = require('../utils/response');

/**
 * Task Controller
 * Handles task operations
 */
class TaskController {
  /**
   * GET /api/tasks
   * Get tasks (filtered by role)
   */
  static async getAll(req, res, next) {
    try {
      const { status, farmer_id } = req.query;
      let tasks;
      
      if (req.user.role === 'farmer') {
        // Farmers can only see their own tasks
        tasks = await FarmerTask.findByFarmerId(req.user.id);
      } else {
        // Admins can see all tasks
        tasks = await FarmerTask.getAllForAdmin(req.user.id);
        
        // Filter by farmer_id if provided
        if (farmer_id) {
          tasks = tasks.filter(t => t.farmer_id === parseInt(farmer_id));
        }
      }
      
      // Filter by status if provided
      if (status) {
        tasks = tasks.filter(t => t.status === status);
      }
      
      return successResponse(res, 200, 'Tasks fetched successfully', tasks);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/pending
   * Get pending tasks for current farmer
   */
  static async getPending(req, res, next) {
    try {
      const tasks = await FarmerTask.getPendingTasks(req.user.id);
      return successResponse(res, 200, 'Pending tasks fetched successfully', tasks);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/today
   * Get today's tasks for current farmer
   */
  static async getToday(req, res, next) {
    try {
      const tasks = await FarmerTask.getTodaysTasks(req.user.id);
      return successResponse(res, 200, "Today's tasks fetched successfully", tasks);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/:id
   * Get task by ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const task = await FarmerTask.findById(id);
      
      if (!task) {
        return notFoundResponse(res, 'Task not found');
      }
      
      // Check permission
      if (req.user.role === 'farmer' && task.farmer_id !== req.user.id) {
        return errorResponse(res, 403, 'You can only view your own tasks');
      }
      
      return successResponse(res, 200, 'Task fetched successfully', task);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/tasks/:id
   * Update task
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { task_name, due_date, status } = req.body;
      
      const task = await FarmerTask.findById(id);
      
      if (!task) {
        return notFoundResponse(res, 'Task not found');
      }
      
      // Check permission
      if (req.user.role === 'farmer' && task.farmer_id !== req.user.id) {
        return errorResponse(res, 403, 'You can only update your own tasks');
      }
      
      const updatedTask = await FarmerTask.update(id, {
        task_name,
        due_date,
        status
      });
      
      return successResponse(res, 200, 'Task updated successfully', updatedTask);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks/:id/complete
   * Complete a task with notes and photo
   */
  static async complete(req, res, next) {
    try {
      const { id } = req.params;
      const { completion_note, completion_photo } = req.body;
      
      const task = await FarmerTask.findById(id);
      
      if (!task) {
        return notFoundResponse(res, 'Task not found');
      }
      
      // Check permission
      if (req.user.role === 'farmer' && task.farmer_id !== req.user.id) {
        return errorResponse(res, 403, 'You can only complete your own tasks');
      }
      
      const completedTask = await FarmerTask.complete(id, {
        completion_note,
        completion_photo
      });
      
      return successResponse(res, 200, 'Task completed successfully', completedTask);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/compliance
   * Get compliance stats for farmer
   */
  static async getCompliance(req, res, next) {
    try {
      const stats = await FarmerTask.getComplianceStats(req.user.id);
      return successResponse(res, 200, 'Compliance stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
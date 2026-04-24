const ScheduleTemplate = require('../models/ScheduleTemplate');
const { successResponse, notFoundResponse } = require('../utils/response');

/**
 * Schedule Controller
 * Handles schedule template CRUD operations
 */
class ScheduleController {
  /**
   * GET /api/schedules
   * Get all schedule templates
   */
  static async getAll(req, res, next) {
    try {
      const { crop_id } = req.query;
      let templates;
      
      if (crop_id) {
        templates = await ScheduleTemplate.findByCropId(crop_id);
      } else {
        templates = await ScheduleTemplate.getAll();
      }
      
      return successResponse(res, 200, 'Schedule templates fetched successfully', templates);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/schedules/:id
   * Get schedule template by ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const template = await ScheduleTemplate.findById(id);
      
      if (!template) {
        return notFoundResponse(res, 'Schedule template not found');
      }
      
      return successResponse(res, 200, 'Schedule template fetched successfully', template);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/schedules
   * Create new schedule template
   */
  static async create(req, res, next) {
    try {
      const { crop_id, task_name, days_after_sowing, instructions } = req.body;
      const template = await ScheduleTemplate.create({
        crop_id,
        task_name,
        days_after_sowing,
        instructions
      });
      return successResponse(res, 201, 'Schedule template created successfully', template);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/schedules/:id
   * Update schedule template
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { task_name, days_after_sowing, instructions } = req.body;
      const template = await ScheduleTemplate.update(id, {
        task_name,
        days_after_sowing,
        instructions
      });
      
      if (!template) {
        return notFoundResponse(res, 'Schedule template not found');
      }
      
      return successResponse(res, 200, 'Schedule template updated successfully', template);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/schedules/:id
   * Delete schedule template
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const template = await ScheduleTemplate.delete(id);
      
      if (!template) {
        return notFoundResponse(res, 'Schedule template not found');
      }
      
      return successResponse(res, 200, 'Schedule template deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ScheduleController;
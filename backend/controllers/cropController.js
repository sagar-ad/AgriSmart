const Crop = require('../models/Crop');
const { successResponse, notFoundResponse, conflictResponse } = require('../utils/response');

/**
 * Crop Controller
 * Handles crop CRUD operations
 */
class CropController {
  /**
   * GET /api/crops
   * Get all crops
   */
  static async getAll(req, res, next) {
    try {
      const crops = await Crop.getAll();
      return successResponse(res, 200, 'Crops fetched successfully', crops);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/crops/:id
   * Get crop by ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const crop = await Crop.findById(id);
      
      if (!crop) {
        return notFoundResponse(res, 'Crop not found');
      }
      
      return successResponse(res, 200, 'Crop fetched successfully', crop);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/crops
   * Create new crop
   */
  static async create(req, res, next) {
    try {
      const { name, variety, description } = req.body;
      const crop = await Crop.create({ name, variety, description });
      return successResponse(res, 201, 'Crop created successfully', crop);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/crops/:id
   * Update crop
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, variety, description } = req.body;
      const crop = await Crop.update(id, { name, variety, description });
      
      if (!crop) {
        return notFoundResponse(res, 'Crop not found');
      }
      
      return successResponse(res, 200, 'Crop updated successfully', crop);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/crops/:id
   * Delete crop
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const crop = await Crop.delete(id);
      
      if (!crop) {
        return notFoundResponse(res, 'Crop not found');
      }
      
      return successResponse(res, 200, 'Crop deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CropController;
const FarmerCrop = require('../models/FarmerCrop');
const User = require('../models/User');
const ScheduleGenerator = require('../services/scheduleGenerator');
const { successResponse, notFoundResponse, errorResponse } = require('../utils/response');

/**
 * Farmer Controller
 * Handles farmer management operations
 */
class FarmerController {
  /**
   * GET /api/farmers
   * Get all farmers
   */
  static async getAll(req, res, next) {
    try {
      const farmers = await User.getAllFarmers(req.user.id);
      const farmersWithoutPassword = farmers.map(f => {
        delete f.password;
        return f;
      });
      return successResponse(res, 200, 'Farmers fetched successfully', farmersWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/farmers/:id
   * Get farmer by ID with crops
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const farmer = await User.findById(id);
      
      if (!farmer) {
        return notFoundResponse(res, 'Farmer not found');
      }
      
      if (farmer.role !== 'farmer') {
        return errorResponse(res, 400, 'User is not a farmer');
      }
      
      delete farmer.password;
      
      // Get farmer crops
      const crops = await FarmerCrop.findByFarmerId(id);
      
      return successResponse(res, 200, 'Farmer fetched successfully', {
        ...farmer,
        crops
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/farmers
   * Create farmer (by admin)
   */
  static async create(req, res, next) {
    try {
      const { email, password, name, phone, location } = req.body;
      
      const farmer = await User.create({
        email,
        password,
        role: 'farmer',
        name,
        phone,
        location
      });
      
      delete farmer.password;
      
      return successResponse(res, 201, 'Farmer created successfully', farmer);
    } catch (error) {
      if (error.code === '23505') {
        return errorResponse(res, 409, 'Farmer with this email already exists');
      }
      next(error);
    }
  }

  /**
   * PUT /api/farmers/:id
   * Update farmer
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, phone, location } = req.body;
      
      const farmer = await User.update(id, { name, phone, location });
      
      if (!farmer) {
        return notFoundResponse(res, 'Farmer not found');
      }
      
      delete farmer.password;
      
      return successResponse(res, 200, 'Farmer updated successfully', farmer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/farmers/:id/crops
   * Assign a crop to farmer (generates tasks)
   */
  static async assignCrop(req, res, next) {
    try {
      const { id } = req.params;
      const { crop_id, sowing_date } = req.body;
      
      const result = await ScheduleGenerator.assignCropToFarmer(
        parseInt(id),
        parseInt(crop_id),
        sowing_date
      );
      
      return successResponse(res, 201, 'Crop assigned to farmer successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/farmers/:id/tasks
   * Get farmer's tasks
   */
  static async getTasks(req, res, next) {
    try {
      const { id } = req.params;
      const tasks = await FarmerCrop.getWithTasks(id);
      
      if (!tasks) {
        return notFoundResponse(res, 'Farmer not found');
      }
      
      return successResponse(res, 200, 'Tasks fetched successfully', tasks);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/farmers/:id/crops/:cropId
   * Update farmer crop (regenerates tasks)
   */
  static async updateCrop(req, res, next) {
    try {
      const { id, cropId } = req.params;
      const { sowing_date } = req.body;
      
      const tasks = await ScheduleGenerator.regenerateTasks(parseInt(cropId), sowing_date);
      
      return successResponse(res, 200, 'Tasks regenerated successfully', tasks);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FarmerController;
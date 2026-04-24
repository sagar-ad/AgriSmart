const Subscription = require('../models/Subscription');
const { successResponse, notFoundResponse, conflictResponse } = require('../utils/response');

/**
 * Subscription Controller
 * Handles subscription management
 */
class SubscriptionController {
  /**
   * GET /api/subscriptions
   * Get all subscriptions (Super Admin only)
   */
  static async getAll(req, res, next) {
    try {
      const subscriptions = await Subscription.getAll();
      return successResponse(res, 200, 'Subscriptions fetched successfully', subscriptions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/subscriptions/active
   * Get active subscriptions
   */
  static async getActive(req, res, next) {
    try {
      const subscriptions = await Subscription.getAllActive();
      return successResponse(res, 200, 'Active subscriptions fetched successfully', subscriptions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/subscriptions/admin/:adminId
   * Get subscription by admin ID
   */
  static async getByAdminId(req, res, next) {
    try {
      const { adminId } = req.params;
      const subscription = await Subscription.findByAdminId(adminId);
      
      if (!subscription) {
        return notFoundResponse(res, 'No active subscription found');
      }
      
      return successResponse(res, 200, 'Subscription fetched successfully', subscription);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/subscriptions
   * Create new subscription
   */
  static async create(req, res, next) {
    try {
      const { admin_id, plan_type, start_date, end_date } = req.body;
      
      // Check if admin already has active subscription
      const existing = await Subscription.findByAdminId(admin_id);
      
      if (existing) {
        return conflictResponse(res, 'Admin already has an active subscription');
      }
      
      const subscription = await Subscription.create({
        admin_id,
        plan_type,
        start_date,
        end_date
      });
      
      return successResponse(res, 201, 'Subscription created successfully', subscription);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/subscriptions/:id
   * Update subscription
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { plan_type, start_date, end_date } = req.body;
      
      const subscription = await Subscription.update(id, {
        plan_type,
        start_date,
        end_date
      });
      
      if (!subscription) {
        return notFoundResponse(res, 'Subscription not found');
      }
      
      return successResponse(res, 200, 'Subscription updated successfully', subscription);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubscriptionController;
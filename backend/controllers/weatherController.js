const WeatherAlert = require('../models/WeatherAlert');
const WeatherService = require('../services/weatherService');
const { successResponse, notFoundResponse } = require('../utils/response');

/**
 * Weather Controller
 * Handles weather alerts and weather data
 */
class WeatherController {
  /**
   * GET /api/weather/alerts
   * Get weather alerts for current user
   */
  static async getAlerts(req, res, next) {
    try {
      const farmerId = req.user.role === 'farmer' ? req.user.id : req.query.farmer_id;
      
      let alerts;
      if (farmerId) {
        alerts = await WeatherAlert.findByFarmerId(farmerId);
      } else {
        // Admin/Super Admin can optionally filter by farmer_id
        return successResponse(res, 200, 'Alerts fetched successfully', []);
      }
      
      return successResponse(res, 200, 'Alerts fetched successfully', alerts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/weather/alerts/unread
   * Get unread alerts
   */
  static async getUnreadAlerts(req, res, next) {
    try {
      const alerts = await WeatherAlert.getUnreadAlerts(req.user.id);
      const count = await WeatherAlert.getUnreadCount(req.user.id);
      
      return successResponse(res, 200, 'Unread alerts fetched successfully', {
        alerts,
        count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/weather/alerts/:id/read
   * Mark alert as read
   */
  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const alert = await WeatherAlert.markAsRead(id);
      
      if (!alert) {
        return notFoundResponse(res, 'Alert not found');
      }
      
      return successResponse(res, 200, 'Alert marked as read', alert);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/weather/alerts/read-all
   * Mark all alerts as read
   */
  static async markAllAsRead(req, res, next) {
    try {
      const alerts = await WeatherAlert.markAllAsRead(req.user.id);
      return successResponse(res, 200, 'All alerts marked as read', alerts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/weather/check
   * Check weather and generate alerts (for admins)
   */
  static async checkWeather(req, res, next) {
    try {
      // This would typically be a scheduled job, but admins can trigger manually
      if (req.user.role === 'farmer') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can trigger weather checks'
        });
      }
      
      const count = await WeatherService.generateAlertsForAllFarmers();
      
      return successResponse(res, 200, `Generated ${count} weather alerts`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/weather/forecast
   * Get weather forecast for current user
   */
  static async getForecast(req, res, next) {
    try {
      const user = req.user;
      
      if (!user.location) {
        return successResponse(res, 200, 'No location set', []);
      }
      
      const forecast = await WeatherService.getForecast(user.location, 3);
      return successResponse(res, 200, 'Forecast fetched successfully', forecast);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WeatherController;
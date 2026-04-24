const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse, unauthorizedResponse, conflictResponse } = require('../utils/response');

/**
 * Auth Controller
 * Handles login, registration, and authentication
 */
class AuthController {
  /**
   * POST /api/auth/login
   * User login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findByEmail(email);
      
      if (!user) {
        return unauthorizedResponse(res, 'Invalid email or password');
      }
      
      // Check if user is active
      if (!user.is_active) {
        return unauthorizedResponse(res, 'Account is deactivated');
      }
      
      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return unauthorizedResponse(res, 'Invalid email or password');
      }
      
      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
      
      // Remove password from response
      delete user.password;
      
      return successResponse(res, 200, 'Login successful', {
        user,
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/register
   * Register new user
   */
  static async register(req, res, next) {
    try {
      const { email, password, role, name, phone, location } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      
      if (existingUser) {
        return conflictResponse(res, 'User with this email already exists');
      }
      
      // Create new user
      const user = await User.create({
        email,
        password,
        role: role || 'farmer', // Default to farmer
        name,
        phone,
        location
      });
      
      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
      
      // Remove password from response
      delete user.password;
      
      return successResponse(res, 201, 'User registered successfully', {
        user,
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user
   */
  static async me(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }
      
      delete user.password;
      
      return successResponse(res, 200, 'User fetched successfully', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return errorResponse(res, 400, 'Refresh token is required');
      }
      
      // Verify refresh token
      const decoded = require('../utils/jwt').verifyToken(refreshToken);
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.is_active) {
        return unauthorizedResponse(res, 'Invalid refresh token');
      }
      
      // Generate new tokens
      const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
      const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role });
      
      return successResponse(res, 200, 'Token refreshed successfully', {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      return unauthorizedResponse(res, 'Invalid refresh token');
    }
  }
}

module.exports = AuthController;
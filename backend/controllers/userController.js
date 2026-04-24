const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { successResponse, errorResponse, notFoundResponse, validationErrorResponse } = require('../utils/response');

/**
 * User Controller
 * Handles user CRUD operations
 */
class UserController {
  /**
   * GET /api/users
   * Get all users (filtered by role)
   */
  static async getAll(req, res, next) {
    try {
      const { role } = req.query;
      let users;
      
      if (role) {
        users = await User.findByRole(role);
      } else if (req.user.role === 'super_admin') {
        // Super admin can see all admins
        users = await User.getAllAdmins();
      } else if (req.user.role === 'admin') {
        // Admin can see farmers
        users = await User.getAllFarmers(req.user.id);
      } else {
        return errorResponse(res, 403, 'Insufficient permissions');
      }
      
      // Remove passwords
      users = users.map(u => {
        delete u.password;
        return u;
      });
      
      return successResponse(res, 200, 'Users fetched successfully', users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/farmers
   * Get all farmers (for admin)
   */
  static async getFarmers(req, res, next) {
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
   * GET /api/users/farmers-compliance
   * Get farmers with compliance stats (for admin)
   */
  static async getFarmersWithCompliance(req, res, next) {
    try {
      const farmers = await User.getFarmersWithCompliance(req.user.id);
      
      return successResponse(res, 200, 'Farmers fetched successfully', farmers);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return notFoundResponse(res, 'User not found');
      }
      
      delete user.password;
      
      return successResponse(res, 200, 'User fetched successfully', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users
   * Create new user (Admin/Super Admin only)
   */
  static async create(req, res, next) {
    try {
      const { email, password, role, name, phone, location } = req.body;
      
      // Check if user has permission to create this role
      if (req.user.role === 'admin' && role !== 'farmer') {
        return errorResponse(res, 403, 'Admins can only create farmer accounts');
      }
      
      const user = await User.create({
        email,
        password,
        role,
        name,
        phone,
        location
      });
      
      delete user.password;
      
      return successResponse(res, 201, 'User created successfully', user);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return errorResponse(res, 409, 'User with this email already exists');
      }
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * Update user
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, phone, location, is_active } = req.body;
      
      // Check if user has permission to update
      if (req.user.role === 'farmer' && req.user.id !== parseInt(id)) {
        return errorResponse(res, 403, 'You can only update your own profile');
      }
      
      if (req.user.role === 'admin' && req.user.id !== parseInt(id)) {
        // Check if updating another admin
        const targetUser = await User.findById(id);
        if (targetUser && targetUser.role === 'admin') {
          return errorResponse(res, 403, 'Admins cannot update other admins');
        }
      }
      
      const user = await User.update(id, { name, phone, location, is_active });
      
      if (!user) {
        return notFoundResponse(res, 'User not found');
      }
      
      delete user.password;
      
      return successResponse(res, 200, 'User updated successfully', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Deactivate user (Super Admin only)
   */
  static async deactivate(req, res, next) {
    try {
      const { id } = req.params;
      
      // Cannot deactivate self
      if (req.user.id === parseInt(id)) {
        return errorResponse(res, 400, 'Cannot deactivate your own account');
      }
      
      const user = await User.deactivate(id);
      
      if (!user) {
        return notFoundResponse(res, 'User not found');
      }
      
      return successResponse(res, 200, 'User deactivated successfully', user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
const { forbiddenResponse } = require('../utils/response');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access based on user roles
 */

/**
 * Check if user has required role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbiddenResponse(res, 'User not authenticated');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return forbiddenResponse(res, 'Insufficient permissions');
    }
    
    next();
  };
};

// Specific role middlewares for convenience
const isSuperAdmin = authorize('super_admin');
const isAdmin = authorize('admin', 'super_admin');
const isFarmer = authorize('farmer');
const isAdminOrFarmer = authorize('admin', 'farmer');
const isSuperAdminOrAdmin = authorize('super_admin', 'admin');

module.exports = {
  authorize,
  isSuperAdmin,
  isAdmin,
  isFarmer,
  isAdminOrFarmer,
  isSuperAdminOrAdmin
};
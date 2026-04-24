const { verifyToken } = require('../utils/jwt');
const { unauthorizedResponse } = require('../utils/response');
const db = require('../config/database');

/**
 * JWT Authentication Middleware
 * Validates the access token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'Access token required');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure they still exist and are active
    const result = await db.query(
      'SELECT id, email, role, name, phone, location, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return unauthorizedResponse(res, 'User not found');
    }
    
    const user = result.rows[0];
    
    if (!user.is_active) {
      return unauthorizedResponse(res, 'Account is deactivated');
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Invalid token');
    }
    return unauthorizedResponse(res, 'Authentication failed');
  }
};

module.exports = { authenticate };
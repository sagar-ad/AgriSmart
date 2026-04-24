/**
 * Standard API response format
 */

/**
 * Success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @returns {object} - JSON response
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} errors - Additional error details
 * @returns {object} - JSON response
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 * @param {object} res - Express response object
 * @param {any} errors - Validation errors
 * @returns {object} - JSON response
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 400, 'Validation Error', errors);
};

/**
 * Not found response
 * @param {object} res - Express response object
 * @param {string} message - Not found message
 * @returns {object} - JSON response
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, 404, message);
};

/**
 * Unauthorized response
 * @param {object} res - Express response object
 * @param {string} message - Unauthorized message
 * @returns {object} - JSON response
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, 401, message);
};

/**
 * Forbidden response
 * @param {object} res - Express response object
 * @param {string} message - Forbidden message
 * @returns {object} - JSON response
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, 403, message);
};

/**
 * Conflict response
 * @param {object} res - Express response object
 * @param {string} message - Conflict message
 * @returns {object} - JSON response
 */
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, 409, message);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse
};
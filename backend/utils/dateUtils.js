/**
 * Add days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculate days between two dates
 * @param {Date|string} startDate - Starting date
 * @param {Date|string} endDate - Ending date
 * @returns {number} - Number of days between
 */
const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Parse date from string
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {Date} - Parsed date
 */
const parseDate = (dateString) => {
  return new Date(dateString);
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is today
 */
const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  return d.toDateString() === today.toDateString();
};

/**
 * Get date range for a given DAS (Days After Sowing)
 * @param {Date|string} sowingDate - Sowing date
 * @param {number} das - Days After Sowing
 * @returns {Date} - Due date
 */
const getDueDateFromDAS = (sowingDate, das) => {
  return addDays(sowingDate, das);
};

module.exports = {
  addDays,
  daysBetween,
  formatDate,
  parseDate,
  isToday,
  getDueDateFromDAS
};
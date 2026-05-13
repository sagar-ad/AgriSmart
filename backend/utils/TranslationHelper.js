/**
 * TranslationHelper Utility
 * Used to translate alerts, notifications, and messages
 * based on user's preferred language
 * 
 * This is the core utility for Step C: Weather Alert Translation
 */

const i18next = require('i18next');

// Alert code to message mapping
// These are the core alert codes that can be generated throughout the system
const ALERT_CODES = {
  // Weather alerts
  RAIN_ALERT: 'RAIN_ALERT',
  HEAT_ALERT: 'HEAT_ALERT',
  FLOOD_ALERT: 'FLOOD_ALERT',
  DROUGHT_ALERT: 'DROUGHT_ALERT',
  
  // Task alerts
  TASK_DUE: 'TASK_DUE',
  TASK_OVERDUE: 'TASK_OVERDUE',
  TASK_COMPLETED: 'TASK_COMPLETED',
  
  // Crop alerts
  CROP_DISEASE: 'CROP_DISEASE',
  CROP_HARVEST: 'CROP_HARVEST',
  CROP_IRRIGATION: 'CROP_IRRIGATION',
  
  // System alerts
  WELCOME: 'WELCOME',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  PASSWORD_RESET: 'PASSWORD_RESET'
};

// Severity levels
const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

class TranslationHelper {
  constructor() {
    this.initialized = false;
    this.currentLanguage = 'en';
  }

  /**
   * Initialize the TranslationHelper
   * Loads translations from the i18next configuration
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      await i18next.loadModules();
      this.initialized = true;
      console.log('✓ TranslationHelper initialized');
    } catch (error) {
      console.error('Failed to initialize TranslationHelper:', error);
    }
  }

  /**
   * Translate an alert code to user's language
   * 
   * @param {string} alertCode - The alert code (e.g., 'RAIN_ALERT')
   * @param {object} params - Additional parameters for interpolation
   * @param {string} language - Target language code (en, mr, hi)
   * @returns {string} Translated message
   */
  translate(alertCode, params = {}, language = 'en') {
    // First try direct translation lookup
    const key = `translation.weather.${alertCode}`;
    let translation = i18next.t(key, params);
    
    // If direct lookup fails, try errors namespace
    if (translation === key) {
      translation = i18next.t(`translation.errors.${alertCode}`, params);
    }
    
    // If still not found, generate a generic message
    if (translation === key) {
      translation = this.getGenericMessage(alertCode, params);
    }
    
    return translation;
  }

  /**
   * Generate a weather alert message
   * This is the core function for Step C
   * 
   * @param {string} alertType - Type of alert (rain, heat, flood, drought)
   * @param {object} data - Alert data (severity, date, etc.)
   * @param {string} language - Target language
   * @returns {string} Fully translated alert message
   */
  generateWeatherAlert(alertType, data, language) {
    this.setLanguage(language);
    
    const alertCode = `${alertType.toUpperCase()}_ALERT`;
    const severity = data?.severity || SEVERITY.MEDIUM;
    
    // Build parameters for interpolation
    const params = {
      severity: severity,
      date: data?.date || new Date().toLocaleDateString(language),
      location: data?.location || '',
      temperature: data?.temperature || '',
      rainfall: data?.rainfall || ''
    };
    
    // Get base message from translation
    let message = this.translate(alertCode, params, language);
    
    // Add severity prefix if needed
    if (severity === SEVERITY.HIGH) {
      const warningKey = `translation.weather.${alertCode}_WARNING`;
      const warning = i18next.t(warningKey, params);
      if (warning !== warningKey) {
        message = warning;
      }
    }
    
    return message;
  }

  /**
   * Generate a task notification
   * 
   * @param {string} taskName - Name of the task
   * @param {string} dueDate - Due date
   * @param {string} language - Target language
   * @returns {string} Translated message
   */
  generateTaskNotification(taskName, dueDate, language) {
    this.setLanguage(language);
    
    const params = {
      taskName: taskName,
      dueDate: dueDate
    };
    
    return this.translate('TASK_DUE', params, language);
  }

  /**
   * Set the current language
   * 
   * @param {string} language - Language code
   */
  setLanguage(language) {
    const supported = ['en', 'mr', 'hi'];
    if (supported.includes(language)) {
      this.currentLanguage = language;
    }
  }

  /**
   * Get current language
   * 
   * @returns {string} Current language code
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get generic fallback message when translation not found
   * 
   * @param {string} alertCode - Alert code
   * @param {object} params - Parameters
   * @returns {string} Generic message
   */
  getGenericMessage(alertCode, params = {}) {
    const messages = {
      RAIN_ALERT: 'Rain alerts for your crops',
      HEAT_ALERT: 'Heat alerts for your crops',
      FLOOD_ALERT: 'Flood alerts for your crops',
      DROUGHT_ALERT: 'Drought alerts for your crops',
      TASK_DUE: 'Task due: {taskName}',
      TASK_OVERDUE: 'Task overdue: {taskName}',
      TASK_COMPLETED: 'Task completed: {taskName}'
    };
    
    return messages[alertCode] || `Alert: ${alertCode}`;
  }

  /**
   * Get all available alert codes
   * 
   * @returns {object} Available alert codes
   */
  getAlertCodes() {
    return ALERT_CODES;
  }

  /**
   * Check if an alert code is valid
   * 
   * @param {string} code - Alert code to check
   * @returns {boolean} True if valid
   */
  isValidAlertCode(code) {
    return Object.values(ALERT_CODES).includes(code);
  }

  /**
   * Get supported languages
   * 
   * @returns {string[]} Supported language codes
   */
  getSupportedLanguages() {
    return ['en', 'mr', 'hi'];
  }

  /**
   * Translate an array of items
   * 
   * @param {array} items - Array of items with keys to translate
   * @param {string} keyField - Field containing the translation key
   * @param {string} language - Target language
   * @returns {array} Translated items
   */
  translateArray(items, keyField = 'key', language = 'en') {
    return items.map(item => {
      const translatedItem = { ...item };
      const key = item[keyField];
      
      if (key) {
        translatedItem.message = this.translate(key, item.params || {}, language);
        translatedItem.language = language;
      }
      
      return translatedItem;
    });
  }

  /**
   * Get language name in that language
   * 
   * @param {string} languageCode - Language code
   * @returns {string} Language name
   */
  getLanguageName(languageCode) {
    const names = {
      en: 'English',
      mr: 'मराठी',
      hi: 'हिंदी'
    };
    
    return names[languageCode] || languageCode;
  }
}

// Export singleton instance
module.exports = new TranslationHelper();

// Export class for creating multiple instances
module.exports.TranslationHelper = TranslationHelper;
module.exports.ALERT_CODES = ALERT_CODES;
module.exports.SEVERITY = SEVERITY;
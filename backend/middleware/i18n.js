/**
 * i18n Middleware for Express
 * Handles Accept-Language header for multi-language support
 */

const i18next = require('i18next');
const i18nextMiddleware = require('i18next-express-middleware');
const i18nextFsBackend = require('i18next-node-fs-backend');

// Initialize i18next
i18next
  .use(i18nextFsBackend)
  .init({
    // Translation files directory
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/translation.json'
    },
    // Default language
    fallbackLng: 'en',
    // Supported languages
    supportedLngs: ['en', 'mr', 'hi'],
    // Language detection order
    ns: ['translation'],
    defaultNS: 'translation',
    // Debug mode (disable in production)
    debug: process.env.NODE_ENV !== 'production',
    // Language detection options
    detection: {
      order: ['querystring', 'cookie', 'session', 'header'],
      caches: ['cookie'],
      cookieMinutes: 60 * 24 * 30, // 30 days
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupSession: 'i18next',
      // Header to check for language
      headers: ['accept-language', 'x-agri-language']
    },
    // Interpolation
    interpolation: {
      escapeValue: false,
      format: function(value, format, lng) {
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'uppercase') return value.toUpperCase();
        return value;
      }
    }
  });

module.exports = {
  // i18next instance
  i18next,
  // Middleware for Express
  middleware: i18nextMiddleware.handle(i18next),
  
  /**
   * Get the language from request
   * Checks Accept-Language header, query params, or stored preference
   */
  getLanguage: function(req) {
    const lang = i18nextMiddleware.languageGetter(req);
    return lang || 'en';
  },
  
  /**
   * Initialize the middleware (called once during app setup)
   */
  initMiddleware: function(app) {
    app.use(i18nextMiddleware.handle(i18next, {
      ignoreRoutes: ['/health', '/api/health'],
      removeLngFromUrl: false
    }));
    
    console.log('✓ i18next middleware initialized');
  },
  
  /**
   * Change language endpoint (can be called via API)
   */
  changeLanguage: function(req, res) {
    const { lng } = req.body;
    
    if (!lng || !['en', 'mr', 'hi'].includes(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language. Use: en, mr, or hi'
      });
    }
    
    // Set the language in i18next
    i18next.changeLanguage(lng, function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error changing language'
        });
      }
      
      res.cookie('i18next', lng, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true
      });
      
      res.json({
        success: true,
        message: 'Language changed to ' + lng
      });
    });
  }
};
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginValidation, registerValidation } = require('../validators/authValidator');

// Public routes
router.post('/login', loginValidation, AuthController.login);
router.post('/register', registerValidation, AuthController.register);

// Protected routes
router.get('/me', authenticate, AuthController.me);
router.post('/refresh', AuthController.refresh);

module.exports = router;
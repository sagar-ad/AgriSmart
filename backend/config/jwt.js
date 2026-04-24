module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'agrismart-secret-key-change-in-production',
    expiresIn: '15m',
    refreshExpiresIn: '7d'
  },
  bcrypt: {
    saltRounds: 12
  }
};
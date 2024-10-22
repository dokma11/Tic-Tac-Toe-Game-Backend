const express = require('express');
const auth = require('../controllers/authController').default;
const users = require('../controllers/userController').default;

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/auth', auth.getRouter());
    app.use('/api/users', users.getRouter());
}

import express, { Express } from 'express';
import auth from '../controllers/authController';
import users from '../controllers/userController';
import games from '../controllers/gameController';
import moves from '../controllers/moveController';

module.exports = function(app: Express): void {
    app.use(express.json());
    app.use('/api/auth', auth.getRouter());
    app.use('/api/users', users.getRouter());
    app.use('/api/games', games.getRouter());
    app.use('/api/moves', moves.getRouter());
}

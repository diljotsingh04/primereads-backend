const { Router } = require('express');
const { signup, signin, validateUser, logout } = require('../controllers/auth');
const { googleAuth } = require('../controllers/googleAuth');
const router = Router();

// Route for /auth/signin
router.post('/signin', signin);
// Route for /auth/signup
router.post('/signup', signup);
// Route for /auth/me
router.post('/me', validateUser);
// Router for /auth/logout
router.get('/logout', logout);
// Router for /auth/google
router.post('/google', googleAuth);


module.exports = router;
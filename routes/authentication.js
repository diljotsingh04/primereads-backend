const { Router } = require('express');
const { signup, signin, validateUser } = require('../controllers/auth');

const router = Router();

// Route for /auth/me
router.post('/me', validateUser);
// Route for /auth/signin
router.post('/signin', signin);
// Route for /auth/signup
router.post('/signup', signup);

module.exports = router;
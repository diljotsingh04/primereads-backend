const { Router } = require('express');
const { signup, signin, validateUser, logout, getData, unlockPost, refer, update, checkout, validateTransaction, setBalance } = require('../controllers/auth');
const { googleAuth } = require('../controllers/googleAuth');
const { matchCookieWithId } = require('../middlewares/matchCookieWithId');
const { authUser } = require('../middlewares/authUser');
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
// Route for /auth/getbalance/userid
router.get('/getuserdata/:userId', matchCookieWithId, getData);
// Route for /auth/unlockPost/:postId
router.post('/unlockpost/:postId', authUser, unlockPost);
// Route for /auth/refer/
router.put('/refer', refer);
// Route for /auth/update
router.put('/update', authUser, update);
// Route for /auth/stripe-checkout-session
router.post('/stripe-checkout-session', authUser, checkout);
// Route for /auth/validatetransaction
router.post('/validate-transaction', authUser, validateTransaction);

module.exports = router;
const { Router } = require('express');
const { getAllPosts, addBlog } = require('../controllers/post');
const { authUser } = require('../middlewares/authUser');


const router = Router();

router.get('/', authUser, getAllPosts);

router.post('/addblog', authUser, addBlog);

module.exports = router;
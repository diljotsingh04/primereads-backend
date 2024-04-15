const { Router } = require('express');
const { getAllPosts, addBlog } = require('../controllers/post');
const { authUser } = require('../middlewares/authUser');
const { titleCheck } = require('../middlewares/titleCheck');


const router = Router();

router.get('/', authUser, getAllPosts);

router.post('/addblog', [authUser, titleCheck], addBlog);

module.exports = router;
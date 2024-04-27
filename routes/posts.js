const { Router } = require('express');
const { getAllPosts, addBlog, editBlog, readBlog } = require('../controllers/post');
const { authUser } = require('../middlewares/authUser');
const { titleCheck } = require('../middlewares/titleCheck');


const router = Router();

// posts/getpost
router.post('/getpost', authUser, getAllPosts);
// posts/addblog
router.post('/addblog', [authUser, titleCheck], addBlog);
// posts/editblog
router.post('/editblog', authUser, editBlog);
// posts/readblog
router.post('/readblog', authUser, readBlog)

module.exports = router;
const { Post } = require("../db/database");
const { PostDataValidation } = require("../validation/dataValidation");
const { Decode } = require("../validation/jwttokens");

const getAllPosts = async (req, res) => {
      const startIndex = parseInt(req.query.startIndex) || 0;
      const limit = parseInt(req.query.limit) || 9;
      const sortDirection = (req.query.order === 'asc') ? 1 : -1;

      try{
            const postData = await Post.find({
                  ...(req.body.hashtagSearch && {hashtags: {$in: req.body.hashtagSearch}}),
                  ...(req.query.userId && { refTo: req.query.userId }),
                  ...(req.query.postId && { _id: req.query.postId }),
                  ...(req.query.searchTerm && {
                        $or: [
                              { title: { $regex: req.query.searchTerm, $option: 'i' } },
                              { content: { $regex: req.query.searchTerm, $option: 'i' } },
                        ],
                  })
            }).sort({ updatedAt: sortDirection }).skip(startIndex).limit(limit);
            
            const totalPosts = await Post.countDocuments();

            return res.status(200).send({
                  success: true,
                  postData,
                  totalPosts
            })
      }
      catch(e){
            return res.status(400).send({
                  success: false,
                  message: 'Failed to get Posts'
            })
      }
};

const addBlog = async (req, res) => {
      const postData = req.body;

      const cookieData = Decode(req.cookies['access-token']);


      if (!cookieData) {
            return res.send({
                  success: false,
                  message: 'Invalid Token'
            })
      }

      const verifiedData = PostDataValidation.safeParse(postData);
      if (!verifiedData.success) {
            return res.send({
                  success: false,
                  message: 'Invalid Post Data'
            })
      }


      try {
            const writePost = await Post.create({ ...verifiedData.data, author: cookieData.name, refTo: cookieData.id });

            return res.send({
                  success: true,
                  message: 'Post Added Successfully'
            })
      }
      catch (e) {
            return res.send({
                  success: false,
                  message: 'Failed to add post'
            })
      }
}

module.exports = {
      getAllPosts,
      addBlog
}
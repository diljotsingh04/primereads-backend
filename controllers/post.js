const { Post } = require("../db/database");
const { PostDataValidation } = require("../validation/dataValidation");
const { Decode } = require("../validation/jwttokens");

const getAllPosts = (req, res) => {
      return res.send({
            message: 'You got all the posts'
      });
};

const addBlog = async (req, res) => {
      const postData = req.body;

      const cookieData = Decode(req.cookies['access-token']);


      if(!cookieData){
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


      try{
            const writePost = await Post.create({...verifiedData.data, author: cookieData.name, refTo: cookieData.id});

            return res.send({
                  success: true,
                  message: 'Post Added Successfully'
            })
      }
      catch(e){
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
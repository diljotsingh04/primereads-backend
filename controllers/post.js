const { Post } = require("../db/database");
const { Decode } = require("../validation/jwttokens");

const getAllPosts = (req, res) => {
      return res.send({
            message: 'You got all the posts'
      });
};

const addBlog = async (req, res) => {
      const postData = req.body;
      const headers = Decode(req.headers.authorization);

      if(!headers){
            return res.send({
                  message: 'Invalid Token'
            })
      }

      const verifiedData = postData;  // @todo:- add zod validation


      try{
            const writePost = await Post.create({...verifiedData, refTo: headers.id});

            return res.send({
                  message: 'Post Added Successfully'
            })
      }
      catch(e){
            return res.send({
                  message: 'Failed in adding post'
            })
      }
}

module.exports = {
      getAllPosts,
      addBlog
}
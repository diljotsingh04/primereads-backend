const { Post } = require("../db/database");

const titleCheck = async (req, res, next) => {
      const title = req.body.title;

      try{
            const findTitle = await Post.findOne({title});
            if(findTitle){
                  res.send({
                        success: false,
                        message: 'Post with this title already exists'
                  })
            }
            else{
                  next();
            }
      }
      catch(e){
            return res.status(400).send({
                  success: false,
                  message: 'Enter a valid Title'
            })
      }
}

module.exports = {
      titleCheck
}
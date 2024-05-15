const { Post, User, ContUsForm } = require("../db/database");
const { PostDataValidation } = require("../validation/dataValidation");
const { Decode } = require("../validation/jwttokens");
const { unlockPost } = require("./auth");

const getAllPosts = async (req, res) => {
      const startIndex = parseInt(req.query.startIndex) || 0;
      const limit = parseInt(req.query.limit) || 9;
      const sortDirection = (req.query.order === 'asc') ? 1 : -1;
      const token = Decode(req.cookies['access-token']);

      try {
            // finding user
            const userData = await User.findOne({ _id: token.id });
            // finding post
            const postData = await Post.find({
                  ...(req.body.hashtagSearch && { hashtags: { $in: req.body.hashtagSearch } }),
                  ...(req.query.userId && { refTo: req.query.userId }),
                  ...(req.query.postId && { _id: req.query.postId }),
                  ...(req.query.searchTerm && {
                        $or: [
                              { title: { $regex: req.query.searchTerm, $option: 'i' } },
                              { content: { $regex: req.query.searchTerm, $option: 'i' } },
                        ],
                  })
            }).lean().sort({ updatedAt: sortDirection }).skip(startIndex).limit(limit);

            const totalPosts = (req.query.userId) ? await Post.countDocuments({ refTo: req.query.userId }) : await Post.countDocuments();


            const updatedAccordingToUser = postData.map(post => ({
                  ...post,
                  unlocked: userData && userData.unlockedBlogs.includes(post._id),
                  isOwner: userData && userData._id.toString() === post.refTo.toString()
            }))


            return res.status(200).send({
                  success: true,
                  postData: updatedAccordingToUser,
                  totalPosts
            })
      }
      catch (e) {
            console.log(e)
            return res.status(400).send({
                  success: false,
                  message: 'Failed to get Posts'
            })
      }
};

const getUnlockedBlogs = async (req, res) => {

      const token = Decode(req.cookies['access-token']);

      try {
            // finding user
            const userData = await User.findOne({ _id: token.id });
            // finding post
            const postData = await Post.find({ _id: { $in: userData.unlockedBlogs } }).lean();

            // Create a map of post IDs to their index in the unlockedBlogs array
            const postIdToIndexMap = userData.unlockedBlogs.reduce((map, postId, index) => {
                  map[postId] = index;
                  return map;
            }, {});

            // Sort the postData array based on the index in the unlockedBlogs array
            const unlockedBlogs = postData.sort((a, b) => {
                  const indexA = postIdToIndexMap[a._id];
                  const indexB = postIdToIndexMap[b._id];
                  return indexA - indexB;
            }).map(post => ({ ...post, unlocked: true }));

            return res.status(200).send({
                  success: true,
                  postData: unlockedBlogs,
            });
      }
      catch (e) {
            console.log(e)
            return res.status(400).send({
                  success: false,
                  message: 'Failed to get Posts'
            })
      }
}

const readBlog = async (req, res) => {
      const token = Decode(req.cookies['access-token']);
      const postId = req.query.postId;

      try {
            // finding user
            const userData = await User.findOne({ _id: token.id });
            // finding post
            const postData = await Post.findOne({ _id: postId });

            if (userData.unlockedBlogs.includes(postId) || userData._id.toString() === postData.refTo.toString()) {
                  const postData = await Post.findOne({
                        ...(req.query.postId && { _id: req.query.postId }),
                  });

                  return res.status(200).send({
                        success: true,
                        postData,
                  })
            }
            else {
                  return res.status(200).send({
                        success: false,
                        message: 'Unlock this post to read it'
                  })
            }
      }
      catch (e) {
            console.log(e)
            return res.status(400).send({
                  success: false,
                  message: 'Failed to get Posts'
            })
      }
}

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

const editBlog = async (req, res) => {

      const dataToEdit = req.body;
      const cookieData = Decode(req.cookies['access-token']);

      // Check if the access token is valid
      if (!cookieData) {
            return res.json({
                  success: false,
                  message: 'Invalid Token'
            });
      }

      try {
            // Check if the user is authorized to edit the post
            if (dataToEdit.refTo !== cookieData.id) {
                  return res.json({
                        success: false,
                        message: 'You are not authorized to edit this post'
                  });
            }

            // Validate the updated post data
            const validatedData = PostDataValidation.safeParse(dataToEdit);

            // If the validation fails, return an error response
            if (!validatedData.success) {
                  return res.json({
                        success: false,
                        message: 'Invalid Post Data'
                  });
            }

            const updatePost = await Post.findByIdAndUpdate(
                  dataToEdit._id,
                  {
                        $set: {
                              title: dataToEdit.title,
                              hashtags: dataToEdit.hashtags,
                              image: dataToEdit.image,
                              content: dataToEdit.content
                        }
                  },
                  { new: true }
            );

            return res.status(200).json({
                  success: true,
                  message: 'Blog Updated Successfully'
            });

      } catch (error) {
            // If an error occurs, return an error response
            console.log(error)
            return res.json({
                  success: false,
                  message: 'Failed to update post'
            });
      }
}

const contactus = async (req, res) => {
      const cookieData = Decode(req.cookies['access-token']);

      if (!cookieData) {
            return res.send({
                  success: false,
                  message: 'Invalid Token'
            })
      }

      try {
            const { fname, lname, email, subject, message } = req.body;
            
            const addForm = await ContUsForm.create({
                  userId: cookieData.id,
                  fname,
                  lname,
                  email,
                  subject,
                  message
            })

            return res.send({ 
                  success: true,
                  message: 'Contact form submitted successfully' 
            });
      } catch (error) {
            return res.send({
                  success: false,
                  message: 'Failed to Submit Form'
            });
      }
}

module.exports = {
      getAllPosts,
      addBlog,
      editBlog,
      readBlog,
      getUnlockedBlogs,
      contactus
}
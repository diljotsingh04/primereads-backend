const mongoose = require('mongoose');
require('dotenv').config();

// Database connectin string
mongoose.connect(process.env.DATABASE_URL)
      .then(() => console.log('Connected With Database Successfully'))
      .catch(() => console.log('Error Connecting with Database'))

// User's Schema
const userSchema = mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      balance: Number,
      posts: [mongoose.Schema.Types.ObjectId]
});

// Post's Schema
const postSchema = mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      thumbnail: { type: String },
      author: { type: String },
      hashtags: [String],
      likes: Number,
      dislikes: Number,
      comments: [{name: String, comment: String}],
      refTo: mongoose.Schema.Types.ObjectId
}, { timestamps: true } );


// User's Model
const User = mongoose.model('user', userSchema);
// Post's Model
const Post = mongoose.model('posts', postSchema)

module.exports = {
      User,
      Post
}
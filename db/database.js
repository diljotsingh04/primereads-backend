const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL)
      .then(() => console.log('Connected With Database Successfully'))
      .catch(() => console.log('Error Connecting with Database'))


const userSchema = mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      posts: [mongoose.Schema.Types.ObjectId]
});

// post schema
// title,
// description,
// thumbnail,
// author,
// time of creation
// hashtags
// likes,
// dislikes
// comments

const User = mongoose.model('user', userSchema);

module.exports = {
      User
}
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
      userImage: { type: String, default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnfAxGV-fZxGL9elM_hQ2tp7skLeSwMyUiwo4lMm1zyA&s" },
      balance: Number,
      unlockedBlogs: [mongoose.Schema.Types.ObjectId]
});

// Post's Schema
const postSchema = mongoose.Schema({
      title: { type: String, required: true },
      content: { type: String, required: true },
      image: { type: String },
      author: { type: String },
      hashtags: [String],
      refTo: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

// Transaction buffer Schema
const transactionBSchema = mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      amount: Number
}, { timestamps: true });

// Contactus schema
const contusFormSchema = mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      fname: String,
      lname: String,
      email: String,
      subject: String,
      message: String
})

// User's Model
const User = mongoose.model('user', userSchema);
// Post's Model
const Post = mongoose.model('posts', postSchema);
// tb Model
const TransBuff = mongoose.model('transaction_buffer', transactionBSchema);
// contactus model
const ContUsForm = mongoose.model('contact_us', contusFormSchema);

module.exports = {
      User,
      Post,
      TransBuff,
      ContUsForm
}
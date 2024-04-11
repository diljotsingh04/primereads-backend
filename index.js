const express = require('express');
const cookieParser = require('cookie-parser'); 
const authentication = require('./routes/authentication');
const posts = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.get('/', (req, res) => {
      return res.send({
            message: 'Server is Healthy'
      });
});

app.use('/auth', authentication);

// app.use('/posts', posts);

// server port
app.listen(PORT, () => 
      console.log('Server running on ' + PORT)
);
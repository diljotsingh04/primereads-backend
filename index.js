const express = require('express');
const cookieParser = require('cookie-parser');
const authentication = require('./routes/authentication');
const posts = require('./routes/posts');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.ORIGINS.split(",").map(item=>item.trim()), credentials: true }));

// routes
app.get('/', (req, res) => {
      return res.send({
            message: 'Server is Healthy'
      });
});

app.use('/auth', authentication);
app.use('/posts', posts);


// apis to be deleted later
app.get("/getcookie", (req, res) => {

      res.send({
            message: 'got request',
            cookie: req.cookies['access-token']
      });
});


// server port
app.listen(PORT, () =>
      console.log('Server running on ' + PORT)
);
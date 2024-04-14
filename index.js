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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// routes
app.get('/', (req, res) => {
      return res.send({
            message: 'Server is Healthy'
      });
});

app.use('/auth', authentication);


// apis to be deleted later
app.get("/getcookie", (req, res) => {

      res.send({
            message: 'got request',
            cookie: req.cookies['access-token']
      });
});

app.get("/clearcookie", (req, res) => {
      res.clearCookie('access-token').send({
            success: true,
            message: 'cookies cleared successfully'
      })
})

// app.use('/posts', posts);

// server port
app.listen(PORT, () =>
      console.log('Server running on ' + PORT)
);
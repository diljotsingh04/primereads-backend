const express = require('express');
const { signup, signin } = require('./controllers/auth');
const authentication = require('./routes/authentication');

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());

// routes
app.get('/', (req, res) => {
      return res.send({
            message: 'Server is Healthy'
      });
});

app.post('/signup', signup);

app.post('/signin', signin);

app.get('/auth', authentication);

app.listen(PORT, () => 
      console.log('Server running on ' + PORT)
);
const jwt = require('jsonwebtoken')
require('dotenv').config();


const Sign = (id, name, email) =>{
      const token = jwt.sign(
            {id, name, email},process.env.JWT_SECRET_KEY
      );

      return token;
}

module.exports = {
      Sign
}
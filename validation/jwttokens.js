const jwt = require('jsonwebtoken')
require('dotenv').config();

// This is the key to sign and verify data
const key = process.env.JWT_SECRET_KEY;

// Function to create token from user id, name and email
const Sign = (id, name, email) =>{
      const token = jwt.sign(
            {id, name, email}, key);

      return token;
}

// Function to verify the user's token
const Verify = (bToken) =>{
      try{
            const token = bToken.split(' ')[1];
            
            const verifyToken = jwt.verify(token, key);

            if(verifyToken){
                  return true;
            }
      }
      catch(e){
            return false;
      }
}

const Decode = (bToken) =>{
      try{
            const token = bToken.split(' ')[1];

            const decodeToken = jwt.decode(token);

            return decodeToken;
      }
      catch(e){
            return null;
      }
}

module.exports = {
      Sign,
      Verify,
      Decode
}
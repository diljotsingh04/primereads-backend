const { User } = require('../db/database');
const { SignupValidation, SigninValidation } = require('../validation/dataValidation');
const { Sign, Verify } = require('../validation/jwttokens');

// Signup Controller
const signup = async (req, res) => {
      const userData = req.body;
      const validUserData = SignupValidation.safeParse(userData);
      if (!validUserData.success) {
            return res.send({
                  message: 'Invalid Credentials'
            })
      }

      try {

            const newUser = await User.create({
                  name: validUserData.data.name,
                  email: validUserData.data.email,
                  password: validUserData.data.password,
                  balance: 10
            });

            const token = Sign(newUser._id, newUser.name, newUser.email);

            return res.send({ 
                  token
            });
      }
      catch (e) {
            return res.send({
                  message: 'Email Already Exists'
            });
      }
}

// SignIn Controller
const signin = async(req, res)=>{
      const userData = req.body;
      const validData = SigninValidation.safeParse(userData);

      if(!validData.success){
            return res.send({
                  message: 'Invalid Credentials'
            });
      }

      try{
            const findUser = await User.findOne(validData.data);
            const token = Sign(findUser._id, findUser.name, findUser.email);

            return res.send({
                  token
            });
      }
      catch(e){
            return res.send({
                  message: 'Invalid Email and Password'
            });
      }
}

// Controller to validate user
const validateUser = (req, res) =>{
      const bToken = req.headers.authorization;

      const verifyToken = Verify(bToken);

      return res.send(verifyToken);
}

module.exports = {
      signup,
      signin,
      validateUser
}
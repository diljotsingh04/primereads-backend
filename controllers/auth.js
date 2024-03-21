const { User } = require('../db/database');
const { SignupValidation, SigninValidation } = require('../validation/dataValidation');
const { Sign } = require('../validation/jwttokens');

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
                  password: validUserData.data.password
            });

            // adding jsonwebtokens
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

module.exports = {
      signup,
      signin
}
const { User } = require('../db/database');
const { SignupValidation, SigninValidation } = require('../validation/dataValidation');
const { Sign, Verify } = require('../validation/jwttokens');

// Signup Controller
const signup = async (req, res) => {
      const userData = req.body;
      // console.log(userData)
      const validUserData = SignupValidation.safeParse(userData);
      if (!validUserData.success) {
            return res.send({
                  success: false,
                  message: 'Invalid Credentials'
            })
      }

      try {

            const newUser = await User.create({
                  name: validUserData.data.name,
                  email: validUserData.data.email,
                  password: validUserData.data.password,
                  userImage: validUserData.data.userImage,
                  balance: 10
            });

            const token = Sign(newUser._id, newUser.name, newUser.email);

            const { password, balance, ...rest } = newUser._doc;

            return res.status(200).cookie('access-token', token, {
                  httpOnly: true
            }).send({
                  success: true,
                  message: 'SignUp Successful',
                  ...rest
            });
      }
      catch (e) {
            return res.send({
                  success: false,
                  message: 'Email Already Exists'
            });
      }
}

// SignIn Controller
const signin = async (req, res) => {
      const userData = req.body;
      const validData = SigninValidation.safeParse(userData);

      if (!validData.success) {
            return res.send({
                  success: false,
                  message: 'Invalid Credentials'
            });
      }

      try {
            const findUser = await User.findOne(validData.data);
            const token = Sign(findUser._id, findUser.name, findUser.email);

            const { password, balance, ...rest } = findUser._doc;

            return res.status(200).cookie('access-token', token).send({
                  success: true,
                  message: 'SignIn Successful',
                  ...rest
            });
      }
      catch (e) {
            return res.send({
                  success: false,
                  message: 'Invalid Email and Password'
            });
      }
}

// Controller to validate user
const validateUser = (req, res) => {
      const token = req.cookies['access-token'];

      const verifyToken = Verify(token);
      return res.status(200).send(verifyToken);
}

// Controller to logout the user
const logout = (req, res) => {
      return res.status(200).clearCookie('access-token').send({
            success: true,
            message: 'Successfully Logout'
      })
}

const getBalance = async (req, res) => {

      const userId = req.params.userId;

      try {
            const user = await User.findOne({ _id: userId })
            if (user) {
                  
                  return res.send({
                        success: true,
                        balance: user.balance
                  });
            }
            else {
                  return res.send({
                        success: false,
                        message: 'User not found'
                  });
            }
      } catch (e) {
            return res.send({
                  success: false,
                  message: 'Failed to fetch balance'
            });
      }
}

module.exports = {
      signup,
      signin,
      validateUser,
      logout,
      getBalance
}
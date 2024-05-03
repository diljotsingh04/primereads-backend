const { User } = require('../db/database');
const { Sign } = require('../validation/jwttokens');

const googleAuth = async (req, res) => {

    const { name, email, userImage } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            const token = Sign(user._id, user.name, user.email);
            const { password, balance, ...rest } = user._doc;

            return res.status(200).cookie('access-token', token).send({
                success: true,
                message: 'SignIn Successful',
                newUser: false,
                ...rest
            });
        }
        else {
            const createdPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const newUser = await User.create({
                name: name,
                email: email,
                password: createdPassword,
                userImage: userImage,
                balance: 10
            });

            const token = Sign(newUser._id, newUser.name, newUser.email);

            const { password, balance, ...rest } = newUser._doc;

            return res.status(200).cookie('access-token', token, {
                httpOnly: true
            }).send({
                success: true,
                message: 'SignUp Successful',
                newUser: true,
                ...rest
            });
        }
    } catch (e) {
        res.send({
            success: false,
            message: 'Failed to Signup try another method'
        });
    }

}

module.exports = {
    googleAuth
}
const { User } = require('../db/database');
const { SignupValidation, SigninValidation } = require('../validation/dataValidation');
const { Sign, Verify, Decode } = require('../validation/jwttokens');

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

const getData = async (req, res) => {

    const userId = req.params.userId;

    try {
        const user = await User.findOne({ _id: userId });
        const { password, ...rest } = user._doc;
        if (user) {
            return res.send({
                success: true,
                ...rest
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

const unlockPost = async (req, res) => {
    const postId = req.params.postId; // Assuming you're using Express.js and postId is extracted from the route parameter
    const token = Decode(req.cookies['access-token'])

    try {
        // Find the user by ID and update the unlockedBlogs array
        const user = await User.findById(token.id); // Assuming you have access to the authenticated user's ID through authUser middleware
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if the post is already unlocked
        if (user.unlockedBlogs.includes(postId)) {
            return res.json({ success: false, message: 'Post is already unlocked' });
        }

        if (user.balance <= 0) {
            return res.send({
                success: false,
                message: 'Insufficient balance'
            })
        }

        user.balance -= 1;
        // Add the postId to the unlockedBlogs array
        user.unlockedBlogs.unshift(postId);
        await user.save();

        return res.status(200).json({ success: true, message: 'Post Unlocked' });
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Internal Server Error' });
    }

}
const refer = async (req, res) => {
    const prevUserId = req.body.prevuserid;
    const curUserId = req.body.curuserid;

    try {

        const prevUserBalUpdate = await User.updateOne(
            { _id: prevUserId },
            {
                $inc: { balance: 10 }
            }
        );

        const curUserBalUpdate = await User.updateOne(
            { _id: curUserId },
            {
                $inc: { balance: 10 }
            }
        );

        return res.status(200).send({
            success: true,
            message: 'Balance updated successfully'
        });

    } catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: 'Failed to add Balance'
        })
    }

    
}

module.exports = {
    signup,
    signin,
    validateUser,
    logout,
    getData,
    unlockPost,
    refer
}
const { User, TransBuff } = require('../db/database');
const { SignupValidation, SigninValidation } = require('../validation/dataValidation');
const { Sign, Verify, Decode } = require('../validation/jwttokens');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

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
            httpOnly: true,
            sameSite: 'none', // Adjust as necessary
            secure: true, // For HTTPS environments
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

        return res.status(200).cookie('access-token', token,{
            httpOnly: true,
            sameSite: 'none', // Adjust as necessary
            secure: true, // For HTTPS environments
        }).send({
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

// Controller to get details to user
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

// Controller to unlock the post
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

// Controller to add bonus to both accounts
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

// Controller to update user profile
const update = async (req, res) => {
    const updateData = req.body;
    const token = Decode(req.cookies['access-token']);

    if (req.body.name === "") {
        return res.send({
            success: false,
            message: 'Name cannot be empty'
        });
    }
    if (req.body.password === "") {
        return res.send({
            success: false,
            message: 'Password cannot be empty'
        });
    }
    if (req.body.password && req.body.password.length < 6) {
        return res.send({
            success: false,
            message: 'Password cannot be less than 6 characters'
        });
    }
    
    try {
        // Fetch the existing user data
        const existingUser = await User.findById(token.id);

        // Update fields from request body if present, otherwise retain previous values
        if (updateData.name && updateData.name !== undefined && updateData.name !== "") {
            existingUser.name = updateData.name;
        }
        if (updateData.password && updateData.password !== undefined && updateData.password !== "") {
            existingUser.password = updateData.password;
        }
        if (updateData.userImage && updateData.userImage !== undefined) {
            existingUser.userImage = updateData.userImage;
        }

        // Save the updated user
        const updateUser = await existingUser.save();

        const { password, ...rest } = updateUser._doc;

        return res.status(200).send({
            success: true,
            ...rest
        });

    } catch (error) {
        console.log(error)
        return res.send({
            success: false,
            message: 'Failed to update'
        });
    }
}

// Controller for stripe checkout session
const checkout = async (req, res) => {
    const { products } = req.body;
    const token = Decode(req.cookies['access-token']);

    const lineItems = products.map(product => ({
        price_data: {
            currency: "inr",
            product_data: {
                name: product.name,
                images: ["https://clipart-library.com/images/rijGxariR.jpg"]
            },
            unit_amount: Math.round(product.price * 100)
        },
        quantity: 1
    }));

    // adding token id and amount in database
    try{
        const transBuff = await TransBuff.create({
            userId: token.id,
            amount: products[0].price
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `http://localhost:5173/success?transaction_id=${transBuff._id}`,
            cancel_url: `http://localhost:5173/failure?transaction_id=${transBuff._id}`,
        })
    
        return res.send({ id: session.id });
    }
    catch(e){
        console.log(e)
        return res.send({
            success: false,
            message: 'Failed to store transaction id'
        })
    }
}

// Controller for validation transaction id
const validateTransaction = async (req, res) => {
    const {transId, isFail} = req.body;
    const token = Decode(req.cookies['access-token']);

    try{
        const getTransaction = await TransBuff.findOne({_id: transId});

        if(getTransaction && getTransaction.userId.toString() === token.id && !isFail){
            const deleteTrans = await TransBuff.deleteOne({_id: transId});

            const setBalance = await User.findOneAndUpdate(
                { _id: token.id },
                { $inc: { balance: getTransaction.amount } },
                { new: true }
            );

            return res.send({
                success: true, 
                amount: setBalance.balance,
                message: 'Transaction is valid'
            });
        }
        else if(getTransaction){
            const deleteTrans = await TransBuff.deleteOne({_id: transId});

            return res.send({
                success: true, 
                message: 'Transaction failed'
            });
        }
        else{
            return res.send({
                success: false, 
                message: 'Invalid transaction'
            });
        }
    }
    catch(e){
        return res.send({
            success: false, 
            message: 'Failed to get transaction'
        });
    }
}


module.exports = {
    signup,
    signin,
    validateUser,
    logout,
    getData,
    unlockPost,
    refer,
    update,
    checkout,
    validateTransaction
}
const { Decode } = require("../validation/jwttokens");


const matchCookieWithId = (req, res, next) => {

    try {
        const cookieData = Decode(req.cookies['access-token']);
        // console.log(req.cookies," from matchcookiewithid");

        const userId = req.params.userId;

        if (cookieData.id !== userId) {
            return res.send({
                success: false,
                message: 'Invalid token'
            });
        }
        else {
            next();
        }
    }
    catch (e) {
        return res.send({
            success: false,
            message: 'Try Login / SignUp'
        })
    }
}

module.exports = {
    matchCookieWithId
}
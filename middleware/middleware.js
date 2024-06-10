const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
require("dotenv").config();
exports.authorizationToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.send({ message: "wrong token", code: 0 });
    }

    // Google Token
    const isGoogleToken = token.startsWith('Google ');
    if (isGoogleToken) {
        const googleToken = token.substring('Google '.length);

        // Xác thực token Google
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        async function verify() {
            try {
                const ticket = await client.verifyIdToken({
                    idToken: googleToken,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                console.log("=+=+=+=+=+=+=+===========");
                console.log(payload);
                // payload chứa thông tin người dùng từ token Google
                return res.send({ data: payload });
            } catch (e) {
                return res.send({ message: "wrong token", code: 0 });
            }
        }
        verify().catch(console.error);
    }
    else {
        // Default Token
        try {
            req.data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            next();
        } catch (e) {
            return res.send({ message: "wrong token", code: 0 });
        }
    }
}

exports.checkPermission = (req,res,next)=>{
    const token = req.header('Authorization');
    if (!token) {
        return res.send({message: "wrong token", code: 0});
    }
    try {
        let data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(data);
        if(data.role === "Admin"){
            next();
        }else {
            return res.send({message:"you do not have access", code: 0});
        }
    } catch (e) {
        return res.send({message: "wrong token", code: 0});
    }
}

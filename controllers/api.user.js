const UserModel = require("../models/model.user");
const UserTempModel = require("../models/model.user.temp");
const { ObjectId } = require('mongodb');
const UploadFile = require("../models/uploadFile");
const moment = require("moment-timezone");
const { sendOTPByEmail, sendOTPByEmailGetPass, sendNewPassByEmailGetPass } = require("../models/otp");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const match = [
    "image/jpeg",
    "image/*",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/jp2",
    "image/heif",
];
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneNumberRegex = /^(?:\+84|0)[1-9]\d{8}$/;
exports.addUser = async (req, res) => {
    let file = req.file;
    let password = req.body.password;
    let full_name = req.body.full_name;
    let phone_number = req.body.phone_number;
    let address = req.body.address;
    let email = req.body.email;
    let role = req.body.role;

    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (password == null) {
        return res.send({ message: "Password is required", code: 0 });
    }
    if (!passwordRegex.test(password)) {
        return res.send({
            message:
                "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
            code: 0,
        });
    }
    if (phone_number == null) {
        return res.send({ message: "Phone number is required", code: 0 });
    }
    if (!phoneNumberRegex.test(phone_number)) {
        return res.send({
            message: "The phone number is not in the correct format",
            code: 0,
        });
    }
    if (email == null) {
        return res.send({ message: "Email is required", code: 0 });
    }
    if (!emailRegex.test(email)) {
        return res.send({
            message: "The email is not in the correct format",
            code: 0,
        });
    }
    if (full_name == null) {
        return res.send({
            message: "The full_name is required",
            code: 0,
        });
    }
    try {
        let userPhone = await UserModel.userModel.findOne({
            phone_number: phone_number,
        });
        let userEmail = await UserModel.userModel.findOne({ email: email });
        if (userPhone) {
            return res.send({ message: "phone number already exists", code: 0 });
        }
        if (userEmail) {
            return res.send({ message: "email already exists", code: 0 });
        }
        if (file == null) {
            let userTemp = new UserTempModel.userTemModel({
                password: password,
                full_name: full_name,
                phone_number: phone_number,
                date: date_time,
                email: email,
                address: address,
                role:role
            });
            let index = sendOTPByEmail(email);
            if (index === 0) {
                return res.send({ message: "Register user fail", code: 0 });
            } else {
                userTemp.otp = index;
                await userTemp.save();
                return res.send({
                    message: "Please verify your account",
                    id: userTemp._id,
                    code: 1,
                });
            }
        } else {
            if (match.indexOf(file.mimetype) === -1) {
                return res.send({
                    message: "The uploaded file is not in the correct format",
                    code: 0,
                });
            }
            let userTemp = new UserTempModel.userTemModel({
                password: password,
                full_name: full_name,
                phone_number: phone_number,
                date: date_time,
                email: email,
                address: address,
                role:role
            });
            let statusCode = await UploadFile.uploadFile(
                req,
                user._id.toString(),
                "user",
                file,
                ".jpg"
            );
            if (statusCode === 0) {
                return res.send({ message: "Upload file fail", code: 0 });
            } else {
                let index = sendOTPByEmail(email);
                if (index === 0) {
                    return res.send({ message: "Register user fail", code: 0 });
                } else {
                    userTemp.avatar = statusCode;
                    userTemp.otp = index;
                    await userTemp.save();
                    return res.send({
                        message: "Please verify your account",
                        id: userTemp._id,
                        code: 1,
                    });
                }
            }
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.editUser = async (req, res) => {
    let file = req.file;
    let password = req.body.password;
    let full_name = req.body.full_name;
    let phone_number = req.body.phone_number;
    let email = req.body.email;
    let role = req.body.role;
    if (req.body.userId == null) {
        return res.send({ message: "User not found", code: 0 });
    }
    try {
        let user = await UserModel.userModel.findById(req.body.userId);
        if (user == null) {
            return res.send({ message: "User not found", code: 0 });
        }
        if (password != null) {
            if (!passwordRegex.test(password)) {
                return res.send({
                    message:
                        "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
                    code: 0,
                });
            }
            user.password = password;
        }
        if (full_name != null) {
            user.full_name = full_name;
        }
        if (phone_number != null) {
            if (!phoneNumberRegex.test(phone_number)) {
                return res.send({
                    message: "The phone number is not in the correct format",
                    code: 0,
                });
            }
            user.phone_number = phone_number;
        }
        if (email != null) {
            if (!emailRegex.test(email)) {
                return res.send({
                    message: "The email is not in the correct format",
                    code: 0,
                });
            }
            user.email = email;
        }
        if (file != null) {
            if (match.indexOf(file.mimetype) === -1) {
                console.log(file.mimetype);
                return res.send({
                    message: "The uploaded file is not in the correct format",
                    code: 0,
                });
            }
            if (user.avatar.split("3000")[1] === undefined) {
                let statusCode = await UploadFile.uploadFile(
                    req,
                    user._id.toString(),
                    "user",
                    file,
                    ".jpg"
                );
                if (statusCode === 0) {
                    return res.send({ message: "Upload file fail", code: 0 });
                } else {
                    user.avatar = statusCode;
                }
            } else {
                UploadFile.deleteFile(res, user.avatar.split("3000")[1]);
                let statusCode = await UploadFile.uploadFile(
                    req,
                    user._id.toString(),
                    "user",
                    file,
                    ".jpg"
                );
                if (statusCode === 0) {
                    return res.send({ message: "Upload file fail", code: 0 });
                } else {
                    user.avatar = statusCode;
                }
            }
        }
        user.role = role;
        await user.save();
        return res.send({ message: "Edit success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.loginUser = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (!username) {
        return res.send({ message: "user name is required", code: 0 });
    }
    if (!password) {
        return res.send({ message: "password is required", code: 0 });
    }
    try {
        let userEmail = await UserModel.userModel
            .findOne({ email: username, password: password })
            .populate("address");
        let userPhone = await UserModel.userModel
            .findOne({ phone_number: username, password: password })
            .populate("address");
        if (!userEmail && !userPhone) {
            return res.send({
                message: "Login fail please check your username and password",
                code: 0,
            });
        }
        if (userPhone) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const apiKey = process.env.API_KEY;
            const baseUrl = process.env.BASE_URL;
            const text = `STECH xin chào bạn\nMã OTP của bạn là: ${otp}\nVui lòng không cung cấp mã OTP cho bất kì ai`;
            const to = formatPhoneNumber(username);
            const headers = {
                Authorization: `App ${apiKey}`,
                "Content-Type": "application/json",
            };

            const payload = {
                messages: [
                    {
                        destinations: [{ to }],
                        text,
                    },
                ],
            };

            // Gửi tin nhắn OTP bằng InfoBip REST API
            axios
                .post(baseUrl, payload, { headers })
                .then(async () => {
                    userPhone.otp = otp;
                    await userPhone.save();
                    return res.send({
                        message: "Please verify your account",
                        id: userPhone._id,
                        code: 1,
                    });
                })
                .catch((error) => {
                    console.error(error.message);
                    return res.send({ message: "Fail send code", code: 0 });
                });
        }
        if (userEmail) {
            let index = sendOTPByEmail(userEmail.email);
            if (index === 0) {
                return res.send({ message: "Verify user fail", code: 0 });
            } else {
                userEmail.otp = index;
                await userEmail.save();
                return res.send({
                    message: "Please verify your account",
                    id: userEmail._id,
                    code: 1,
                });
            }
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.getListUser = async (req, res) => {
    try {
        let listUser = await UserModel.userModel.find();
        return res.send({
            listUser: listUser,
            message: "get list user success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.verifyOtpRegister = async (req, res) => {
    let userTempId = req.body.userTempId;
    let otp = req.body.otp;
    if (userTempId === null) {
        return res.send({ message: "userTempId is required", code: 0 });
    }
    if (otp === null) {
        return res.send({ message: "otp is required", code: 0 });
    }
    try {
        let userTemp = await UserTempModel.userTemModel.findOne({
            _id: userTempId,
            otp: otp,
        });
        if (userTemp) {
            let user = new UserModel.userModel({
                password: userTemp.password,
                full_name: userTemp.full_name,
                phone_number: userTemp.phone_number,
                date: userTemp.date,
                email: userTemp.email,
                address: userTemp.address,
                role: userTemp.role
            });
            user.otp = null;
            await user.save();
            await UserTempModel.userTemModel.deleteMany({ email: userTemp.email });
            return res.send({ message: "verify user success", code: 0 });
        } else {
            return res.send({ message: "otp wrong", code: 0 });
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.verifyOtpLogin = async (req, res) => {
    let userId = req.body.userId;
    let otp = req.body.otp;
    if (otp == null) {
        return res.send({ message: "otp is required", code: 0 });
    }
    try {
        let user = await UserModel.userModel
            .findOne({ _id: userId, otp: otp })
            .populate("address");
        if (user) {
            let token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "86400s",
            });
            user.otp = null;
            await user.save();
            return res.send({
                user: user,
                token: token,
                message: "Login success",
                code: 1,
            });
        } else {
            return res.send({ message: "otp wrong", code: 0 });
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};

exports.loginWithGoogle = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    let id = req.body.id;
    let email = req.body.email;
    let displayName = req.body.displayName;
    let photoUrl = req.body.photoUrl;
    let expirationTime = req.body.expirationTime;


    if (id == null || id.length <= 0) {
        return res.send({ message: "id is required", code: 0, time: timestamp });
    }
    if (email == null || email.length <= 0) {
        return res.send({ message: "email is required", code: 0, time: timestamp });
    }
    if (displayName == null || displayName.length <= 0) {
        return res.send({ message: "displayName is required", code: 0, time: timestamp });
    }
    if (expirationTime == null || expirationTime.length <= 0) {
        return res.send({ message: "expirationTime is required", code: 0, time: timestamp });
    }

    try {
        let user = await UserModel.userModel
            .findOne({ email: email })
            .populate("address");
        if (user) {
            let token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "86400s",
            });

            user.otp = null;
            await user.save();
            return res.send({
                user: user,
                token: token,
                message: "Login success",
                code: 1,
            });
        }
        else {
            let token = null;
            const randomId = new ObjectId();
            let userGoogle = {
                avatar: photoUrl,
                email,
                password: email,
                full_name: displayName,
                phone_number: id,
                role: "User",
                address: [],
                date: timestamp,
                account_type: "Google",
                otp: null,
                fcm: "",
            }

            let mUser = new UserModel.userModel(userGoogle);
            await mUser.save();
            if (parseInt(expirationTime)) {
                token = jwt.sign({ user: mUser }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: expirationTime
                });
            }
            else {
                token = jwt.sign({ user: userGoogle }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: "86400s",
                });
            }
            return res.send({
                user: mUser,
                token: token,
                message: "Login success",
                code: 1,
                time: timestamp
            });
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};

const formatPhoneNumber = (phoneNumber) => {
    // Loại bỏ tất cả các ký tự không phải số từ chuỗi
    const numericPhoneNumber = phoneNumber.replace(/\D/g, "");

    if (numericPhoneNumber.startsWith("0")) {
        return `84${numericPhoneNumber.slice(1)}`;
    }

    return numericPhoneNumber;
};
exports.getUserById = async (req, res) => {
    let userId = req.body.userId;
    if (userId == null) {
        return res.send({ message: "userId is required", code: 0 });
    }
    try {
        let user = await UserModel.userModel.findById(userId).populate("address");
        return res.send({ user: user, message: "get user success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};

exports.getAnyUserById = async (req, res) => {
    let userId = req.body.userId;
    if (userId == null) {
        return res.send({ message: "userId is required", code: 0 });
    }
    try {
        let user = await UserModel.userModel.findById({ _id: userId }, { avatar: true, email: true, full_name: true, phone_number: true }).populate("address");
        return res.send({ user: user, message: "get user success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};

exports.addFCM = async (req, res) => {
    let userId = req.body.userId;
    let fcm = req.body.fcm;
    if (fcm == null) {
        return res.send({ message: "fcm is required", code: 0 });
    }
    if (userId == null) {
        return res.send({ message: "user id is required", code: 0 });
    }
    try {
        let user = await UserModel.userModel.findById(userId);
        if (!user) {
            return res.send({ message: "user not found", code: 0 });
        }
        user.fcm = fcm;
        await user.save();
        return res.send({ message: "add fcm success", code: 1 });
    } catch (e) {
        console.log(`error add fcm: ${e.message}`);
        return res.send({ message: e.message.toString(), code: 0 })
    }
}
exports.editPassword = async (req, res) => {
    let userId = req.body.userId;
    let currentPass = req.body.currentPass;
    let newPass = req.body.newPass;
    if (currentPass == null) {
        return res.send({ message: "currentPass id is required", code: 0 });
    }
    if (userId == null) {
        return res.send({ message: "user id is required", code: 0 });
    }
    if (newPass == null) {
        return res.send({ message: "newPass id is required", code: 0 });
    }
    if (!passwordRegex.test(newPass)) {
        return res.send({
            message:
                "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
            code: 0,
        });
    }
    try {
        let user = await UserModel.userModel.findOne({ _id: userId, password: currentPass });
        if (!user) {
            return res.send({ message: "user not found", code: 0 });
        }
        let index = sendOTPByEmail(user.email);
        if (index === 0) {
            return res.send({ message: "send otp fail", code: 0 });
        } else {
            user.newPassword = newPass;
            user.otp = index;
            await user.save();
            return res.send({
                message: "Please verify your account",
                id: user._id,
                code: 1,
            });
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 })
    }
}
exports.verifyOtpEditPass = async (req, res) => {
    let userId = req.body.userId;
    let otp = req.body.otp;
    if (otp == null) {
        return res.send({ message: "otp is required", code: 0 });
    }
    try {
        let user = await UserModel.userModel.findOne({ _id: userId, otp: otp })
        if (user) {
            if (user.newPassword === null) {
                return res.send({ message: "Verify user fail", code: 0 });
            }
            user.otp = null;
            user.password = user.newPassword;
            user.newPassword = null;
            await user.save();
            return res.send({
                message: "edit pass success", code: 1,
            });
        } else {
            return res.send({ message: "otp wrong", code: 0 });
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.getPassWord = async (req, res) => {
    let username = req.body.username;
    let ipAddress = process.env.IP_ADDRESS;
    const randomEndLink = generateRandomPassword(12);
    const link = `https://${ipAddress}/api/resetPassword?key=${randomEndLink}`;
    const text = `STECH xin chào bạn\n Ấn vào đây để khôi phục lại mật khẩu: ${link}`;
    if (username == null) {
        return res.send({ message: "username is required", code: 0 });
    }
    if (!phoneNumberRegex.test(username) && isNumeric(username)) {
        return res.send({ message: "The phone number is not in the correct format", code: 0 });
    }
    if (!emailRegex.test(username) && !isNumeric(username)) {
        return res.send({ message: "The email is not in the correct format", code: 0 });
    }
    if (phoneNumberRegex.test(username)) {
        let user = await UserModel.userModel.findOne({ phone_number: username });
        if (!user) {
            return res.send({ message: "user not found", code: 0 });
        }
        const apiKey = process.env.API_KEY;
        const baseUrl = process.env.BASE_URL;
        const to = formatPhoneNumber(username);
        const headers = {
            Authorization: `App ${apiKey}`,
            "Content-Type": "application/json",
        };

        const payload = {
            messages: [
                {
                    destinations: [{ to }],
                    text,
                },
            ],
        };

        // Gửi tin nhắn OTP bằng InfoBip REST API
        axios
            .post(baseUrl, payload, { headers })
            .then(async () => {
                user.link = link;
                await user.save();
                return res.send({
                    message: "Please verify your account",
                    code: 1,
                });
            })
            .catch((error) => {
                console.error(error.message);
                return res.send({ message: "Fail send code", code: 0 });
            });
    }
    if (emailRegex.test(username)) {
        try {
            let user = await UserModel.userModel.findOne({ email: username });
            let index = sendOTPByEmailGetPass(username, text);
            if (index === 0) {
                return res.send({ message: "Verify user fail", code: 0 });
            } else {
                user.link = link;
                await user.save();
                return res.send({
                    message: "Please verify your account",
                    code: 1,
                });
            }
        } catch (e) {
            console.log(e.message)
            return res.send({
                message: e.message.toString(),
                code: 0,
            });
        }
    }
}
exports.resetPassword = async (req, res) => {
    const key = req.query.key;
    let ipAddress = process.env.IP_ADDRESS;
    const newPass = generateRandomPassword(6);
    const text = `STECH xin chào bạn\nmật khẩu mới của bạn là: ${newPass}`;
    if (key == null) {
        return res.send({ message: "key is required", code: 0 });
    }
    const link = `https://${ipAddress}/api/resetPassword?key=${key}`
    try {
        let user = await UserModel.userModel.findOne({ link: link });
        let index = sendNewPassByEmailGetPass(user.email, text);
        if (index === 0) {
            return res.send({ message: "Verify user fail", code: 0 });
        } else {
            user.password = newPass;
            await user.save();
            return res.send({
                message: "New password has been sent to your email",
                code: 1,
            });
        }
    } catch (e) {
        return res.send({ message: e.message.toString(), code: 0 });
    }
}

function generateRandomPassword(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }
    return password;
}
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
exports.checkToken = (req, res) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.send({ message: "wrong token", code: 0 });
    }
    try {
        req.data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return res.send({ message: "token ok", code: 1 })
    } catch (e) {
        return res.send({ message: "wrong token", code: 0 });
    }
}

exports.checkEmailExist = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    const email = req.body.email;
    if (!email) {
        return res.send({ message: "email is require", code: 0 });
    }

    if (!emailRegex.test(email)) {
        return res.send({
            message: "The email is not in the correct format",
            code: 0,
            time: timestamp
        });
    }

    try {
        let user = await UserModel.userModel.findOne({ email: email });
        console.log(user);
        if (user) {
            return res.send({ message: "email exist", code: 1, time: timestamp })
        }
        else {
            return res.send({ message: "email not exist", code: 1, time: timestamp })
        }
    } catch (e) {
        return res.send({ message: "error check email exist", code: 0, time: timestamp });
    }
}



const AdminModel = require("../models/model.admin");
const UploadFile = require("../models/uploadFile");
const moment = require("moment-timezone");
const {sendOTPByEmail} = require("../models/otp");
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
exports.addAdmin = async (req, res) => {
    let password = req.body.password;
    let full_name = req.body.full_name;
    let phone_number = req.body.phone_number;
    let email = req.body.email;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (password == null) {
        return res.send({message: "Password is required", code: 0});
    }
    if (!passwordRegex.test(password)) {
        return res.send({
            message:
                "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
            code: 0,
        });
    }
    if (phone_number == null) {
        return res.send({message: "Phone number is required", code: 0});
    }
    if (!phoneNumberRegex.test(phone_number)) {
        return res.send({
            message: "The phone number is not in the correct format",
            code: 0,
        });
    }
    if (email == null) {
        return res.send({message: "Email is required", code: 0});
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
        let adminPhone = await AdminModel.adminModel.findOne({
            phone_number: phone_number,
        });
        let adminEmail = await AdminModel.adminModel.findOne({email: email});
        if (adminPhone) {
            return res.send({message: "phone number already exists", code: 0});
        }
        if (adminEmail) {
            return res.send({message: "email already exists", code: 0});
        }
        let admin = new AdminModel.adminModel({
            password: password,
            full_name: full_name,
            phone_number: phone_number,
            date: date_time,
            email: email
        });
        await admin.save();
        return res.send({
            message: "add admin success",
            code: 1,
        });
    } catch (e) {
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.editAdmin = async (req, res) => {
    let file = req.file;
    let password = req.body.password;
    let full_name = req.body.full_name;
    let phone_number = req.body.phone_number;
    let email = req.body.email;
    let adminId = req.body.adminId;
    if (adminId == null) {
        return res.send({message: "Admin not found", code: 0});
    }
    try {
        let admin = await AdminModel.adminModel.findById(adminId);
        if (admin == null) {
            return res.send({message: "Admin not found", code: 0});
        }
        if (password != null) {
            if (!passwordRegex.test(password)) {
                return res.send({
                    message:
                        "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
                    code: 0,
                });
            }
            admin.password = password;
        }
        if (full_name != null) {
            admin.full_name = full_name;
        }
        if (phone_number != null) {
            if (!phoneNumberRegex.test(phone_number)) {
                return res.send({
                    message: "The phone number is not in the correct format",
                    code: 0,
                });
            }
            admin.phone_number = phone_number;
        }
        if (email != null) {
            if (!emailRegex.test(email)) {
                return res.send({
                    message: "The email is not in the correct format",
                    code: 0,
                });
            }
            admin.email = email;
        }
        if (file != null) {
            if (match.indexOf(file.mimetype) === -1) {
                console.log(file.mimetype);
                return res.send({
                    message: "The uploaded file is not in the correct format",
                    code: 0,
                });
            }
            if (admin.avatar.split("3000")[1] === undefined) {
                let statusCode = await UploadFile.uploadFile(
                    req,
                    admin._id.toString(),
                    "admin",
                    file,
                    ".jpg"
                );
                if (statusCode === 0) {
                    return res.send({message: "Upload file fail", code: 0});
                } else {
                    admin.avatar = statusCode;
                }
            } else {
                UploadFile.deleteFile(res, admin.avatar.split("3000")[1]);
                let statusCode = await UploadFile.uploadFile(
                    req,
                    admin._id.toString(),
                    "admin",
                    file,
                    ".jpg"
                );
                if (statusCode === 0) {
                    return res.send({message: "Upload file fail", code: 0});
                } else {
                    admin.avatar = statusCode;
                }
            }
        }
        await admin.save();
        return res.send({message: "Edit success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.loginAdmin = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (!username) {
        return res.send({message: "user name is required", code: 0});
    }
    if (!password) {
        return res.send({message: "password is required", code: 0});
    }
    try {
        let adminEmail = await AdminModel.adminModel
            .findOne({email: username, password: password})
        let adminPhone = await AdminModel.adminModel
            .findOne({phone_number: username, password: password})
        if (!adminEmail && !adminPhone) {
            return res.send({
                message: "Login fail please check your username and password",
                code: 0,
            });
        }
        if (adminPhone) {
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
                        destinations: [{to}],
                        text,
                    },
                ],
            };

            // Gửi tin nhắn OTP bằng InfoBip REST API
            axios
                .post(baseUrl, payload, {headers})
                .then(async () => {
                    adminPhone.otp = otp;
                    await adminPhone.save();
                    return res.send({
                        message: "Please verify your account",
                        id: adminPhone._id,
                        code: 1,
                    });
                })
                .catch((error) => {
                    console.error(error.message);
                    return res.send({message: "Fail send code", code: 0});
                });
        }
        if (adminEmail) {
            let index = sendOTPByEmail(adminEmail.email);
            if (index === 0) {
                return res.send({message: "Verify admin fail", code: 0});
            } else {
                adminEmail.otp = index;
                await adminEmail.save();
                return res.send({
                    message: "Please verify your account",
                    id: adminEmail._id,
                    code: 1,
                });
            }
        }
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
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
exports.verifyOtpLogin = async (req, res) => {
    let adminId = req.body.adminId;
    let otp = req.body.otp;
    if (adminId == null) {
        return res.send({message: "adminId is required", code: 0});
    }
    if (otp == null) {
        return res.send({message: "otp is required", code: 0});
    }
    let admin = await AdminModel.adminModel
        .findOne({_id: adminId, otp: otp})
    if (admin) {
        let token = jwt.sign({admin: admin}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "3600s",
        });
        admin.otp = null;
        await admin.save();
        return res.send({
            admin: admin,
            token: token,
            message: "Login success",
            code: 1,
        });
    } else {
        return res.send({message: "otp wrong", code: 0});
    }
};
exports.deleteAdmin = async (req, res) => {
    let adminId = req.body.adminId;
    try {
        let admin = await AdminModel.adminModel.findById(adminId);
        if (admin.avatar.split("3000")[1] !== undefined) {
            UploadFile.deleteFile(res, admin.avatar.split("3000")[1]);
        }
        await AdminModel.adminModel.deleteOne({_id: adminId});
        return res.send({message: "delete admin success", code: 0});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
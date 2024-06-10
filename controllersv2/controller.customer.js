const CustomerModel = require("../modelsv2/model.customer");
const moment = require("moment-timezone");
const { sendOTPByEmail, sendOTPByEmailGetPass, sendNewPassByEmailGetPass, sendVerifyCus } = require("../models/otp");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneNumberRegex = /^(?:\+84|0)[1-9]\d{8}$/;
exports.registerCustomer = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let full_name = req.body.full_name;
    let phone_number = req.body.phone_number;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    let ipAddress = process.env.IP_ADDRESS;
    let ipAddressLocal = process.env.IP_LOCAL;
    let portLocal = process.env.PORT;
    if (password === null) {
        return res.send({ message: "Password is required", code: 0 });
    }
    if (!passwordRegex.test(password)) {
        return res.send({
            message:
                "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
            code: 0,
        });
    }
    if (phone_number === null) {
        return res.send({ message: "Phone number is required", code: 0 });
    }
    if (!phoneNumberRegex.test(phone_number)) {
        return res.send({
            message: "The phone number is not in the correct format",
            code: 0,
        });
    }
    if (email === null) {
        return res.send({ message: "Email is required", code: 0 });
    }
    if (!emailRegex.test(email)) {
        return res.send({
            message: "The email is not in the correct format",
            code: 0,
        });
    }
    if (full_name === null) {
        return res.send({
            message: "The full_name is required",
            code: 0,
        });
    }
    try {
        let cusPhone = await CustomerModel.customerModel.findOne({
            phone_number: phone_number,
        });
        let cusEmail = await CustomerModel.customerModel.findOne({ email: email });
        if (cusPhone && cusPhone.status !== "Not verified") {
            return res.send({ message: "phone number already exists", code: 0 });
        }
        if (cusEmail && cusEmail.status !== "Not verified") {
            return res.send({ message: "email already exists", code: 0 });
        }
        let cus = new CustomerModel.customerModel({
            email: email,
            password: password,
            full_name: full_name,
            phone_number: phone_number,
            create_time: create_time,
        })
        // const link = `https://${ipAddress}/apiv2/verifyCusRegister?key=${cus._id.toString()}`;
        const link = `http://${ipAddressLocal}:${portLocal}/apiv2/verifyCusRegister?key=${cus._id.toString()}`;
        const text = `STECH xin chào bạn\nẤn vào đây để xác nhận kích hoặt tài khoản: ${link}`;
        let index = sendVerifyCus(email, text);
        if (index === 0) {
            return res.send({
                message: "send verify account fail",
                code: 0,
            });
        } else {
            await cus.save();
        }
        return res.send({
            message: "please verify account",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.verifyCusRegister = async (req, res) => {
    let key = req.query.key;
    console.log(key);
    try {
        let cus = await CustomerModel.customerModel.findById(key);
        if (cus) {
            if (cus.status === "Not verified") {
                cus.status = "Has been activated";
                await cus.save();
                await CustomerModel.customerModel.deleteMany({ phone_number: cus.phone_number, status: "Not verified" });
            }
        } else {
            return res.send({
                message: "Activation failed",
                code: 0,
            });
        }
        return res.send({
            message: "Has been activated",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.loginCustomer = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (!username) {
        return res.send({ message: "cus name is required", code: 0 });
    }
    if (!password) {
        return res.send({ message: "password is required", code: 0 });
    }
    try {
        let cusEmail = await CustomerModel.customerModel
            .findOne({ email: username, password: password })
        let cusPhone = await CustomerModel.customerModel
            .findOne({ phone_number: username, password: password })
        if (!cusEmail && !cusPhone) {
            return res.send({
                message: "Login fail please check your username and password",
                code: 0,
            });
        }
        if (cusPhone) {
            if (cusPhone.status !== "Has been activated") {
                return res.send({
                    message: "Your account has not been activated or has been locked, please contact hotline 0999999999 for help.",
                    code: 0,
                });
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            const apiKey = process.env.API_KEY;
            const baseUrl = process.env.BASE_URL;
            const text = `STECH xin chào bạn\nMã OTP của bạn là: ${otp}\nVui lòng không cung cấp mã OTP cho bất kì ai`;
            const to = formatPhoneNumber(username);
            console.log(to)
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
                .then(async (response) => {
                    console.log('Axios Response:', response.data);
                    cusPhone.otp = otp;
                    await cusPhone.save();
                    return res.send({
                        message: "Please verify your account",
                        id: cusPhone._id,
                        code: 1,
                    });
                })
                .catch((error) => {
                    console.error(error.message);
                    return res.send({ message: "Fail send code", code: 0 });
                });
        }
        if (cusEmail) {
            if (cusEmail.status !== "Has been activated") {
                return res.send({
                    message: "Your account has not been activated or has been locked, please contact hotline 0999999999 for help.",
                    code: 0,
                });
            }
            let index = sendOTPByEmail(cusEmail.email);
            if (index === 0) {
                return res.send({ message: "Verify cus fail", code: 0 });
            } else {
                cusEmail.otp = index;
                await cusEmail.save();
                return res.send({
                    message: "Please verify your account",
                    id: cusEmail._id,
                    code: 1,
                });
            }
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
exports.verifyCusLogin = async (req, res) => {
    let cusId = req.body.cusId;
    let otp = req.body.otp;
    if (otp == null) {
        return res.send({ message: "otp is required", code: 0 });
    }
    try {
        let cus = await CustomerModel.customerModel
            .findOne({ _id: cusId, otp: otp })
        if (cus) {
            let token = jwt.sign({ cus: cus }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "7 days",
            });
            cus.otp = null;
            await cus.save();
            return res.send({
                cus: cus,
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
}
exports.getInfoCus = async (req, res) => {
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findById(data.cus._id);
        return res.send({
            cus: cus,
            message: "get cus success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.addFCM = async (req, res) => {
    let cusId = req.body.cusId;
    let fcm = req.body.fcm;
    if (fcm == null) {
        return res.send({ message: "fcm is required", code: 0 });
    }
    if (cusId == null) {
        return res.send({ message: "cus id is required", code: 0 });
    }
    try {
        let cus = await CustomerModel.customerModel.findById(cusId);
        if (!cus) {
            return res.send({ message: "cus not found", code: 0 });
        }
        cus.fcm = fcm;
        await cus.save();
        return res.send({ message: "add fcm success", code: 1 });
    } catch (e) {
        console.log(`error add fcm: ${e.message}`);
        return res.send({ message: e.message.toString(), code: 0 })
    }
}
exports.sendOtpEditCus = async (req, res) => {
    let email = req.body.email;
    let phone_number = req.body.phone_number;
    let full_name = req.body.full_name;
    let avatar = req.body.avatar;
    console.log(`email ${email} phone ${phone_number} name ${full_name} avt ${avatar}`)
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findById(data.cus._id);
        if (email !== null) {
            if (!emailRegex.test(email)) {
                return res.send({ message: "The email is not in the correct format", code: 0 });
            }
        }
        if (phone_number !== null) {
            if (!emailRegex.test(email)) {
                return res.send({ message: "The number phone is not in the correct format", code: 0 });
            }
        }

        let index = sendOTPByEmail(cus.email);
        if (index === 0) {
            return res.send({
                message: "send otp fail",
                code: 0,
            });
        }
        cus.otp = index;
        await cus.save();
        return res.send({
            message: "Enter the otp code to confirm changing personal information",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.getListCustomer = async (req, res) => {
    try {
        let listCus = await CustomerModel.customerModel.find();
        return res.send({
            listCus: listCus,
            message: "get list customer success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.editCus = async (req, res) => {
    let otp = req.body.otp;
    let full_name = req.body.full_name;
    let email = req.body.email;
    let phone_number = req.body.phone_number;
    let avatar = req.body.avatar;
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findOne({ _id: data.cus._id, otp: otp });
        if (cus) {
            cus.otp = null;
            if (email !== null) {
                if (!emailRegex.test(email)) {
                    cus.email = email;
                    return res.send({ message: "The email is not in the correct format", code: 0 });
                }
            }
            if (phone_number !== null) {
                if (!emailRegex.test(email)) {
                    cus.phone_number = phone_number;
                    return res.send({ message: "The number phone is not in the correct format", code: 0 });
                }
            }
            if (full_name !== null) {
                cus.full_name = full_name;
            }
            if (avatar !== null) {
                cus.avatar = avatar;
            }
            await cus.save();
            return res.send({
                message: "Edit cus success",
                code: 1,
            });
        } else {
            return res.send({ message: "wrong otp", code: 0 });
        }

    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.sendOtpEditPass = async (req, res) => {
    let currentPass = req.body.currentPass;
    let newPass = req.body.newPass;
    if (currentPass === null) {
        return res.send({ message: "current password is required", code: 0 });
    }
    if (newPass === null) {
        return res.send({ message: "new password is required", code: 0 });
    }
    if (!passwordRegex.test(newPass)) {
        return res.send({
            message:
                "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
            code: 0,
        });
    }
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findById(data.cus._id);
        if (cus.password !== currentPass) {
            return res.send({ message: "current password wrong", code: 0 });
        }
        let index = sendOTPByEmail(cus.email);
        if (index === 0) {
            return res.send({
                message: "send otp fail",
                code: 0,
            });
        }
        cus.otp = index;
        await cus.save();
        return res.send({
            message: "Enter the otp code to confirm edit password",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.editPass = async (req, res) => {
    let otp = req.body.otp;
    let currentPass = req.body.currentPass;
    let newPass = req.body.newPass;
    if (currentPass === null) {
        return res.send({ message: "current password is required", code: 0 });
    }
    if (newPass === null) {
        return res.send({ message: "new password is required", code: 0 });
    }
    if (!passwordRegex.test(newPass)) {
        return res.send({
            message:
                "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
            code: 0,
        });
    }
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findById(data.cus._id);
        if (cus.otp !== otp) {
            return res.send({ message: "otp wrong", code: 0 });
        }
        if (cus.password !== currentPass) {
            return res.send({ message: "current password wrong", code: 0 });
        }
        cus.password = newPass;
        cus.otp = null;
        await cus.save();
        return res.send({
            message: "edit password success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.getPassWord = async (req, res) => {
    let username = req.body.username;
    let ipAddress = process.env.IP_ADDRESS;
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
        let user = await CustomerModel.customerModel.findOne({ phone_number: username });
        if (!user) {
            return res.send({ message: "user not found", code: 0 });
        }
        const link = `https://${ipAddress}/api/resetPassword?key=${user._id}`;
        const text = `STECH xin chào bạn\n Ấn vào đây để khôi phục lại mật khẩu: ${link}`;
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
        axios
            .post(baseUrl, payload, { headers })
            .then(async () => {
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
            let user = await CustomerModel.customerModel.findOne({ email: username });
            const link = `https://${ipAddress}/apiv2/resetPassword?key=${user._id}`;
            const text = `STECH xin chào bạn\n Ấn vào đây để khôi phục lại mật khẩu: ${link}`;
            let index = sendOTPByEmailGetPass(username, text);
            if (index === 0) {
                return res.send({ message: "Verify user fail", code: 0 });
            } else {
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
    const newPass = generateRandomPassword(6);
    const text = `STECH xin chào bạn\nmật khẩu mới của bạn là: ${newPass}`;
    if (key == null) {
        return res.send({ message: "key is required", code: 0 });
    }
    try {
        let user = await CustomerModel.customerModel.findById(key);
        console.log(key);
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
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
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



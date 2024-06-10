const AdminModel = require("../modelsv2/model.admin");
const {sendOTPByEmail} = require("../models/otp");
const CustomerModel = require("../modelsv2/model.customer");
const jwt = require("jsonwebtoken");
const EmployeeModel = require("../modelsv2/model.employee");
const UploadFileFirebase = require("../modelsv2/uploadFileFirebase");
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
exports.loginAdmin = async (req, res)=>{
    try {
        let email = req.body.email;
        let pass = req.body.password;
        if (email == null) {
            return res.send({message: "email is required", code: 0});
        }
        if (pass == null) {
            return res.send({message: "password is required", code: 0});
        }

        let adminEmail = await AdminModel.adminModel.findOne({email: email, password: pass});
        if (!adminEmail) {
            return res.send({
                message: "Login fail please check your Email and Password",
                code: 0,
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
}

exports.verifyOtpLoginAdmin = async (req, res) => {
    let cusId = req.body.adminId;
    let otp = req.body.otp;
    console.log(req.body)
    if (otp == null) {
        return res.send({message: "otp is required", code: 0});
    }
    try {
        let cus = await AdminModel.adminModel
            .findOne({_id: cusId, otp: otp})
        console.log( cus)
        if (cus) {
            let token = jwt.sign({cus: cus}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "86400s",
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
            return res.send({message: "otp wrong", code: 0});
        }
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
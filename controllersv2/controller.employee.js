const EmployeeModel = require("../modelsv2/model.employee");
const {sendOTPByEmail} = require("../models/otp");
const AdminModel = require("../modelsv2/model.admin");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/model.user");
const UploadFileFirebase = require("../modelsv2/uploadFileFirebase");
exports.loginEmployee = async (req, res)=>{
    try {
        let email = req.body.email;
        let pass = req.body.password;
        if (email == null) {
            return res.send({message: "email is required", code: 0});
        }
        if (pass == null) {
            return res.send({message: "password is required", code: 0});
        }

        let adminEmail = await EmployeeModel.employeeModel.findOne({email: email, password: pass});
        if (!adminEmail) {
            return res.send({
                message: "Login fail please check your Email and Password",
                code: 0,
            });
        }
        if (adminEmail.status =="banned") {
            return res.send({
                message: "The account has been blocked and cannot log in",
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
exports.verifyOtpLoginEmployee = async (req, res) => {
    let cusId = req.body.employeeId;
    let otp = req.body.otp;
    if (otp == null) {
        return res.send({message: "otp is required", code: 0});
    }
    try {
        let cus = await EmployeeModel.employeeModel
            .findOne({_id: cusId, otp: otp})
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

exports.editEmployee = async (req, res) => {
    let file = req.file;
    let password = req.body.password;
    let full_name = req.body.full_name;
    let phone_number = req.body.phone_number;
    let email = req.body.email;
    if (req.body.id == null) {
        return res.send({ message: "Employee not found", code: 0 });
    }
    try {
        let user = await EmployeeModel.employeeModel.findById(req.body.id);
        if (user == null) {
            return res.send({ message: "Employee not found", code: 0 });
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
            const imgFirebase = `employees/${id}`;
            await UploadFileFirebase.deleteFolderAndFiles(res, imgFirebase);

            let imgProfile = await UploadFileFirebase.uploadFileProfile(
                req,
                notification._id.toString(),
                "avatar",
                "employees",
                img[0]
            );
            if (imgProfile === 0) {
                return res.send({message: "upload file img fail", code: 0});
            }
            user.avatar = imgProfile;
        }
        await user.save();
        return res.send({ message: "Edit success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
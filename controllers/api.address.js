const UserModel = require("../models/model.user");
const AddressModel = require("../models/model.address");
const moment = require("moment-timezone");
exports.addAddress = async (req, res, next) => {
    let userId = req.body.userId;
    let name = req.body.name;
    let city = req.body.city;
    let street = req.body.street;
    let phone_number = req.body.phone_number;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    const phoneNumberRegex = /^(?:\+84|0)[1-9]\d{8}$/;
    if (name == null) {
        return res.send({message: "name is required", code: 0});
    }
    if (city == null) {
        return res.send({message: "city is required", code: 0});
    }
    if (street == null) {
        return res.send({message: "street is required", code: 0});
    }
    if (phone_number == null) {
        return res.send({message: "phone_number is required", code: 0});
    }
    if (!phoneNumberRegex.test(phone_number)) {
        return res.send({message: "The phone number is not in the correct format", code: 0});
    }
    if (userId == null) {
        return res.send({message: "userId is required", code: 0});
    }
    try {
        let user = await UserModel.userModel.findById(userId);
        if (!user) {
            return res.send({message: "add address fail", code: 0});
        }
        let addAddress = new AddressModel.modelAddress({
            name: name,
            city: city,
            street: street,
            phone_number: phone_number,
            date:date_time,
        })
        let currentAddress = user.address;
        currentAddress.push(addAddress._id.toString());
        user.address = currentAddress;
        await user.save();
        await addAddress.save();
        return res.send({message: "add address success", code: 1});
    } catch (e) {
        console.log(e.message);
        res.send({message: e.message.toString(), code: 0});
    }
}
exports.editAddress = async (req, res, next) => {
    let name = req.body.name;
    let city = req.body.city;
    let street = req.body.street;
    let phone_number = req.body.phone_number;
    let addressId = req.body.addressId;
    const phoneNumberRegex = /^(?:\+84|0)[1-9]\d{8}$/;
    if (addressId == null) {
        res.send({message: "addressId is required", code: 0});
    }
    try {
        let editAddress = await AddressModel.modelAddress.findById(addressId);
        if (!editAddress) {
            return res.send({message: "edi address fail", code: 0})
        }
        if (name != null) {
            editAddress.name = name;
        }
        if (city != null) {
            editAddress.city = city;
        }
        if (street != null) {
            editAddress.street = street;
        }
        if (phone_number != null) {
            if (!phoneNumberRegex.test(phone_number)) {
                return res.send({message: "The phone number is not in the correct format", code: 0});
            }
            editAddress.phone_number = phone_number;
        }
        await editAddress.save();
        return res.send({message: "edit address success", code: 1});
    } catch (e) {
        console.log(e.message);
        res.send({message: e.message.toString(), code: 0});
    }
}
exports.deleteAddress = async (req, res, next) => {
    let addressId = req.body.addressId;
    let userId = req.body.userId;
    if (addressId == null) {
        res.send({message: "addressId is required", code: 0});
    }
    if (userId == null) {
        return res.send({message: "userId is required", code: 0});
    }
    try {
        let user = await UserModel.userModel.findById(userId);
        if (!user) {
            return res.send({message: "delete address fail", code: 0});
        }
        let currentAddress = user.address;
        user.address = currentAddress.filter(item => item.toString() !== addressId);
        await AddressModel.modelAddress.deleteOne({_id: addressId});
        await user.save();
        return res.send({message: "delete address success", code: 1});
    } catch (e) {
        console.log(e.message);
        res.send({message: e.message.toString(), code: 0});
    }
}
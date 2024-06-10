const DeliveryAddressModel = require("../modelsv2/model.deliveryaddress");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
require("dotenv").config();
exports.getDeliveryAddress = async (req, res) => {
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let address = await DeliveryAddressModel.deliveryAddressModel.find({customer_id: data.cus._id});
        return res.send({message: "get address success", address: address, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.addDeliveryAddress = async (req, res) => {
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
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let address = new DeliveryAddressModel.deliveryAddressModel({
            customer_id: data.cus._id,
            name: name,
            city: city,
            street: street,
            phone: phone_number,
            create_time: date_time
        });
        await address.save();
        return res.send({message: "add address success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.editDeliveryAddress = async (req, res) => {
    let addressId = req.body.addressId;
    let name = req.body.name;
    let city = req.body.city;
    let street = req.body.street;
    let phone_number = req.body.phone_number;
    const phoneNumberRegex = /^(?:\+84|0)[1-9]\d{8}$/;
    if (addressId == null) {
        return res.send({message: "addressId is required", code: 0});
    }
    try {
        let address = await DeliveryAddressModel.deliveryAddressModel.findById(addressId);
        if (address) {
            if (name !== null) {
                address.name = name;
            }
            if (city !== null) {
                address.city = city;
            }
            if (street !== null) {
                address.street = street;
            }
            if (phone_number !== null) {
                if (!phoneNumberRegex.test(phone_number)) {
                    return res.send({message: "The phone number is not in the correct format", code: 0});
                } else {
                    address.phone = phone_number;
                }
            }
            await address.save();
            return res.send({message: "edit address success", code: 1});
        } else {
            return res.send({message: "address not found", code: 0});
        }
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.deleteDeliveryAddress = async (req, res) => {
    let addressId = req.body.addressId;
    if (addressId == null) {
        return res.send({message: "addressId is required", code: 0});
    }
    try {
        let address = await DeliveryAddressModel.deliveryAddressModel.findById(addressId);
        if (address) {
            await DeliveryAddressModel.deliveryAddressModel.deleteOne({_id: addressId});
            return res.send({message: "delete address success", code: 1});
        } else {
            return res.send({message: "address not found", code: 0});
        }
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

const MapVoucherModel = require("../modelsv2/model.map_voucher_cust");
const moment = require("moment-timezone");

exports.getMapVoucher = async (req, res) => {
    try {
        let mapVoucher = await  MapVoucherModel.mapVoucherModel.find();
        return res.send({message: "get map voucher success", mapVoucher: mapVoucher, code: 1})
    } catch (e){
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.addMapVoucher = async (req, res) => {
    let voucherId = req.body.voucher_id;
    let customerId = req.body.customer_id;
    let is_used = req.body.is_used;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    if (voucherId == null) {
        return res.send({message: "voucherId is required", code: 0});
    }
    if (customerId == null) {
        return res.send({message: "customerId is required", code: 0});
    }
    if (is_used == null) {
        return res.send({message: "is_used is required", code: 0});
    }
    if (create_time == null) {
        return res.send({message: "create_time is required", code: 0});
    }
    try {
        let mapVoucher = new MapVoucherModel.mapVoucherModel({
            vocher_id: voucherId,
            customer_id: customerId,
            is_used: is_used,
            create_time: create_time,
        });
        await mapVoucher.save();
        return res.send({message: "add map voucher success", code: 1});
    } catch (e) {
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.deleteMapVoucher = async (req, res) => {
    let mapVoucherId = req.body.mapVoucherId;
    if (mapVoucherId == null) {
        return res.send({message: "mapVoucherId is required", code: 0});
    }
    try {
        await MapVoucherModel.mapVoucherModel.deleteMany({_id: mapVoucherId});
        return res.send({message: "delete map voucher success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.editMapVoucherIsUsed = async (req, res) => {
    let voucherId = req.body.voucher_id;
    let customerId = req.body.customer_id;
    let is_used = req.body.is_used;
    let mapVoucherId = req.body.mapVoucherId;
    if (mapVoucherId == null) {
        return res.send({message: "mapVoucherId is required", code: 0});
    }
    try {
        let mapVoucher = await NotificationModel.notificationModel.findOne({idAll: mapVoucherId});
        let newMapVoucher = {
            voucher_id: mapVoucher.voucher_id,
            create_time: notifiaction.create_time,
        }
        if (title !== null) {
            newNotification.title = title;
        }
        if (content !== null) {
            newNotification.content = content;
        }
        if (img !== null) {
            newNotification.img = img;
        }
        await NotificationModel.notificationModel.updateMany({idAll: notificationId}, {$set: newNotification});
        return res.send({message: "edit notification success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.getMapVoucherById = async (req,res)=>{
    let mapVoucherId = req.body.mapVoucherId;
    if(mapVoucherId === null){
        return res.send({message:"mapVoucherId id is required", code: 0 })
    }
    try {
        let mapVoucher = await MapVoucherModel.mapVoucherModel.findById(mapVoucherId);
        if(!mapVoucher){
            return res.send({message:"map voucher not found", code: 0 })
        }
        return res.send({message: "get list map voucher success", listVoucher: mapVoucher, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.getMapVoucherByCustId = async (req,res)=>{
    let custId = req.body.customerId;
    if(custId === null){
        return res.send({message:"custId id is required", code: 0 })
    }
    try {
        let mapVoucher = await MapVoucherModel.mapVoucherModel.find({customer_id: custId});
        if(!mapVoucher){
            return res.send({message:"map voucher not found", code: 0 })
        }
        return res.send({message: "get list map voucher success", listVoucher: mapVoucher, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.getMapVoucherByVoucherId = async (req,res)=>{
    let voucherId = req.body.voucherId;
    if(mapVoucherId === null){
        return res.send({message:"mapVoucherId id is required", code: 0 })
    }
    try {
        let mapVoucher = await MapVoucherModel.mapVoucherModel.find({voucher_id: voucherId});
        if(!mapVoucher){
            return res.send({message:"map voucher not found", code: 0 })
        }
        return res.send({message: "get list map voucher success", listVoucher: mapVoucher, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

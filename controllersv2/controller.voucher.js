const VoucherModel = require("../modelsv2/model.voucher");
const moment = require("moment-timezone");
const CusModel = require("../modelsv2/model.customer");
const MapVoucherModel = require("../modelsv2/model.map_voucher_cust");
const jwt = require("jsonwebtoken");
require("dotenv").config();
exports.getVoucher = async (req, res) => {
    try {
        let voucher = await VoucherModel.voucherModel.find();
        return res.send({message: "get voucher success", voucher: voucher, code: 1})
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.addVoucher = async (req, res) => {
    let name = req.body.name;
    let content = req.body.content;
    let price = req.body.price;
    let toDate = req.body.toDate;
    let fromDate = req.body.fromDate;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    if (name == null) {
        return res.send({message: "title is required", code: 0});
    }
    if (content == null) {
        return res.send({message: "content is required", code: 0});
    }
    if (price == null) {
        return res.send({message: "price is required", code: 0});
    }
    if (toDate == null) {
        return res.send({message: "toDate is required", code: 0});
    }
    if (fromDate == null) {
        return res.send({message: "fromDate is required", code: 0});
    }
    if (create_time == null) {
        return res.send({message: "create_time is required", code: 0});
    }
    try {
        let voucher = new VoucherModel.voucherModel({
            name: name,
            content: content,
            price: price,
            toDate: toDate,
            fromDate: fromDate,
            create_time: create_time,
        });
        await voucher.save();
        return res.send({message: "add voucher success", code: 1});
    } catch (e) {
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.deleteVoucher = async (req, res) => {
    let voucherId = req.body.voucherId;
    if (voucherId == null) {
        return res.send({message: "voucherId is required", code: 0});
    }
    try {
        await VoucherModel.voucherModel.deleteMany({_id: voucherId});
        return res.send({message: "delete voucher success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.editVoucher = async (req, res) => {
    let name = req.body.name;
    let content = req.body.content;
    let price = req.body.price;
    let toDate = req.body.toDate;
    let fromDate = req.body.fromDate;
    let voucherId = req.body.voucherId;
    if (voucherId == null) {
        return res.send({message: "voucherId is required", code: 0});
    }
    try {
        let voucher = await VoucherModel.voucherModel.findOne({idAll: voucherId});
        let newVoucher = {
            name: voucher.name,
            content: voucher.content,
            price: voucher.price,
            toDate: voucher.toDate,
            fromDate: voucher.fromDate,
            create_time: voucher.create_time,
        }
        if (name !== null) {
            newVoucher.name = name;
        }
        if (content !== null) {
            newVoucher.content = content;
        }
        if (price !== null) {
            newVoucher.price = price;
        }
        if (toDate !== null) {
            newVoucher.toDate = toDate;
        }
        if (fromDate !== null) {
            newVoucher.fromDate = fromDate;
        }
        await VoucherModel.voucherModel.updateMany({idAll: voucherId}, {$set: newVoucher});
        return res.send({message: "edit voucher success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.getVoucherById = async (req, res) => {
    let voucherId = req.body.voucherId;
    if (voucherId === null) {
        return res.send({message: "voucher id is required", code: 0})
    }
    try {
        let voucher = await VoucherModel.voucherModel.findById(voucherId);
        if (!voucher) {
            return res.send({message: "voucher not found", code: 0})
        }
        return res.send({message: "get list voucher success", listVoucher: voucher, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.addVoucherAllUser = async (req, res) => {
    let name = req.body.name;
    let content = req.body.content;
    let price = req.body.price;
    let toDate = req.body.toDate;
    let fromDate = req.body.fromDate;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (name == null) {
        return res.send({message: "title is required", code: 0});
    }
    if (content == null) {
        return res.send({message: "content is required", code: 0});
    }
    if (price == null) {
        return res.send({message: "price is required", code: 0});
    }
    if (toDate == null) {
        return res.send({message: "toDate is required", code: 0});
    }
    if (fromDate == null) {
        return res.send({message: "fromDate is required", code: 0});
    }
    if (create_time == null) {
        return res.send({message: "create_time is required", code: 0});
    }
    try {
        let voucher = new VoucherModel.voucherModel({
            name: name,
            content: content,
            price: price,
            toDate: toDate,
            fromDate: fromDate,
            create_time: create_time,
        });
        await voucher.save();
        let cus = await CusModel.customerModel.find();
        await Promise.all(cus.map(async item => {
            let mapVoucher = new MapVoucherModel.mapVoucherModel({
                vocher_id: voucher._id,
                customer_id: item._id,
                is_used: false,
                create_time: create_time,
            });
            await mapVoucher.save();
        }));
        return res.send({message: "add voucher success", code: 1});
    } catch (e) {
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.getVoucherByIdV2 = async (req, res) => {
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let mapVoucherCus = await MapVoucherModel.mapVoucherModel.find({customer_id: data.cus._id}).populate("vocher_id").populate("customer_id");
        let voucher = filterVouchersForUser(mapVoucherCus);
        return res.send({message: "get voucher success", voucher: voucher, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

function filterVouchersForUser(listVoucher) {
    const currentDate = moment();

    return listVoucher.filter(voucher => {
        try {
            const fromDate = moment(voucher.vocher_id.fromDate);
            const toDate = moment(voucher.vocher_id.toDate);
            const status = voucher.is_used;

            console.log(`fromDate: ${fromDate}, toDate: ${toDate}, status: ${status}`);

            return (
                (currentDate.isBetween(fromDate, toDate) ||
                    currentDate.isSame(fromDate) ||
                    currentDate.isSame(toDate)) && status === false
            );
        } catch (error) {
            console.error(`Error filtering voucher: ${error.message}`);
            return false;
        }
    });
}

exports.getVoucherByVoucherId = async (req, res) => {
    let voucherId = req.body.voucherId;
    try {
        let voucher = await VoucherModel.voucherModel.findById(voucherId);
        return res.send({message: "get voucher success", voucher: voucher, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
const VoucherModel = require("../models/model.voucher")
const UserModel = require("../models/model.user");
const moment = require("moment-timezone");
exports.addVoucherForOneUser = async (req, res) => {
    let userId = req.body.userId;
    let title = req.body.title;
    let content = req.body.content;
    let price = req.body.price;
    let toDate = req.body.toDate;
    let fromDate = req.body.fromDate;
    if (title == null) {
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
    if (userId == null) {
        return res.send({message: "userId is required", code: 0});
    }
    try {
        let user = await UserModel.userModel.findById(userId);
        if(!user){
            return res.send({message: "user not found", code: 0});
        }
        let voucher = new VoucherModel.voucherModel({
            userId: userId,
            title: title,
            content: content,
            price: price,
            toDate: toDate,
            fromDate: fromDate
        });
        await voucher.save();
        return res.send({message: "add voucher success", code: 1});
    } catch (e) {
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.addVoucherForAllUser = async (req, res) => {
    let title = req.body.title;
    let content = req.body.content;
    let price = req.body.price;
    let toDate = req.body.toDate;
    let fromDate = req.body.fromDate;
    if (title == null) {
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
    let voucherNew = new VoucherModel.voucherModel();
    try {
        let listUser = await UserModel.userModel.find();
        await Promise.all(listUser.map(async item => {
            let voucher = new VoucherModel.voucherModel({
                idAll: voucherNew._id.toString(),
                userId: item._id.toString(),
                title: title,
                content: content,
                price: price,
                toDate: toDate,
                fromDate: fromDate
            });
            await voucher.save();
        }))
        return res.send({message: "add voucher success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.getVoucherByUserId = async (req, res) => {
    let userId = req.body.userId;
    if (userId == null) {
        return res.send({message: "userId is required", code: 0});
    }
    try {
        let listVoucher = await VoucherModel.voucherModel.find({userId: userId});
        let listVoucherFill = filterNotificationsForUser(listVoucher)
        return res.send({message: "get list voucher success", listVoucher: listVoucherFill, code: 1});
    } catch (e) {
        console.log(e.message);
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
    let title = req.body.title;
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
            title: voucher.title,
            content: voucher.content,
            price: voucher.price,
            toDate: voucher.toDate,
            fromDate: voucher.fromDate
        }
        if (title !== null) {
            newVoucher.title = title;
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
exports.getAllVoucher = async (req, res) => {
    try {
        let listVoucher = await VoucherModel.voucherModel.find();
        let listVoucherFill = filterNotificationsForUser(listVoucher)
        return res.send({message: "get list voucher success", listVoucher: listVoucherFill, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.getAllVoucherNoFill = async (req, res) => {
    try {
        let listVoucher = await VoucherModel.voucherModel.find();
        return res.send({message: "get list voucher success", listVoucher: listVoucher, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
function filterNotificationsForUser(listVoucher) {
    const currentDate = moment();
    return listVoucher.filter(notification => {
        const fromDate = moment(notification.fromDate);
        const toDate = moment(notification.toDate);
        return (
            (currentDate.isBetween(fromDate, toDate) ||
                currentDate.isSame(fromDate) ||
                currentDate.isSame(toDate)) && notification.status === "unused"
        );
    });
}
exports.getVoucherById = async (req,res)=>{
    let voucherId = req.body.voucherId;
    if(voucherId === null){
        return res.send({message:"voucher id is required", code: 0 })
    }
    try {
        let voucher = await VoucherModel.voucherModel.findById(voucherId);
        if(!voucher){
            return res.send({message:"voucher not found", code: 0 })
        }
        return res.send({message: "get list voucher success", listVoucher: voucher, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
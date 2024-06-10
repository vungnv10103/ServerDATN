const NotificationModel = require("../modelsv2/model.notification");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const CustomerModel = require("../modelsv2/model.customer");
const MapNotiCus = require("../modelsv2/model.map_notifi_cust");
exports.getNotification = async (req, res) => {
    try {
        let notification = await NotificationModel.notificationModel.find();
        return res.send({message: "get Notification success", notification: notification, code: 1})
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.addNotification = async (req, res) => {

    let title = req.body.title;
    let content = req.body.content;
    let img = req.body.img;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    if (title == null) {
        return res.send({message: "title is required", code: 0});
    }
    if (content == null) {
        return res.send({message: "content is required", code: 0});
    }
    if (img == null) {
        return res.send({message: "img is required", code: 0});
    }
    if (create_time == null) {
        return res.send({message: "create_time is required", code: 0});
    }
    try {
        let notification = new NotificationModel.notificationModel({
            title: title,
            content: content,
            img: img,
            create_time: create_time,
        });
        await notification.save();
        return res.send({message: "add notification success", code: 1});
    } catch (e) {
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.deleteNotification = async (req, res) => {
    let notificationId = req.body.notificationId;
    if (notificationId == null) {
        return res.send({message: "notìicationId is required", code: 0});
    }
    try {
        await NotificationModel.notificationModel.deleteMany({_id: notificationId});
        return res.send({message: "delete notification success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.editNotification = async (req, res) => {
    let title = req.body.title;
    let content = req.body.content;
    let img = req.body.img;
    let notificationId = req.body.notificationId;
    if (notificationId == null) {
        return res.send({message: "notificationId is required", code: 0});
    }
    try {
        let notifiaction = await NotificationModel.notificationModel.findOne({idAll: notificationId});
        let newNotification = {
            title: notifiaction.title,
            content: notifiaction.content,
            img: notifiaction.img,
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
exports.getNotificationByUser = async (req, res) => {
    try {
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findById(data.cus._id);
        let notification = await MapNotiCus.mapNotificationModel.find({customer_id: cus._id}).populate("notification_id");
        notification.sort((b, a) => moment(a.create_time, "YYYY-MM-DD-HH:mm:ss") - moment(b.create_time, "YYYY-MM-DD-HH:mm:ss"));
        return res.send({message: "get Notification success", data: notification, code: 1})
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
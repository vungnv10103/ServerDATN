const NotificationPrivate = require("../models/model.notification.private");
const NotificationPublic = require("../models/model.notification.pulic");
const UserModel = require("../models/model.user");
const admin = require('firebase-admin');
const serviceAccount = require('../serviceaccountkey/datn-789e4-firebase-adminsdk-nbmof-aa2593c4f9.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const moment = require("moment-timezone");
exports.addNotificationPublic = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    let title = req.body.title;
    let content = req.body.content;
    if (title == null) {
        return res.send({message: "title is required", code: 0});

    }
    if (content == null) {
        return res.send({message: "content is required", code: 0});
    }
    try {
        let user = await UserModel.userModel.find();
        await Promise.all(user.map(item => {
            if (item.fcm != null) {
                console.log(item.fcm);
                sendMessage(item.fcm, title, content);
            }
        }));
        let notification = new NotificationPublic.notificationPublicModel({
            title: title,
            content: content,
            date: date_time
        })
        await notification.save();
        return res.send({message: "add notification success", code: 1});
    } catch (e) {
        console.log(e.message)
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.addNotificationPrivate = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    let title = req.body.title;
    let content = req.body.content;
    let userId = req.body.userId;
    let img = req.body.img;
    if (userId == null) {
        return res.send({message: "userId is required", code: 0});
    }
    if (title == null) {
        return res.send({message: "title is required", code: 0});
    }
    if (content == null) {
        return res.send({message: "content is required", code: 0});
    }
    if (img == null) {
        return res.send({message: "img is required", code: 0});
    }
    try {
        let user = await UserModel.userModel.findById(userId);
        if (!user) {
            return res.send({message: "user not found", code: 0});
        }
        if (user.fcm !== null) {
            sendMessage(user.fcm, title, content);
        }
        let notification = new NotificationPrivate.notificationPrivateModel({
            title: title,
            content: content,
            date: date_time,
            userId: userId,
            img: img,
        })
        await notification.save();
        return res.send({message: "add notification success", code: 1});
    } catch (e) {
        console.log(e.message)
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.editNotification = async (req, res) => {
    let title = req.body.title;
    let userId = req.body.userId;
    let content = req.body.content;
    let notificationId = req.body.notificationId;
    if (notificationId == null) {
        return res.send({message: "notificationId is required", code: 0});
    }
    try {
        let notification = await NotificationPrivate.notificationPrivateModel.findById(notificationId);
        let notificationPublic = await NotificationPublic.notificationPublicModel.findById(notificationId);
        if (notification) {
            if (userId !== null) {
                let user = await UserModel.userModel.findById(userId);
                if (!user) {
                    return res.send({message: "user not found", code: 0});
                }
                notification.userId = userId;
            }
            if (title !== null) {
                notification.titile = title;
            }
            if (content !== null) {
                notification.conten = content;
            }
            await notification.save();
            let user = await UserModel.userModel.findById(notification.userId.toString());
            if (user.fcm !== null) {
                sendMessage(user.fcm, user.title, user.content);
            }
            return res.send({message: "edit notification success", code: 1});
        }
        if (notificationPublic) {
            if (title !== null) {
                notificationPublic.title = title;
            }
            if (content !== null) {
                notificationPublic.content = content;
            }
            await notificationPublic.save();
            let user = await UserModel.userModel.find();
            await Promise.all(user.map(item => {
                if (item.fcm != null) {
                    console.log(item.fcm);
                    sendMessage(item.fcm, item.title, item.content);
                }
            }));
            return res.send({message: "edit notification success", code: 1});
        }
        return res.send({message: "notification not found", code: 0});
    } catch (e) {
        console.log(e.message)
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.deleteNotification = async (req, res) => {
    let notificationId = req.body.nonotificationId;
    if (notificationId == null) {
        return res.send({message: "notificationId is required", code: 0});
    }
    try {
        let notificationPrivate = await NotificationPrivate.notificationPrivateModel.findById(notificationId);
        let notificationPublic = await NotificationPublic.notificationPublicModel.findById(notificationId);
        if (notificationPrivate) {
            await NotificationPrivate.notificationPrivateModel.deleteOne({_id: notificationId});
            return res.send({message: "delete notification success", code: 1});
        }
        if (notificationPublic) {
            await NotificationPublic.notificationPublicModel.deleteOne({_id: notificationId});
            return res.send({message: "delete notification success", code: 1});
        }
        return res.send({message: "notification not found", code: 0});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
exports.getPrivateNotification = async (req, res) => {
    let userId = req.body.userId;
    if (userId == null) {
        return res.send({message: "userId is required", code: 0});
    }
    try {
        let notification = await NotificationPrivate.notificationPrivateModel.find({userId:userId});
        return res.send({message: "get list notification success", code: 1, notification: notification});

    } catch (e) {
        console.log(e.message);
        return res.send({message: "get list notification fail", code: 0});
    }
}
exports.getPublicNotification = async (req, res) => {
    try {
        let notification = await NotificationPublic.notificationPublicModel.find();
        return res.send({message: "get list notification success", code: 1, notification: notification});

    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
const sendMessage = (registrationToken, title, body) => {
    let message = {
        data: {
            title: title,
            body: body,
        },
        token: registrationToken,
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
}


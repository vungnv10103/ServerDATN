const ConversationModel = require("../models/model.conversations");
const MessageModel = require("../models/model.message");
const fs = require("fs");
const path = require("path");
const UploadFile = require("../models/uploadFile");
const moment = require("moment-timezone");
const { get } = require("http");
const crypto = require("crypto");
require("dotenv").config();

const matchImg = [
    "image/*",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/jp2",
    "image/heif",
    "image/jfif",
];
const matchVideo = [
    "video/mp4",
    "video/x-msvideo",
    "video/x-matroska",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/x-flv",
    "video/webm",
    "video/3gpp",
    "video/ogg",
    "video/mpeg",
];
exports.addMessage = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    let conversation = req.body.conversation;
    let senderId = req.body.senderId;
    let receiverId = req.body.receiverId;
    let contentMessage = req.body.message;
    let fileUpload;
    let imageUpload;
    let videoUpload;

    try {
        if (req.files["filess"]) {
            fileUpload = req.files["filess"];
        }
        if (req.files["images"]) {
            imageUpload = req.files["images"];
        }
        if (req.files["video"]) {
            videoUpload = req.files["video"];
        }

    } catch (e) {
        console.log(`api.message: ${e.message} at ${timestamp}`);
        return res.send({ message: "error read fields file upload", code: 0, time: timestamp });
    }

    let isSendFile = false;
    let isSendImage = false;
    let isSendVideo = false;
    if (fileUpload !== undefined) {
        isSendFile = true;
    }
    if (imageUpload !== undefined) {
        isSendImage = true;
    }
    if (videoUpload !== undefined) {
        isSendVideo = true;
    }

    if (conversation == null) {
        return res.send({ message: "conversation is required", code: 0 });
    }
    if (senderId == null || senderId.length == 0) {
        return res.send({ message: "senderId is required", code: 0 });
    }
    if (receiverId == null || receiverId.length == 0) {
        return res.send({ message: "receiverId is required", code: 0 });
    }

    if (timestamp == null) {
        return res.send({ message: "error get time", code: 0 });
    }

    if (contentMessage == null || contentMessage.length == 0) {
        if (!isSendFile && !isSendImage && !isSendVideo) {
            console.log("send message or file or image or video");
            console.log(isSendFile, isSendImage, isSendVideo);
            return res.send({ message: "send message or file or image or video", code: 0, time: timestamp });
        }
        else {
            console.log("anony erorr api message");
        }
    }

    let isFormat = true;
    if (isSendFile) {
        // check file
    }
    if (isSendImage) {
        imageUpload.map((item) => {
            if (matchImg.indexOf(item.mimetype) === -1) {
                isFormat = false;
            }
        });
    }
    if (isSendVideo) {
        if (matchVideo.indexOf(videoUpload[0].mimetype) === -1) {
            isFormat = false;
        }
    }

    if (isFormat === false) {
        return res.send({
            message: "The uploaded file is not in the correct format",
            code: 0,
        });
    }

    let messageEncrypted = ''
    const algorithm = 'aes-128-cbc';
    const IV_LENGTH = 16;
    const ENCRYPTION_KEY = process.env.API_KEY;
    const hash = crypto.createHash("sha1");
    hash.update(ENCRYPTION_KEY)
    const digestResult = hash.digest();
    // Chuyển đổi kết quả digest thành Uint8Array
    const uint8Array = new Uint8Array(digestResult);
    // Sử dụng slice từ Uint8Array.prototype
    const keyUint8Array = uint8Array.slice(0, 16);
    // Chuyển đổi kết quả Uint8Array về Buffer nếu cần
    const keyBuffer = Buffer.from(keyUint8Array);

    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    let encrypted = cipher.update(contentMessage, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    messageEncrypted = iv.toString('hex') + ':' + encrypted;


    let message = new MessageModel.messageModel({
        conversation: conversation,
        senderId: senderId,
        receiverId: receiverId,
        message: messageEncrypted,
        status: "unseen",
        deleted: false,
        video: "",
        timestamp: timestamp
    });
    // console.log(isSendFile, isSendImage, isSendVideo);
    if (!isSendFile && !isSendImage && !isSendVideo) {
        // send no message
    }
    else {
        if (isSendFile) {
            try {
                let list_file = await UploadFile.uploadFiles(
                    req,
                    message._id.toString(),
                    `messages/${message.conversation}/files`,
                    fileUpload,
                    ".json"
                );
                if (list_file === 0) {
                    return res.send({ message: "upload file fail", code: 0, time: timestamp });
                }
                message.filess = list_file;
            } catch (e) {
                console.log(e);
                return res.send({ message: e.message.toString(), code: 0, time: timestamp });
            }
        }
        if (isSendImage) {
            try {
                let list_img = await UploadFile.uploadFiles(
                    req,
                    message._id.toString(),
                    `messages/${message.conversation}/images`,
                    imageUpload,
                    ".jpg"
                );
                if (list_img === 0) {
                    return res.send({ message: "upload image fail", code: 0, time: timestamp });
                }
                message.images = list_img;
            } catch (e) {
                console.log(e);
                return res.send({ message: e.message.toString(), code: 0, time: timestamp });
            }
        }
        if (isSendVideo) {
            try {
                let video = await UploadFile.uploadFile(
                    req,
                    message._id.toString(),
                    `messages/${message.conversation}/videos`,
                    videoUpload[0],
                    ".mp4"
                );
                if (video === 0) {
                    return res.send({ message: "upload video fail", code: 0, time: timestamp });
                }
                message.video = video;
            } catch (e) {
                console.log(e);
                return res.send({ message: e.message.toString(), code: 0, time: timestamp });
            }
        }
    }

    try {
        await message.save()
        // console.log(`message: ${message}`);
        return res.send({ dataMessage: message, message: "add message success", code: 1, time: timestamp });
    } catch (e) {
        console.log(e);
        return res.send({ message: "add message fail", code: 0, time: timestamp });
    }

};
exports.getListMessage = async (req, res) => {

};
exports.getMessageById = async (req, res) => {

};

exports.getMessageByIDConversation = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    let conversationID = req.body.conversationID;
    if (conversationID == null || conversationID.length <= 0) {
        return res.send({ message: "conversationID is required" })
    }

    try {
        const dataMessage = await MessageModel.messageModel.find({ conversation: conversationID })
            .populate("conversation")
        if (!dataMessage) {
            return res.send({ message: "message not found", code: 0 , time: timestamp});
        }
        return res.send({ dataMessage: dataMessage, message: "get message success", code: 1, time: timestamp })
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "get message fail", code: 0, time: timestamp });
    }
}
exports.getMessageLatest = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    let conversationIDs = req.body.conversationIDs;
    if (conversationIDs == null || conversationIDs.length <= 0) {
        return res.send({ message: "conversationIDs is required" })
    }


    try {
        const latestMessages = [];
        for (const conversationId of conversationIDs) {
            // Tìm tin nhắn mới nhất cho conversation hiện tại
            const latestMessage = await MessageModel.messageModel.findOne({ conversation: conversationId })
                .sort({ timestamp: -1 })
                .populate("conversation")
                // .populate("conversation", "name") // Populate thông tin của conversation (chỉ lấy trường "name")
                .exec();

            if (latestMessage) {
                latestMessages.push(latestMessage);
            }
        }
        return res.send({ dataMessage: latestMessages, message: "get conversation + message success", code: 1, time: timestamp })
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "get message fail", code: 0, time: timestamp });
    }
};

exports.deleteMessage = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    let idMessage = req.body.idMsg;
    if (idMessage == null || idMessage.length <= 0) {
        return res.send({ message: "idMessage is required" })
    }

    try {
        let message = await MessageModel.messageModel.findByIdAndUpdate(idMessage, { deleted: true });
        if (!message) {
            return res.send({ message: "message not found" })
        }
        let filess = message.filess;
        let images = message.images;
        let video = message.video;

        let pathFolderDelete = images.split("/")[5];
        let isRemove = true;
        images.map((item) => {
            if (item.split("3000")[1] !== undefined) {
                fs.unlink(
                    path.join(__dirname, "../public" + item.split("3000")[1]),
                    (err) => {
                        if (err) {
                            console.log(err.message);
                            isRemove = false;
                        }
                    }
                );
            }
        });

        if (isRemove === false) {
            return res.send({ message: "delete product fail", code: 0 });
        }

        if (pathFolderDelete !== undefined) {
            fs.rmdir(
                path.join(__dirname, "../public/images/images/" + pathFolderDelete),
                async (err) => {
                    if (err) {
                        isRemove = false;
                        console.log(err.message);
                    } else {
                        await MessageModel.messageModel.deleteOne({ _id: idMessage });
                        return res.send({ message: "Delete messages success", code: 1, time: timestamp });
                    }
                }
            );
        }
        if (isRemove === false) {
            return res.send({ message: "delete product fail", code: 0, time: timestamp });
        }

    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0, time: timestamp });
    }
};

exports.updateStatusMessage = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    let idMessage = req.body.idMsg;
    let status = req.body.status;
    if (idMessage == null || idMessage.length <= 0) {
        return res.send({ message: "idMessage is required" })
    }
    if (status == null || status.length <= 0) {
        return res.send({ message: "status is required" })
    }

    try {
        let messageUpdate = await MessageModel.messageModel.findByIdAndUpdate(idMessage, { status: status });
        if (!messageUpdate) {
            return res.send({ message: "message not found" })
        }
        return res.send({ message: "update status message success", code: 1, time: timestamp })
    } catch (e) {
        console.log(e.message);
        return res.send({ dataMessage: messageUpdate, message: e.message.toString(), code: 0, time: timestamp });
    }
};
exports.editMessage = async (req, res) => {

}
const ConversationModel = require("../models/model.conversations")
const UploadFile = require("../models/uploadFile");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const UserModel = require("../models/model.user");
const match = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/jp2",
    "image/heif"];


exports.createConversation = async (req, res) => {
    let idUserLoged = req.cookies.Uid || req.body.idUserLoged;
    if (idUserLoged == null || idUserLoged.length <= 0) {
        return res.send({ message: "wrong token", code: 0 });
    }
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    let name = req.body.name;
    let idUserSelected = req.body.idUserSelected;

    if (name == null || name.length == 0) {
        return res.send({ message: "name is required", code: 0 });
    }
    if (idUserSelected == null || idUserSelected.length == 0) {
        return res.send({ message: "user selected is null", code: 0 });
    }
    let arrayID = [idUserLoged, ...idUserSelected]

    // console.log(`selected: ${arrayID}`);

    ConversationModel.conversationModel.findOne({ user: { $all: arrayID } })
        .then(async conversation => {
            if (conversation) {
                return res.send({ id: conversation._id, message: " conversation exist", code: 1 });
            } else {
                let conversation = new ConversationModel.conversationModel({
                    name: name,
                    user: [idUserLoged, ...idUserSelected],
                    timestamp: timestamp,
                })
                await conversation.save();
                return res.send({ id: conversation._id, message: "add conversation success", code: 1 });
            }
        })
        .catch(err => {
            console.error(err);
            return res.send({ message: "Add conversation fail", code: 0 })
        });
};

exports.editConversation = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss");
    let name = req.body.name;
    let conversationId = req.body.conversationId;
    if (conversationId == null || conversationId.length == 0) {
        return res.send({ message: "conversationId is require", code: 0 });
    } else if (name == null || name.length == 0) {
        return res.send({ message: "name is require", code: 0 });
    }
    try {
        let conversation = await ConversationModel.conversationModel.findById(conversationId);
        if (!conversation) {
            return res.send({ message: "conversation not found", code: 0 });
        }
        if (name != null && name.length > 0) {
            conversation.name = name;
            conversation.timestamp = timestamp;
        }

        await conversation.save();
        return res.send({ message: "Edit conversation success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "conversation not found", code: 0 });
    }

};
exports.deleteConversation = async (req, res) => {
    let conversationId = req.body.conversationId;
    if (conversationId == null) {
        return res.send({ message: "conversation not found", code: 0 });

    }
    try {
        let conversation = await ConversationModel.conversationModel.findById(conversationId);
        if (!conversation) {
            return res.send({ message: "conversation not found" });
        }

        await ConversationModel.conversationModel.deleteOne({ _id: conversationId });
        return res.send({ message: "Delete conversation success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "delete conversation fail", code: 0 });
    }
}
exports.getConversationByID = async (req, res) => {
    let conversationId = req.body.conversationId;
    if (conversationId == null || conversationId.length == 0) {
        return res.send({ message: "conversationId is required" })
    }
    try {
        let conversation = await ConversationModel.conversationModel.findById(conversationId);
        if (!conversation) {
            return res.send({ message: "conversation not found" })
        }
        res.send({ conversation: conversation, message: "get conversation success", code: 1 })
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "get conversation fail", code: 0 });
    }
}

exports.getConversationByIDUser = async (req, res) => {
    let idUser = req.body.idUser;
    if (idUser == null || idUser.length == 0) {
        return res.send({ message: "idUser is required" })
    }
    try {
        let conversation = await ConversationModel.conversationModel.find({ user: idUser }).populate("user");
        if (!conversation) {
            return res.send({ message: "conversation not found" })
        }
        res.send({ conversation: conversation, message: "get conversation success", code: 1 })
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "get conversation fail", code: 0 });
    }
}

exports.getConversation = async (req, res) => {
    try {
        let listConversation = await ConversationModel.conversationModel.find();
        return res.send({ listConversation: listConversation, message: "get list conversation success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "conversation not found", code: 0 })
    }
}
exports.updateconversationID = async (req, res) => {
    let userId = req.body.userId;
    let conversationID = req.body.conversationId;
    if (conversationID == null) {
        return res.send({ message: "conversationID is required", code: 0 });
    }
    if (userId == null) {
        return res.send({ message: "user id is required", code: 0 });
    }
    try {
        let user = await UserModel.userModel.findById(userId);
        if (!user) {
            return res.send({ message: "user not found", code: 0 });
        }
        user.fcm = conversationID;
        await user.save();
        return res.send({ message: "update conversationID success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "update conversationID fail", code: 0 })
    }
}

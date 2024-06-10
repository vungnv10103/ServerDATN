const ConversationModel = require("../modelsv2/model.conversation");
const MessageModel = require("../modelsv2/model.message");
const CustomerModel = require("../modelsv2/model.customer");
const AdminModel = require("../modelsv2/model.admin");
const moment = require("moment-timezone");
const mongoose = require('mongoose');
const crypto = require("crypto");
require("dotenv").config();

exports.createConversation = async (req, res) => {
    // console.log(req.body);
    let idUserLoged = req.body.creator_id;
    let idUserSelected = req.body.receive_id;
    if (idUserLoged == undefined || idUserLoged.length == 0) {
        return res.send({ message: "creator_id is null", code: 0 });
    }
    if (idUserSelected == undefined || idUserSelected.length == 0) {
        return res.send({ message: "receive_id is null", code: 0 });
    }
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    try {
        let idLoged = new mongoose.Types.ObjectId(idUserLoged);
        let idSelected = new mongoose.Types.ObjectId(idUserSelected);
        let conversation = await ConversationModel.conversationModel.findOne({ receive_id: idSelected })
        if (conversation == null) {
            let newConversation = new ConversationModel.conversationModel({
                creator_id: idLoged,
                receive_id: idSelected,
                created_at: timestamp,
                updated_at: "",
                deleted_at: ""
            });
            await newConversation.save();
            let reponseConversation = {
                conversation_id: newConversation._id,
                creator_id: newConversation.creator_id,
                receive_id: newConversation.receive_id,
                created_at: newConversation.created_at,
                updated_at: newConversation.updated_at,
                deleted_at: newConversation.deleted_at,
            }
            return res.send({ conversation: reponseConversation, message: "add conversation success", code: 1, time: timestamp });
        }
        else {
            let reponseConversation = {
                conversation_id: conversation._id,
                creator_id: conversation.creator_id,
                receive_id: conversation.receive_id,
                created_at: conversation.created_at,
                updated_at: conversation.updated_at,
                deleted_at: conversation.deleted_at,
            }
            return res.send({ conversation: reponseConversation, message: "conversation exist", code: 1, time: timestamp });
        }
    } catch (e) {
        console.error(e);
        return res.send({ message: "Add conversation fail", code: 0, time: timestamp })
    }
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

async function decryptedMessage(encryptedMessage) {
    let message = ''
    if (encryptedMessage.length <= 0) {
        return encryptedMessage
    }
    const ENCRYPTION_KEY = process.env.API_KEY;
    const algorithm = process.env.ALGORITHM;
    const hash = crypto.createHash("sha1");
    hash.update(ENCRYPTION_KEY)
    const digestResult = hash.digest();
    const uint8Array = new Uint8Array(digestResult);
    const keyUint8Array = uint8Array.slice(0, 16);
    const keyBuffer = Buffer.from(keyUint8Array);
    let textParts = encryptedMessage.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf8');
    message = decrypted;

    return message;
}

async function getDataConversation(idUser) {
    let listConversation = await ConversationModel.conversationModel.find({ receive_id: idUser });

    let dataIDuser = []
    listConversation.map((con) => {
        if (con.creator_id != idUser) {
            dataIDuser.push(con.creator_id);
        }
        if (con.creator_id == idUser) {
            dataIDuser.push(con.receive_id);
        }
    })

    let dataUser = [];
    await Promise.all(
        dataIDuser.map(async (id) => {
            try {
                // !
                let user = await AdminModel.adminModel.findById(id);
                dataUser.push(user);
            } catch (error) {
                console.log(`get data user: ${error}`);
            }
        })
    );

    let dataUserRender = []
    let userRender = {};
    await Promise.all(
        dataUser.map(async (user) => {
            userRender[user._id] = {
                id: user._id,
                name: user.full_name,
                avatar: user.avatar,
                email: user.email,
                phone: user.phone_number
            }
        })
    );

    for (let userID in userRender) {
        dataUserRender.push(userRender[userID]);
    }

    let dataLastMessage = [];
    await Promise.all(
        listConversation.map(async (con) => {
            let listMessage = await MessageModel.messageModel.find({ conversation_id: con._id });
            if (listMessage.length > 0) {
                const latestMessage = listMessage.reduce((acc, current) => {
                    const accDate = new Date(acc.created_at);
                    const currentDate = new Date(current.created_at);
                    return accDate > currentDate ? acc : current;
                });
                dataLastMessage.push(latestMessage);
            }
        })
    );

    /* Data Preview
        console.log(listConversation);
        console.log(dataUserRender);
        console.log(dataLastMessage);
        console.log(dataConversation);
        */

    let dataConversation = [];
    // Lặp qua mảng listConversation
    for (let conversation of listConversation) {
        // ! Tìm thông tin user trong dataUserRender
        let userData = dataUserRender.find(user => user.id.toString() === conversation.creator_id.toString());
        // Tìm thông tin last message trong dataLastMessage
        let lastMessage = dataLastMessage.find(message => message.conversation_id.toString() === conversation._id.toString());
        // ! Tạo đối tượng mới với thông tin kết hợp từ ba mảng
        let message = await decryptedMessage(lastMessage ? lastMessage.message : '');
        let newMsg = lastMessage ? lastMessage.deleted_at.length > 0 ? "Đã gỡ 1 tin nhắn" : message : "";
        let newMsg2 = lastMessage ? lastMessage.message_type == "image" ? "Đã gửi 1 ảnh" : newMsg : "";
        let newMsg3 = lastMessage ? lastMessage.message_type == "video" ? "Đã gửi 1 video" : newMsg2 : "";
        let combinedData = {
            conversation_id: conversation._id,
            sender_id: lastMessage ? lastMessage.sender_id : "",
            message: lastMessage ? message.sender_id == idUser ? "Bạn: " + newMsg3 : newMsg3 : "",
            message_type: lastMessage ? lastMessage.message_type : '',
            idMsg: lastMessage ? lastMessage._id : "",
            status: lastMessage ? lastMessage.status : 'unseen',
            creator_id: conversation.creator_id,
            receive_id: conversation.receive_id,
            msg_deleted_at: lastMessage ? lastMessage.deleted_at : "",
            created_at: lastMessage ? lastMessage.created_at : conversation.created_at,
            updated_at: conversation.updated_at,
            deleted_at: conversation.deleted_at,
            __v: conversation.__v,
            userID: userData ? userData.id : "",
            name: userData ? userData.name : '',
            avatar: userData ? userData.avatar : '',
            email: userData ? userData.email : '',
            phone: userData ? userData.phone : ''
        };
        dataConversation.push(combinedData);
    }

    return dataConversation;
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
        let conversation = await getDataConversation(idUser);
        if (!conversation) {
            return res.send({ message: "conversation not found", code: 0 })
        }
        return res.send({ conversation: conversation, message: "get conversation success", code: 1 })
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

exports.getAnyUserById = async (req, res) => {
    let userId = req.body.userId;
    if (userId == null || userId.length == 0) {
        return res.send({ message: "userId is required", code: 0 });
    }
    try {
        let user = await AdminModel.adminModel.findById({ _id: userId },
            { avatar: true, email: true, full_name: true, phone_number: true });
        return res.send({ user: user, message: "get user success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};

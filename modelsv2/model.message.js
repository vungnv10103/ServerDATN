const db = require("../models/database");

const status = "unseen";

const messageSchema = db.mongoose.Schema(
    {
        conversation_id: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "conversations",
            required: true
        },
        sender_id: { type: db.mongoose.Schema.Types.ObjectId, required: true },
        message: { type: String, required: true },
        message_type: { type: String, required: true },
        status: { type: String, required: true, default: status },
        created_at: { type: String, required: true },
        deleted_at: { type: String, required: false, default: "" }
    },
    {
        collection: "Messages",
    }
);
const messageModel = db.mongoose.model("messages", messageSchema);
module.exports = { messageModel };

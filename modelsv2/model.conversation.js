const db = require("../models/database");
const conversationSchema = db.mongoose.Schema(
    {
        creator_id: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "admins",
            required: true
        },
        receive_id: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "customer",
            required: true
        },
        created_at: { type: String, required: true },
        updated_at: { type: String, required: false },
        deleted_at: { type: String, required: false }
    },
    {
        collection: "Conversations",
    }
);
const conversationModel = db.mongoose.model("conversations", conversationSchema);
module.exports = { conversationModel };

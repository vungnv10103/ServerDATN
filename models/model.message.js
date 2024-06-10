const database = require("./database");
const messageSchema = database.mongoose.Schema(
  {
    conversation: {
      type: database.mongoose.Schema.Types.ObjectId,
      ref: "conversation",
      required: true
    },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: false },
    filess: [{ type: String, required: false }],
    images: [{ type: String, required: false }],
    video: { type: String, required: false },
    status: { type: String, required: true }, // seen, unseen, hidden, received, sent,
    deleted: { type: Boolean, required: true },
    timestamp: { type: String, required: true },
  },
  {
    collection: "Message",
  }
);
const messageModel = database.mongoose.model("message", messageSchema);
module.exports = { messageModel };

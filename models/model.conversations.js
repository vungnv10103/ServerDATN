const database = require("./database");
const conversationSchema = database.mongoose.Schema(
  {
    name: { type: String, required: true },
    user: [{ type: database.mongoose.Schema.Types.ObjectId, ref: 'user', required: false }],
    timestamp: { type: String, required: true },
  },
  {
    collection: "Conversation",
  }
);
const conversationModel = database.mongoose.model("conversation", conversationSchema);
module.exports = { conversationModel };

const mongoose = require("./database");
const feedbackSchema = mongoose.mongoose.Schema(
  {
    userId: {
      type: mongoose.mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    productId: {
      type: mongoose.mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    avtUser: { type: String, required: true },
    nameUser: { type: String, required: true },
    rating: { type: Number, required: false },
    comment: { type: String, required: true },
    date: { type: String, required: true },
  },
  {
    collection: "Feedback",
  }
);
const modelFeedback = mongoose.mongoose.model("feedback", feedbackSchema);
module.exports = { modelFeedback };

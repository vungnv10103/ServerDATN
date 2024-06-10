const db = require("../models/database");
const feedBackSchema = db.mongoose.Schema(
  {
    customer_id: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    product_id: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    rating: { type: String, required: true },
    comment: { type: String, required: true },
    create_time: { type: String },
  },
  {
    collection: "FeedBacks",
  }
);
const feedBackModel = db.mongoose.model("feedbacks", feedBackSchema);
module.exports = { feedBackModel };

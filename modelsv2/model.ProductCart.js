const db = require("../models/database");
const productCartSchema = db.mongoose.Schema(
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
    quantity: {
      type: String,
      required: true,
    },
    create_time: { type: String },
  },
  {
    collection: "ProductCarts",
  }
);
const productCartModel = db.mongoose.model("productCarts", productCartSchema);
module.exports = { productCartModel };

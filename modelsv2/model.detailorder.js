const db = require("../models/database");
const detailOrderSchema = db.mongoose.Schema({
    order_id: {type: db.mongoose.Schema.Types.ObjectId, ref: "orders", required: true},
    product_id: {type: db.mongoose.Schema.Types.ObjectId, ref: "products", required: true},
    quantity: {type: String, required: true}
}, {
    collection: "Detail_Order",
});
const detailOrderModel = db.mongoose.model("detail_order", detailOrderSchema);
module.exports = {detailOrderModel};
const db = require("../models/database");
const deliveryAddressSchema = db.mongoose.Schema({
    customer_id: {type: db.mongoose.Schema.Types.ObjectId, ref: "customer", required: true},
    name: {type: String, required: true},
    city: {type: String, required: true},
    street: {type: String, required: true},
    phone: {type: String, required: true},
    create_time: {type: String, required: true},
},{
    collection:"DeliveryAddress"
});
const deliveryAddressModel = db.mongoose.model("delivery_address",deliveryAddressSchema);
module.exports = {deliveryAddressModel};
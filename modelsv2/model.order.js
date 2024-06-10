const db = require("../models/database");
const orderSchema = db.mongoose.Schema({
    map_voucher_cus_id: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: "map_voucher_cust",
        required: false,
        default: null
    },
    customer_id: {type: db.mongoose.Schema.Types.ObjectId, ref: "customer", required: false},
    employee_id: {type: db.mongoose.Schema.Types.ObjectId, ref: "employees", required: false, default: null},
    delivery_address_id: {type: db.mongoose.Schema.Types.ObjectId, ref: "delivery_address", required: false},
    status: {type: String, required: true, default: "WaitConfirm"},
    total_amount: {type: String, required: true, default: "0"},
    payment_methods: {type: String, required: true, default: "Thanh Toán Khi Nhận Hàng"},
    create_time: {type: String, required: true},
    guest_name: {type: String, required: false},
    guest_phoneNumber: {type: String, required: false},
    guest_address: {type: String, required: false},
}, {
    collection: "Orders"
});
const oderModel = db.mongoose.model("orders", orderSchema);
module.exports = {oderModel};
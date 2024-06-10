const db = require("../models/database");
const mapVoucherSchema = db.mongoose.Schema({
    vocher_id: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: "vouchers",
        required: true,
    },
    customer_id: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true,
    },
    is_used: {type: Boolean, required: true},
},{
    collection:"Map_Voucher_Cust"
});
const mapVoucherModel = db.mongoose.model("map_voucher_cust",mapVoucherSchema);
module.exports = {mapVoucherModel};
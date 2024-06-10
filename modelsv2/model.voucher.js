const db = require("../models/database");
const voucherSchema = db.mongoose.Schema({
    name: {type: String, required: true},
    content: {type: String, required: false},
    price: {type: String, required: false},
    fromDate: {type: String, required: false},
    toDate: {type: String, required: false},
    create_time: {type: String, required: false},
},{
    collection:"Vouchers"
});
const voucherModel = db.mongoose.model("vouchers",voucherSchema);
module.exports = {voucherModel};
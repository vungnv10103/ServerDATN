const db = require("./database");
const status = "unused";
const voucherSchema = db.mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    price: {type: String, required: true},
    fromDate: {type: String, required: true},
    toDate: {type: String, required: true},
    userId: {type: db.mongoose.Schema.Types.ObjectId, required: true},
    status: {type: String, default: status, required: true},
    idAll: {type: db.mongoose.Schema.Types.ObjectId, required: false, default: null},
}, {
    collection: "Voucher"
});
const voucherModel = db.mongoose.model("voucher", voucherSchema);
module.exports = {voucherModel};
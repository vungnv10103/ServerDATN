const db = require("../models/database");
const adminSchema = db.mongoose.Schema({
    full_name: {type: String, required: true},
    avatar: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    phone_number: {type: String, required: true},
    create_time: {type: String, required: true},
    otp: {type: String, required: false},
},{
    collection:"Admins"
});
const adminModel = db.mongoose.model("admins",adminSchema);
module.exports = {adminModel};
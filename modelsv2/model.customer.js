const db = require("../models/database");
const avatar = "https://inkythuatso.com/uploads/thumbnails/800/2023/03/9-anh-dai-dien-trang-inkythuatso-03-15-27-03.jpg";
const status = "Not verified";
const customerSchema = db.mongoose.Schema(
    {
        avatar: {type: String, default: avatar},
        email: {type: String, required: true},
        password: {type: String, required: true},
        full_name: {type: String, required: false},
        phone_number: {type: String, required: true},
        status: {type: String, required: true, default: status},
        otp: {type: String, required: false},
        fcm: {type: String, required: false},
        new_pass:{type: String, required: false},
        link_reset_pass : {type:String, required: false},
        create_time: {type: String, required: true},
    },
    {
        collection: "Customer",
    }
);
const customerModel = db.mongoose.model("customer", customerSchema);
module.exports = {customerModel};
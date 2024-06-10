const db = require("./database");
const avatar = "https://inkythuatso.com/uploads/thumbnails/800/2023/03/9-anh-dai-dien-trang-inkythuatso-03-15-27-03.jpg";
const role = "Admin";
const adminSchema = db.mongoose.Schema(
    {
        avatar: {type: String, default: avatar},
        email: {type: String, required: true},
        password: {type: String, required: true},
        full_name: {type: String, required: false},
        phone_number: {type: String, required: true},
        role: {type: String, default: role},
        date: {type: String, required: true},
        otp: {type: String, required: false},
    },
    {
        collection: "Admin",
    }
)
const adminModel = db.mongoose.model("admin", adminSchema);
module.exports = {adminModel}
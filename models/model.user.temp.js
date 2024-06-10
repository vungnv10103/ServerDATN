const db = require("./database");
const avatar = "https://inkythuatso.com/uploads/thumbnails/800/2023/03/9-anh-dai-dien-trang-inkythuatso-03-15-27-03.jpg";
const role = "User";
const account_type = "Individual";
const userTempSchema = db.mongoose.Schema(
    {
        avatar: {type: String, default: avatar},
        email: {type: String, required: true},
        password: {type: String, required: true},
        full_name: {type: String, required: false},
        phone_number: {type: String, required: true},
        role: {type: String, default: role},
        address: [{type: db.mongoose.Schema.Types.ObjectId, ref: 'address', required: false}],
        date: {type: String, required: true},
        account_type: {type: String, default: account_type},
        otp: {type: String, required: true},
        link: {type: String, required: false}
    },
    {
        collection: "UserTemp",
    }
);
const userTemModel = db.mongoose.model("user_temp", userTempSchema);
module.exports = {userTemModel};
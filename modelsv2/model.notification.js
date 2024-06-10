const db = require("../models/database");
const notificationSchema = db.mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: false},
    img: {type: String, required: false},
    create_time: {type: String, required: false},
},{
    collection:"Notifications"
});
const notificationModel = db.mongoose.model("notifications",notificationSchema);
module.exports = {notificationModel};
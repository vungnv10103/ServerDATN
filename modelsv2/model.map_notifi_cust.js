const db = require("../models/database");
const mapNotifiSchema = db.mongoose.Schema({
    notification_id: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: "notifications",
        required: true,
    },
    customer_id: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true,
    },
    create_time: {type: String, required: true},
},{
    collection:"Map_Notification_Cust"
});
const mapNotificationModel = db.mongoose.model("map_notifi_cust",mapNotifiSchema);
module.exports = {mapNotificationModel};
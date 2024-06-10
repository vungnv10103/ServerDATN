const db = require("./database");
const notificationPublicSchema = db.mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    date: {type: String, required: true},
}, {
    collection: "NotificationPublic"
});
const notificationPublicModel = db.mongoose.model("notificationPublic", notificationPublicSchema);
module.exports = {notificationPublicModel}
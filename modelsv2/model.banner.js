const db = require('../models/database');
const bannerSchema = db.mongoose.Schema({
    admin_id:{type: db.mongoose.Schema.Types.ObjectId,ref:"admins",required: false},
    img: {type: String, required: false}
}, {
    collection: "Banners"
});
const bannerModel = db.mongoose.model("banners", bannerSchema);
module.exports = {bannerModel}
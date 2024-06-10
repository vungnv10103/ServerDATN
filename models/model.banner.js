const db = require('./database');
const bannerSchema = db.mongoose.Schema({
    img: {type: String, required: false}
}, {
    collection: "Banner"
});
const bannerModel = db.mongoose.model("banner", bannerSchema);
module.exports = {bannerModel}
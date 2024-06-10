const db = require("../models/database");
const productVideoSchema = db.mongoose.Schema({
    product_id: {type: db.mongoose.Schema.Types.ObjectId,ref:"products", required: true},
    video: {type: String, required: true},
},{
    collection:"Product_video"
});
const productVideoModel = db.mongoose.model("product_video",productVideoSchema);
module.exports = {productVideoModel};
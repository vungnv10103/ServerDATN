const db = require("../models/database");
const productImgSchema = db.mongoose.Schema({
    product_id: {type: db.mongoose.Schema.Types.ObjectId,ref:"products", required: true},
    img: {type: String, required: true},
},{
    collection:"Product_image"
});
const productImgModel = db.mongoose.model("product_image",productImgSchema);
module.exports = {productImgModel};
const db = require("../models/database");
const productSchema = db.mongoose.Schema({
    category_id: {type: db.mongoose.Schema.Types.ObjectId,ref:"categories",required: true},
    name: {type: String, required: true},
    ram: {type: String, required: false},
    rom: {type: String, required: false},
    color: {type: String, required: false},
    quantity: {type: String, required: true},
    price: {type:String, required:true},
    description: {type: String, required: true},
    sold: {type: String, required: false, default:"0"},
    img_cover: {type: String, required: true},
    status: {type: String, required: true, default:"stocking"},
    color_code: {type: String, required: true},
    create_time: {type: String, required: true},
},{
    collection:"Products"
});
const productModel = db.mongoose.model("products",productSchema);
module.exports = {productModel};
const database = require("./database");
const productSchema = database.mongoose.Schema({
    category: {
        type: database.mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    title: {type: String, required: true},
    description: {type: String, required: true},
    img_cover: {type: String, required: true},
    price: {type: String, required: true},
    quantity: {type: String, required: true},
    sold: {type: String, required: true},
    list_img: [{type: String, required: true}],
    video: {type: String, required: true},
    date: {type: String, required: true},
    option: [{
        type: {type: String, required: false},
        title: {type: String, required: false},
        content: {type: String, required: false},
        quantity: {type: String, required: true},
        feesArise:{type: String, required: false, default: "0"},
    }],
}, {
    collection: "Product"
});
const productModel = database.mongoose.model("product", productSchema);
module.exports = {productModel};
const database = require("./database");
const cartSchema = database.mongoose.Schema(
    {
        userId: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        product: [
            {
                productId: {
                    type: database.mongoose.Schema.Types.ObjectId,
                    ref: "product",
                    required: true,
                },
                title: {type: String, require: true},
                quantity: {type: Number, required: true},
                imgCover: {type: String, require: true},
                price: {type: String, require: true},
                option: [{
                    type: {type: String, required: false},
                    title: {type: String, required: false},
                    content: {type: String, required: false},
                    quantity: {type: String, required: false},
                    feesArise: {type: String, required: false, default: "0"},
                }],
            },
        ],
        date_time: {type: String, required: true},
    },
    {
        collection: "Cart",
    }
);

const cartModel = database.mongoose.model("cart", cartSchema);
module.exports = {cartModel};

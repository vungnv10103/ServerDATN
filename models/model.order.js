const db = require("./database");
const status = "WaitConfirm";
const orderSchema = db.mongoose.Schema({
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'user', required: false },
    product: [{
        productId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
        option: [{
            type: { type: String, required: false },
            title: { type: String, required: false },
            content: { type: String, required: false },
            quantity: { type: String, required: false },
            feesArise: { type: String, required: false },
        }],
        quantity: { type: Number, required: true }
    }],
    addressId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'address', required: false },
    total: { type: Number, required: true },
    status: { type: String, default: status },
    date_time: { type: String, required: true },
    payment_method: { type: String, required: true },
    guestName: { type: String, required: false },
    guestPhone: { type: String, required: false },
    guestAddress: { type: String, required: false },
}, {
    collection: "Order"
});
orderSchema.methods.getAllProductInfo = async function () {
    const productInfoPromises = this.product.map(async (product) => {
        const productId = product.productId;

        if (productId) {
            // Sử dụng Mongoose populate để lấy dữ liệu từ bảng product
            const productInfo = await db.mongoose.model('product').findById(productId);

            // Trả về thông tin của sản phẩm
            return productInfo;
        } else {
            return null;
        }
    });

    // Chờ tất cả các Promise của productInfoPromises được giải quyết
    const allProductInfo = await Promise.all(productInfoPromises);

    return allProductInfo;
};
orderSchema.methods.getUserInfo = async function () {
    const userId = this.userId;
    if (userId) {
        // Sử dụng Mongoose populate để lấy dữ liệu từ bảng product
        const userInfo = await db.mongoose.model('user').findById(userId);

        // Trả về toàn bộ thông tin của sản phẩm
        return userInfo;
    } else {
        return null;
    }
};
const modelOrder = db.mongoose.model("order", orderSchema);
module.exports = { modelOrder };
const CartModel = require("../models/model.cart");
const ProductModal = require("../models/model.product")
const moment = require("moment-timezone");
exports.addCart = async (req, res) => {
    let userId = req.body.userId;
    let productId = req.body.productId;
    let quantity = req.body.quantity;
    let price = req.body.price;
    let imgCover = req.body.imgCover;
    let title = req.body.title;
    let option = req.body.option;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (userId == null) {
        return res.send({ message: "userId is required", code: 0 });
    }
    if (title == null) {
        return res.send({ message: "title is required", code: 0 });
    }
    if (imgCover == null) {
        return res.send({ message: "imgCover is required", code: 0 });
    }
    if (price == null) {
        return res.send({ message: "price is required", code: 0 });
    }
    try {
        let myCart = await CartModel.cartModel.findOne({ userId: userId });
        let currentProduct = await ProductModal.productModel.findById({ _id: productId });
        let productQuantity = currentProduct.quantity;
        if (myCart) {
            const index = myCart.product.findIndex(
                (id) =>
                    id.productId.toString() === productId && arraysEqual(option, id.option)
            );

            if (index === -1) {

                myCart.product.push({
                    productId: productId,
                    quantity: quantity,
                    option: option,
                    title: title,
                    price: price,
                    imgCover: imgCover,
                });
                await myCart.save();
                return res.send({ message: "add cart success", code: 1 });
            } else {
                // console.log(option.length);
                let valid = true;
                let optionProduct = myCart.product[index].option;
                let limitQuantity = Number(optionProduct[0].quantity);
                optionProduct.map((item) => {
                    if (limitQuantity > Number(item.quantity)) {
                        limitQuantity = Number(item.quantity)
                    }
                })
                // console.log(`limit ${limitQuantity}`);

                for (let index = 0; index < option.length; index++) {
                    const itemOption = option[index];
                    // console.log(Number(itemOption.quantity));
                    if (Number(itemOption.quantity) == 0) {
                        valid = false;
                        break;
                    }
                }
                // console.log(`valid: ${valid}`);
                if (valid) {
                    if (myCart.product[index].quantity != productQuantity) {

                        if (myCart.product[index].quantity == limitQuantity) {
                            return res.send({ message: `Sản phẩm tạm hết hàng`, code: 0 });
                        }
                        myCart.product[index].quantity = myCart.product[index].quantity + Number(quantity);
                        await myCart.save();
                        return res.send({ message: "update quantity success", code: 1 });
                    }
                    else {
                        return res.send({ message: "Số lượng trong giỏ hàng vượt giới hạn bán", code: 0 });
                    }
                }
                else {
                    return res.send({ message: `Sản phẩm tạm hết hàng`, code: 0 });
                }

                // let title = option[0].title
                // let content = option[0].content
                // let quantityOption = option[0].quantity

                // console.log(`item: ${title}- ${content} - ${quantityOption}`);




            }
        } else {

            let objCart = new CartModel.cartModel();
            objCart.userId = userId;
            objCart.product.push({
                productId: productId,
                quantity: quantity,
                option: option,
                title: title,
                price: price,
                imgCover: imgCover,
            });
            objCart.date_time = date_time;
            await objCart.save();
            return res.send({ message: "Create cart and add cart success", code: 1 });
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.getCartByUserId = async (req, res) => {
    let userId = req.body.id;
    console.log(userId);
    if (userId === null) {
        return res.send({ message: "userId is required", code: 0 });
    }
    try {
        let listCart = await CartModel.cartModel.findOne({ userId: userId });

        return res.send({
            listCart: listCart.product,
            message: "get list cart success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.getCartByCartId = async (req, res) => {
    let cartId = req.body.cartId;
    if (cartId === null) {
        return res.send({ message: "cartId is required", code: 0 });
    }
    try {
        let cart = await CartModel.cartModel.findOne(cartId);
        return res.send({ cart: cart, message: "get cart success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.getCart = async (req, res) => {
    try {
        let listCart = await CartModel.cartModel.find().populate("product");
        return res.send({
            listCart: listCart,
            message: "get list cart success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.deleteCart = async (req, res) => {
    let cartId = req.body.cartId;
    let userId = req.body.userId;
    let productId = req.body.productId;
    if (cartId === null) {
        return res.send({ message: "orderId is required", code: 0 });
    }
    try {
        const objCart = await CartModel.cartModel.findOne({ userId: userId });
        // console.log(objCart)
        if (objCart) {
            const index = objCart.product.findIndex(
                (id) => id.productId.toString() === productId.toString()
            );
            if (index == -1) {
                return res.send({ message: "No product found in your cart", code: 0 });
            } else {
                objCart.product.splice(index, 1);
                await objCart.save();
                if (objCart.product.length == 0) {
                    await CartModel.cartModel.findOneAndDelete({
                        userId: userId,
                    });
                    return res.send({
                        message:
                            "delete product in your cart and remove your cart success ",
                        code: 1,
                    });
                }
                return res.send({
                    message: "delete product in your cart success",
                    code: 1,
                });
            }
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.editCart = async (req, res) => {
    let userId = req.body.userId;
    let productId = req.body.productId;
    let caculation = req.body.caculation;
    if (caculation == null) {
        return res.send({ message: "cacaluation is required", code: 0 });
    }
    if (caculation !== "reduce" && caculation !== "increase") {
        return res.send({ message: "cacaluation invalid", code: 0 });
    }
    try {
        let cart = await CartModel.cartModel.findOne({ userId: userId });
        let currentProduct = await ProductModal.productModel.findById({ _id: productId });
        if (cart) {
            const index = cart.product.findIndex(
                (idProduct) => idProduct.productId.toString() === productId
            );
            if (index == -1) {
                return res.send({
                    message: "No product found in your cart ",
                    code: 0,
                });
            } else {
                if (caculation === "reduce") {
                    cart.product[index].quantity =
                        Number(cart.product[index].quantity) - 1;
                    if (cart.product[index].quantity === 0) {
                        cart.product.splice(index, 1);
                        await cart.save();
                        if (cart.product.length == 0) {
                            await CartModel.cartModel.findOneAndDelete({
                                userId: userId,
                            });
                            return res.send({
                                message: "delete your cart",
                                code: 1,
                            });
                        }
                        return res.send({
                            message:
                                "reduct quantity product and remove product in your  cart success",
                            code: 1,
                        });
                    }
                    await cart.save();
                    return res.send({
                        message: "reduct quantity product in your  cart success",
                        code: 1,
                    });
                } else if (caculation === "increase") {
                    if (!currentProduct) {
                        return res.send({ message: "Product not found", code: 0 });
                    }
                    let quantityProduct = currentProduct.quantity;
                    let optionProduct = cart.product[index].option;

                    let limitQuantity = Number(optionProduct[0].quantity);
                    optionProduct.map((item) => {
                        if (limitQuantity > Number(item.quantity)) {
                            limitQuantity = Number(item.quantity)
                        }
                    })

                    if (Number(cart.product[index].quantity < limitQuantity)) {
                        cart.product[index].quantity =
                            Number(cart.product[index].quantity) + 1;
                        await cart.save();
                        return res.send({
                            message: "increase quantity product in your  cart success",
                            code: 1,
                        });
                    }
                    else {
                        return res.send({
                            message: "Số lượng vượt quá giới hạn",
                            code: 0,
                        });
                    }
                }
            }
        } else {
            return res.send({ message: "No found product in you cart ", code: 0 });
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.editCartV2 = async (req, res) => {
    let userId = req.body.userId;
    let product = req.body.productId;
    let quantity = req.body.quantity;
    try {
        let cart = await CartModel.cartModel.findOne({ userId: userId });
        let message = ""
        let code = 0;
        if (quantity !== null) {
            let productList = cart.product;
            productList.map(item => {
                if (item.productId.toString() === product.toString()) {
                    let optionProduct = item.option;
                    let limitQuantity = Number(optionProduct[0].quantity);
                    optionProduct.map((item) => {
                        if (limitQuantity > Number(item.quantity)) {
                            limitQuantity = Number(item.quantity)
                        }
                    })
                    console.log("lmt" +  limitQuantity);
                    if (quantity > limitQuantity) {
                        item.quantity = limitQuantity
                        message = "Số lượng vượt quá giới hạn";
                        code = 0;

                    }
                    else {
                        item.quantity = quantity
                        message = "edit cart success"
                        code = 1;
                    }

                }
            });
            cart.product = productList;
            console.log(cart.product);
            await cart.save();
        }
        return res.send({ message: message, code: code });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}

const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        const obj1 = arr1[i];
        const obj2 = arr2[i];

        if (obj1.type !== obj2.type || obj1.title !== obj2.title || obj1.content !== obj2.content) {
            return false;
        }
    }

    return true;
}

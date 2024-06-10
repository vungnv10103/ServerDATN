const ProductCart = require("../modelsv2/model.ProductCart");
const moment = require("moment-timezone");
const Product = require("../modelsv2/model.product");
const CartModel = require("../models/model.cart");
const CartModelv2 = require("../modelsv2/model.ProductCart");
exports.addCard = async (req, res) => {
  const { customer_id, product_id, quantity } = req.body;
  let date = new Date();
  let specificTimeZone = 'Asia/Ha_Noi';
  let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
  if (customer_id === null) {
    return res.send({ message: "customer_id is required", code: 0 });
  }
  if (product_id === null) {
    return res.send({ message: "product_id is required", code: 0 });
  }
  if (quantity === null) {
    return res.send({ message: "quantity is required", code: 0 });
  }
  try {
    const myCart = await ProductCart.productCartModel.findOne({
      customer_id,
      product_id,
    });
    if (myCart) {
      const productWhereId = await Product.productModel.findById({
        _id: req.body.product_id,
      });
      if (
        Number(myCart.quantity) + Number(quantity) >
        productWhereId.quantity
      ) {
        return res.send({ message: "Số lượng hàng hiện không đủ", code: 1 });
      } else {
        myCart.quantity = Number(myCart.quantity) + Number(quantity);
        await myCart.save();
        return res.send({ message: "Cập nhập số lượng thành công", code: 1 });
      }
    } else {
      const productWhereId = await Product.productModel.findById({
        _id: req.body.product_id,
      });
      if (Number(quantity) > Number(productWhereId.quantity)) {
        return res.send({ message: "Số lượng hàng hiện không đủ", code: 1 });
      } else {
        const ProC = new ProductCart.productCartModel();
        ProC.customer_id = customer_id;
        ProC.product_id = product_id;
        ProC.quantity = quantity;
        ProC.date_time = date_time;
        await ProC.save();
        return res.send({ message: "Thêm vào giỏ hàng thành công", code: 1 });
      }
    }
  } catch (error) {
    console.log("Error: " + error.message);
    return res.send({ message: error.message.toString(), code: 0 });
  }
};
exports.getCartByIdCustomer = async (req, res) => {
  const { customer_id } = req.body;
  if (customer_id === null) {
    return res.send({ message: "customer_id is required", code: 0 });
  }
  try {
    const CartCustomer = await ProductCart.productCartModel
      .find({
        customer_id,
      })
      .populate("product_id");
    if (CartCustomer) {
      return res.send({
        message: "Lấy giỏ hàng thành công",
        productCart: CartCustomer,
        code: 1,
      });
    } else {
      return res.send({ message: "Người dùng chưa có giỏ hàng", code: 0 });
    }
  } catch (error) {
    console.log("Error: " + error.message);
    return res.send({ message: error.message.toString(), code: 0 });
  }
};

exports.updateCart = async (req, res) => {
  const { customer_id, product_id, calculation } = req.body;
  if (customer_id === null) {
    return res.send({ message: "customer_id is required", code: 0 });
  }
  if (product_id === null) {
    return res.send({ message: "product_id is required", code: 0 });
  }
  if (calculation === null) {
    return res.send({ message: "calculation is required", code: 0 });
  }
  if (calculation !== "reduce" && calculation !== "increase") {
    return res.send({ message: "cacaluation invalid", code: 0 });
  }
  try {
    const myCart = await ProductCart.productCartModel.findOne({
      customer_id,
      product_id,
    });
    if (myCart) {
      if (calculation === "reduce") {
        myCart.quantity = Number(myCart.quantity) - 1;
        if (Number(myCart.quantity) == 0) {
          await ProductCart.productCartModel.findOneAndDelete({
            customer_id,
            product_id,
          });
          return res.send({
            message: "Xóa khỏi giỏ hàng thành công",
            code: 1,
          });
        }
        await myCart.save();
        return res.send({
          message: "Giảm số lượng thành công",
          code: 1,
        });
      } else if (calculation === "increase") {
        const productWhereId = await Product.productModel.findById({
          _id: req.body.product_id,
        });

        if (myCart.quantity === productWhereId.quantity) {
          return res.send({
            message: "Số lượng sản phẩm hiện tại không đủ",
            code: 1,
          });
        } else {
          myCart.quantity = Number(myCart.quantity) + 1;
          await myCart.save();
          return res.send({
            message: "Tăng số lượng thành công",
            code: 1,
          });
        }
      }
    } else {
      return res.send({
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
        code: 0,
      });
    }
  } catch (error) {
    console.log("Error: " + error.message);
    return res.send({ message: error.message.toString(), code: 0 });
  }
};
exports.editCartV2 = async (req, res) => {
  let userId = req.body.userId;
  let product = req.body.productId;
  let quantity = req.body.quantity;
  try {
    let cart = await CartModelv2.productCartModel.findOne({ userId: userId });
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

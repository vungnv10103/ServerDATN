const OrderModel = require("../models/model.order");
const ProductModel = require("../models/model.product");
const Cart = require("../models/model.cart");
let Voucher = require("../models/model.voucher");
const moment = require("moment-timezone");
exports.creatOrder = async (req, res) => {
    let userId = req.body.userId;
    let product = req.body.product;
    let address = req.body.address;
    let paymentMethod = "Tiền mặt";
    let voucherId = req.body.voucherId;
    let check = 1;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (userId == null) {
        return res.send({ message: "userId is required", code: 0 });
    }
    if (product === undefined) {
        return res.send({ message: "product is required", code: 0 });
    }
    if (address == null) {
        return res.send({ message: "address is required", code: 0 });
    }
    try {
        let total = 0;

        await Promise.all(product.map(async (item) => {
            let product = await ProductModel.productModel.findById(item.productId);
            if (!product) {
                return res.send({ message: "product not found", code: 0 });
            }
            let sold = Number(product.sold);
            let newShold = sold + item.quantity;
            product.sold = newShold.toString();
            item.option.map((item2, index) => {
                product.option.map((item3, index2) => {
                    if (item3.title == item2.title) {
                        // console.log(`item: ${item.quantity} - item2: ${item2.quantity} - item3: ${item3.quantity}`);
                        if (item.quantity <= item3.quantity) {
                            // console.log(`item${index}: ${item.option[index].quantity}`);
                            product.option[index2].quantity -= item.quantity;
                        } else {
                            check = 0;
                        }
                    }
                })
            })

            await product.save();
            let feesArise = 0;
            item.option.map(item2 => {
                if (item2.feesArise) {
                    feesArise += Number(item2.feesArise);
                }
            })
            total += ((Number(product.price) + Number(feesArise))) * Number(item.quantity);
        }));
        if (check === 0) {
            return res.send({ message: "product is out of stock ", code: 0 });
        }
        let voucherPrice = 0;
        if (voucherId != null) {
            let voucher = await Voucher.voucherModel.findById(voucherId);
            if (voucher) {
                voucherPrice = Number(voucher.price);
                total = total - voucherPrice;
                voucher.status = "used";
                await voucher.save();
            } else {
                return res.send({ message: "voucher not found", code: 0 });
            }
        }
        let order = new OrderModel.modelOrder({
            userId: userId,
            product: product,
            payment_method: paymentMethod,
            addressId: address,
            total: total,
            date_time: date_time,
        })
        let cart = await Cart.cartModel.findOne({ userId: userId });
        if (!cart) {
            await order.save();
            return res.send({ message: "create order success", code: 1 });
        }
        let currentProduct = cart.product;
        // console.log(product)
        // console.log(total)
        cart.product = currentProduct.filter(item1 => !product.some(item2 => item2.productId.toString() === item1.productId.toString() && arraysEqual(item2.option, item1.option)));
        await cart.save();
        await order.save();
        return res.send({ message: "create order success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "create order fail", code: 0 });
    }
}
exports.creatOrderGuest = async (req, res) => {
    let guestName = req.body.guestName;
    let guestPhone = req.body.guestPhone;
    let guestAddress = req.body.guestAddress;
    let product = req.body.product;
    let userId = req.body.userId;
    let status = req.body.status;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (guestPhone == null) {
        return res.send({ message: "guestPhone is required", code: 0 });
    }
    if (guestName == null) {
        return res.send({ message: "guestName is required", code: 0 });
    }
    if (guestAddress == null) {
        return res.send({ message: "guestAddress is required", code: 0 });
    }
    if (status == null) {
        return res.send({ message: "status is required", code: 0 });
    }
    if (product === undefined) {
        return res.send({ message: "product is required", code: 0 });
    }

    let check = 1;
    try {
        let total = 0;
        let listProduct = JSON.parse(product)
        await Promise.all(listProduct.map(async item => {
            let product = await ProductModel.productModel.findById(item.productId);
            if (!product) {
                return res.send({ message: "product not found", code: 0 });
            }
            let sold = Number(product.sold);

            newShold = sold + 1;
            product.sold = newShold.toString();

            item.option.map((item2, index) => {
                product.option.map((item3, index2) => {
                    if (item3.title == item2.title) {
                        // console.log(`item: ${item.quantity} - item2: ${item2.quantity} - item3: ${item3.quantity}`);
                        if (item.quantity <= item3.quantity) {
                            // console.log(`item${index}: ${item.option[index].quantity}`);
                            product.option[index2].quantity -= item.quantity;
                        } else {
                            check = 0;
                        }
                    }
                })
            })

            await product.save();
            let feesArise = 0;
            item.option.map(item => {
                if (item.feesArise) {
                    feesArise += Number(item.feesArise);
                }
            })
            total += ((Number(product.price) + Number(feesArise))) * Number(item.quantity);
        }));
        if (check === 0) {
            return res.send({ message: "product is out of stock ", code: 0 });
        }
        let order = new OrderModel.modelOrder({
            guestName: guestName,
            product: listProduct,
            guestPhone: guestPhone,
            guestAddress: guestAddress,
            total: total,
            userId: userId,
            date_time: date_time,
            payment_method: "Thanh toán trực tiếp",
            status: status
        })
        console.log("UserId",userId)
        let cart = await Cart.cartModel.findOne({ userId: userId });
        if (!cart) {
            await order.save();
            return res.send({ message: "create order success", code: 1 });
        }
        let currentProduct = cart.product;
        console.log({ currentProduct: currentProduct[0].option })
        cart.product = currentProduct.filter(item1 => !listProduct.some(item2 => item2.productId.toString() === item1.productId.toString()));
        await cart.save();
        await order.save();
        return res.send({ message: "create order success", code: 1 });
    } catch (e) {
        console.log(`guest: ${e.message}`);
        return res.send({ message: "create order fail", code: 0 });
    }
}
exports.getOrderByUserId = async (req, res) => {
    let userId = req.body.userId;
    if (userId === null) {
        return res.send({ message: "userId is required", code: 0 });
    }
    try {
        let listOrder = await OrderModel.modelOrder.find({ userId: userId }).populate("product").populate("addressId");
        if (!listOrder) {
            return res.send({ message: "listOrder not found", code: 0 });
        }
        return res.send({ listOrder: listOrder, message: "get list order success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "get list order fail", code: 0 });
    }
}
exports.getOrderByOrderId = async (req, res) => {
    let orderId = req.body.orderId;
    if (orderId === null) {
        return res.send({ message: "orderId is required", code: 0 });
    }
    try {
        let order = await OrderModel.modelOrder.findById(orderId).populate("product.productId").populate("addressId");
        if (!order) {
            return res.send({ message: "order not found", code: 0 });
        }
        return res.send({ order: order, message: "get order success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "get order fail", code: 0 });
    }
}
exports.getOrder = async (req, res) => {
    try {
        let listOrder = await OrderModel.modelOrder.find().populate("product").populate("addressId");
        listOrder.reverse()
        return res.send({ listOrder: listOrder, message: "get list order success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "get list order fail", code: 0 });
    }
}
exports.deleteOrder = async (req, res) => {
    let orderId = req.body.orderId;
    if (orderId === null) {
        return res.send({ message: "orderId is required", code: 0 });
    }
    try {
        let order = OrderModel.modelOrder.findById(orderId);
        if (!order) {
            return res.send({ message: "order not found", code: 0 });
        }
        await OrderModel.modelOrder.deleteOne({ _id: orderId });
        return res.send({ message: "delete order success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "get list order fail", code: 0 });
    }
}
exports.editOrder = async (req, res) => {
    let orderId = req.body.orderId;
    let userId = req.body.userId;
    let product = req.body.product;
    let addressId = req.body.addressId;
    let status = req.body.status;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    try {
        let order = await OrderModel.modelOrder.findById(orderId);
        if (!order) {
            return res.send({ message: "order not found", code: 0 });
        }
        if (status !== null) {
            order.status = status;
            order.date_time = date_time;
        }
        if (userId !== null) {
            order.userId = userId;
            order.date_time = date_time;
        }
        if (product !== undefined) {
            let total = 0;
            await Promise.all(product.map(async item => {
                let product = await ProductModel.productModel.findById(item.productId);
                if (!product) {
                    return res.send({ message: "product not found", code: 0 });
                }
                total += product.price * item.quantity;
            }));
            order.product = product;
            order.total = total;
            order.date_time = date_time;
        }
        if (addressId !== null) {
            order.date_time = date_time;
            order.addressId = addressId;
        }
        if (status !== null) {
            order.status = status;
            order.date_time = date_time;
        }

        console.log(order);
        await order.save();
        return res.send({ message: "edit order success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "edit order fail", code: 0 });
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
exports.getPriceZaloPay = async (req, res) => {
    let userId = req.body.userId;
    let product = req.body.product;
    let address = req.body.address;
    let voucherId = req.body.voucherId;
    let check = 1;
    if (userId == null) {
        return res.send({ message: "userId is required", code: 0 });
    }
    if (product === undefined) {
        return res.send({ message: "product is required", code: 0 });
    }
    if (address == null) {
        return res.send({ message: "address is required", code: 0 });
    }
    try {
        let total = 0;
        await Promise.all(product.map(async item => {
            let product = await ProductModel.productModel.findById(item.productId);
            if (!product) {
                return res.send({ message: "product not found", code: 0 });
            }
            item.option.map((item2, index) => {
                product.option.map((item3, index2) => {
                    if (item3.title == item2.title) {
                        console.log(`item: ${item.quantity} - item2: ${item2.quantity} - item3: ${item3.quantity}`);
                        if (item.quantity <= item3.quantity) {
                            check = 1;
                        } else {
                            check = 0;
                        }
                    }
                })
            })
            let feesArise = 0;
            item.option.map(item2 => {
                if (item2.feesArise) {
                    feesArise += Number(item2.feesArise);
                }
            })
            total += ((Number(product.price) + Number(feesArise))) * Number(item.quantity);
        }));
        if (check === 0) {
            return res.send({ message: "product is out of stock ", code: 0 });
        }
        let voucherPrice = 0;
        if (voucherId != null) {
            let voucher = await Voucher.voucherModel.findById(voucherId);
            if (voucher) {
                voucherPrice = Number(voucher.price);
                total = total - voucherPrice;
            } else {
                return res.send({ message: "voucher not found", code: 0 });
            }
        }
        return res.send({ message: "get price order success", price: total, code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "create order fail", code: 0 });
    }
}
exports.creatOrderZaloPay = async (req, res) => {
    let userId = req.body.userId;
    let product = req.body.product;
    let address = req.body.address;
    let paymentMethod = "Zalo Pay";
    let voucherId = req.body.voucherId;
    let check = 1;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (userId == null) {
        return res.send({ message: "userId is required", code: 0 });
    }
    if (product === undefined) {
        return res.send({ message: "product is required", code: 0 });
    }
    if (address == null) {
        return res.send({ message: "address is required", code: 0 });
    }
    try {
        let total = 0;
        await Promise.all(product.map(async item => {
            let product = await ProductModel.productModel.findById(item.productId);
            if (!product) {
                return res.send({ message: "product not found", code: 0 });
            }
            let sold = Number(product.sold);
            let newShold = sold + item.quantity;
            product.sold = newShold.toString();
            item.option.map((item2, index) => {
                product.option.map((item3, index2) => {
                    if (item3.title == item2.title) {
                        console.log(`item: ${item.quantity} - item2: ${item2.quantity} - item3: ${item3.quantity}`);
                        if (item.quantity <= item3.quantity) {
                            console.log(`item${index}: ${item.option[index].quantity}`);
                            product.option[index2].quantity -= item.quantity;
                        } else {
                            check = 0;
                        }
                    }
                })
            })
            await product.save();

            let feesArise = 0;
            item.option.map(item2 => {
                if (item2.feesArise) {
                    feesArise += Number(item2.feesArise);
                }
            })
            total += ((Number(product.price) + Number(feesArise))) * Number(item.quantity);
        }));
        if (check === 0) {
            return res.send({ message: "product is out of stock ", code: 0 });
        }
        let voucherPrice = 0;
        if (voucherId != null) {
            let voucher = await Voucher.voucherModel.findById(voucherId);
            if (voucher) {
                voucherPrice = Number(voucher.price);
                total = total - voucherPrice;
                voucher.status = "used";
                await voucher.save();
            } else {
                return res.send({ message: "voucher not found", code: 0 });
            }
        }
        let order = new OrderModel.modelOrder({
            userId: userId,
            product: product,
            addressId: address,
            payment_method: paymentMethod,
            total: 0,
            date_time: date_time,
        })
        let cart = await Cart.cartModel.findOne({ userId: userId });
        if (!cart) {
            await order.save();
            return res.send({ message: "create order success", code: 1 });
        }
        let currentProduct = cart.product;
        console.log(currentProduct);
        cart.product = currentProduct.filter(item1 => !product.some(item2 => item2.productId.toString() === item1.productId.toString() && arraysEqual(item2.option, item1.option)));
        await cart.save();
        await order.save();
        return res.send({ message: "create order success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.getOrderTop10 = async (req, res) => {
    try {
        let order = await OrderModel.modelOrder.find({ status: "PayComplete" });
        let arrIdProduct = [];
        let data = []
        order.map(item => {
            item.product.map(data => {
                arrIdProduct.push(data.productId);
            });
        })
        let top10Product = getTop10Frequencies(arrIdProduct);
        await Promise.all(top10Product.map(async item => {
            let product = await ProductModel.productModel.findById(item.productId);
            data.push({
                productId: item.productId,
                img: product.img_cover,
                count: item.count
            })
        }));
        return res.send({
            message: "get top 10 success",
            code: 1,
            name: "top10Product",
            data: data
        })
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.getOrderFromDateToDate = async (req, res) => {
    let fromDate = req.body.fromDate;
    let toDate = req.body.toDate;
    if (fromDate === null) {
        return res.send({ message: "from date is required", code: 1 });
    }
    if (toDate === null) {
        return res.send({ message: "to date is required", code: 1 });
    }
    try {
        let dataOrder = [];
        let dataGetFromDateToDate = [];
        let data = [];
        let order = await OrderModel.modelOrder.find({ status: "PayComplete" });
        order.map(item => {
            const formattedDate = moment(item.date_time, "YYYY-MM-DD-HH:mm:ss").format("YYYY-MM-DD");
            dataOrder.push({ date: formattedDate, total: item.total })
        })
        dataGetFromDateToDate = calculateTotalByDate(dataOrder, fromDate, toDate);
        dataGetFromDateToDate.map(item => {
            data.push(item.total)
        })
        return res.send({
            message: "get order from date to date success",
            code: 1,
            name: "OrderFromDateToDate",
            data: data
        })
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}

function getTop10Frequencies(array) {
    const frequencies = {};
    array.forEach(item => {
        frequencies[item] = (frequencies[item] || 0) + 1;
    });
    const frequencyArray = Object.entries(frequencies);
    frequencyArray.sort((a, b) => b[1] - a[1]);
    const top10 = frequencyArray.slice(0, 10).map(entry => ({
        productId: entry[0],
        count: entry[1],
    }));
    return top10;
}

function calculateTotalByDate(data, fromDate, toDate) {
    const totalsByDate = {};
    const dateRange = generateDateRange(fromDate, toDate);
    dateRange.forEach(date => {
        totalsByDate[date] = 0;
    });
    data.forEach(item => {
        const date = item.date;
        const total = item.total;

        if (!totalsByDate[date]) {
            totalsByDate[date] = 0;
        }
        totalsByDate[date] += total;
    });
    return Object.keys(totalsByDate).map(date => ({
        date,
        total: totalsByDate[date],
    }));
}

function generateDateRange(fromDate, toDate) {
    const dateRange = [];
    const currentDate = new Date(fromDate);
    while (currentDate <= new Date(toDate)) {
        dateRange.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateRange;
}

const jwt = require("jsonwebtoken");
require("dotenv").config();
const moment = require("moment-timezone");
const mongoose = require('mongoose');
const CustomerModel = require("../modelsv2/model.customer");
const EmployeeModel = require("../modelsv2/model.employee");
const VoucherModel = require("../modelsv2/model.voucher");
const MapVoucherModel = require("../modelsv2/model.map_voucher_cust")
const ProductImg = require("../modelsv2/model.imgproduct");
const OrderModel = require("../modelsv2/model.order");
const DetailOrder = require("../modelsv2/model.detailorder");
const ProductModel = require("../modelsv2/model.product");
const ProductCartModel = require("../modelsv2/model.ProductCart");
const admin = require('firebase-admin');
const serviceAccount = require('../serviceaccountkey/datn-789e4-firebase-adminsdk-nbmof-aa2593c4f9.json');
const NotificationModel = require("../modelsv2/model.notification");
const MapNotiCus = require("../modelsv2/model.map_notifi_cust");
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

exports.createOrder = async (req, res) => {
    await createOrderPaymentMethod(req, res, "Thanh toán khi nhận hàng");
}
exports.createOrderZaloPay = async (req, res) => {
    await createOrderPaymentMethod(req, res, "Thanh toán bằng ZaloPay");
}
exports.createOrderGuest = async (req, res) => {
    let list_order = req.body.list_order;
    let arrIdCart = req.body.arrIdCart;
    let employee_id = req.body.employee_id;
    let guest_name = req.body.guest_name;
    let guest_phoneNumber = req.body.guest_phoneNumber;
    let guest_address = req.body.guest_address;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (list_order == null || list_order.length === 0) {
        return res.send({message: "list order is required", code: 0});
    }
    try {
        let errorOccurred = false;
        let total_amount = 0;
        let listproduct = JSON.parse(list_order);
        await Promise.all(listproduct.map(async item => {
            let product = await ProductModel.productModel.findById(item.product_id);
            if (Number(product.quantity) < Number(item.quantity)) {
                errorOccurred = true;
            }
        }));
        if (errorOccurred) {
            return res.send({message: "Product quantity is out of stock", code: 0});
        }
        let order = new OrderModel.oderModel({
            employee_id: employee_id,
            create_time: create_time,
            guest_name: guest_name,
            guest_phoneNumber: guest_phoneNumber,
            guest_address: guest_address,
            status: 'PayComplete',
        });
        let listProduct = JSON.parse(list_order);
        await Promise.all(listProduct.map(async item => {
            let detailOrder = new DetailOrder.detailOrderModel({
                order_id: order._id,
                product_id: item.product_id,
                quantity: item.quantity,
            });
            let product = await ProductModel.productModel.findById(item.product_id);
            total_amount = total_amount + (Number(product.price) * Number(item.quantity));
            product.quantity = (Number(product.quantity) - Number(item.quantity)).toString();
            await product.save();
            await detailOrder.save();
        }));

        await Promise.all(arrIdCart.map(async item => {
            const itemId = new mongoose.Types.ObjectId(item);
            await ProductCartModel.productCartModel.findByIdAndDelete(itemId);
        }))
        order.total_amount = total_amount;
        await order.save();
        return res.send({message: "Create order success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.getOrderByStatus = async (req, res) => {
    let status = req.body.status;
    if (status == null) {
        return res.send({message: "status is required", code: 0})
    }
    try {
        let listDetailOrder = [];
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findById(data.cus._id);
        let order = await OrderModel.oderModel.find({
            customer_id: cus._id,
            status: status
        })
            .populate("map_voucher_cus_id")
            .populate("customer_id")
            .populate("employee_id")
            .populate("delivery_address_id")
        await Promise.all(order.map(async item => {
            let listProduct = [];
            let detailOrder = await DetailOrder.detailOrderModel.find({
                order_id: item._id,
            })
                .populate("order_id")
                .populate("product_id")
            await Promise.all(detailOrder.map(async item => {
                let product = await ProductModel.productModel.findById(item.product_id);
                product.quantity = item.quantity;
                listProduct.push(product);
            }))
            listDetailOrder.push({order: item, listProduct: listProduct});
        }))
        listDetailOrder.sort((b, a) => moment(a.order.create_time, "YYYY-MM-DD-HH:mm:ss") - moment(b.order.create_time, "YYYY-MM-DD-HH:mm:ss"));
        return res.send({message: "get order success", listDetailOrder: listDetailOrder, code: 1})
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.cancelOrder = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    let orderId = req.body.orderId;
    if (orderId == null) {
        return res.send({message: "order id is required", code: 0})
    }
    try {
        let order = await OrderModel.oderModel.findById(orderId);
        if (order.status !== "WaitConfirm") {
            return res.send({message: "Orders that have been sent cannot be canceled", code: 0})
        }
        if (order.map_voucher_cus_id !== null) {
            let mapVoucher = await MapVoucherModel.mapVoucherModel.findById(order.map_voucher_cus_id);
            mapVoucher.is_used = false;
            await mapVoucher.save();
        }
        let detailOrder = await DetailOrder.detailOrderModel.find({order_id: orderId});
        await Promise.all(detailOrder.map(async item => {
            let product = await ProductModel.productModel.findById(item.product_id);
            product.quantity = Number(product.quantity) + Number(item.quantity);
            product.sold = Number(product.sold) - Number(item.quantity);
            await product.save();
        }));
        order.status = "Cancel";
        await order.save();
        let product = await ProductModel.productModel.findById(detailOrder[0].product_id);
        let cus = await CustomerModel.customerModel.findById(order.customer_id);
        await createNotifi("Huỷ đơn hàng", `Bạn đã huỷ một đơn hàng vào lúc ${create_time} với mã đơn hàng ${order._id}`, product.img_cover, create_time, order.customer_id, cus.fcm);
        return res.send({message: "cancel order success", code: 1})

    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.getStatic = async (req, res) => {
    const {startDate, endDate} = req.body;

    if (!startDate) {
        return res.send({message: "start date is required", code: 1});
    }
    if (!endDate) {
        return res.send({message: "end date is required", code: 1});
    }
    try {
        let dataOrder = [];
        let dataGetFromDateToDate = [];
        let data = [];
        let date = [];
        let order = await OrderModel.oderModel.find({status: "PayComplete"});
        order.map(item => {
            const formattedDate = moment(item.create_time, "YYYY-MM-DD-HH:mm:ss").format("YYYY-MM-DD");
            dataOrder.push({date: formattedDate, total: item.total_amount})
        })
        dataGetFromDateToDate = calculateTotal(dataOrder, startDate, endDate);
        dataGetFromDateToDate.map(item => {
            data.push(item.total)
            date.push(item.date)
        })
        return res.send({
            message: "get order from date to date success",
            code: 1,
            name: "OrderFromDateToDate",
            data: data,
            date: date
        })
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
};

exports.getYearStatic = async (req, res) => {
    let year_input = req.body.year_input;

    if (year_input === null) {
        return res.send({message: "year is required", code: 0});
    }
    try {
        let dataOrder = [];
        let dataGetFromYear = [];
        let data = [];
        let date = [];
        let order = await OrderModel.oderModel.find({status: "PayComplete"});
        order.map(item => {
            const formattedDate = moment(item.create_time, "YYYY-MM-DD-HH:mm:ss").format("MM-YYYY");
            dataOrder.push({date: formattedDate, total: item.total_amount})
        })
        dataGetFromYear = calculateTotalOneMonth(dataOrder, year_input);
        dataGetFromYear.map(item => {
            data.push(item.total)
            date.push(item.month)
        })
        return res.send({
            message: "get order from date to date success",
            code: 1,
            name: "OrderFromDateToDate",
            data: data,
            date: date
        })
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
};

exports.updateStatusOrder = async (req, res) => {
    let orderId = req.body.orderId;
    let employeeId = req.body.employeeId;
    let status = req.body.status;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (orderId == null) {
        return res.send({message: "order id is required", code: 0})
    }
    try {
        let order = await OrderModel.oderModel.findById(orderId);

        order.employee_id = employeeId;
        order.status = status;
        await order.save();
        let detailOrder = await DetailOrder.detailOrderModel.find({order_id: orderId});
        let product = await ProductModel.productModel.findById(detailOrder[0].product_id);
        let cus = await CustomerModel.customerModel.findById(order.customer_id);
        switch (status) {
            case "PayComplete":
                await createNotifi("Thanh toán đơn hàng", `Bạn đã nhận một đơn hàng vào lúc ${create_time} với mã đơn hàng ${order._id}`, product.img_cover, create_time, order.customer_id, cus.fcm);
                break;
            case "Cancel":
                await createNotifi("Huỷ đơn hàng", `Bạn đã huỷ một đơn hàng vào lúc ${create_time} với mã đơn hàng ${order._id}`, product.img_cover, create_time, order.customer_id, cus.fcm);
                break;
            case "WaitConfirm":
                await createNotifi("Đặt đơn hàng", `Bạn đã đặt một đơn hàng vào lúc ${create_time} với mã đơn hàng ${order._id}`, product.img_cover, create_time, order.customer_id, cus.fcm);
                break;
            case "WaitingGet":
                await createNotifi("Đơn hàng đang được chuẩn bị", `Đơn hàng của bạn đang được nhân viên chuẩn bị vào lúc ${create_time} với mã đơn hàng ${order._id}`, product.img_cover, create_time, order.customer_id, cus.fcm);
                break;
            case "InTransit":
                await createNotifi("Đơn hàng đang được vận chuyển", `Đơn hàng đang được đơn vị vận chuyển giao đến bạn vào lúc ${create_time} với mã đơn hàng ${order._id}`, product.img_cover, create_time, order.customer_id, cus.fcm);
                break;
        }
        return res.send({message: "edit order success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

function calculateTotal(data, fromDate, toDate) {
    const totals = {};
    const dateRange = generateDateRange(fromDate, toDate);
    dateRange.forEach(date => {
        totals[date] = 0;
    });

    data.forEach(item => {
        const date = item.date;
        const total = Number(item.total);

        if (totals[date] !== undefined) {
            totals[date] += total;
        }
    });

    return Object.keys(totals).map(date => ({
        date,
        total: totals[date],
    }));
}

function calculateTotalOneMonth(data, year_input) {
    const month_totals = {};
    const dateRange = generateMonthRange(year_input);
    dateRange.forEach(month => {
        month_totals[month] = { month, total: 0 };
    });
    data.forEach(item => {
        const date = item.date;
        const total = Number(item.total);

        if (month_totals[date]) {
            month_totals[date].total += total;
        } else if (dateRange.includes(date)) { // Kiểm tra nếu date nằm trong dateRange
            month_totals[date] = { month: date, total };
        }
    });

    return Object.values(month_totals);
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

function generateMonthRange(year_input) {
    const dateRange = [];
    const currentDate = new Date(year_input, 0); // Năm và tháng bắt đầu từ 0

    for (let i = 0; i < 12; i++) {
        const month = currentDate.getMonth() + 1;  // Lấy tháng từ 0-11, cần +1 để có giá trị từ 1-12
        const formattedDate = `${month.toString().padStart(2, '0')}-${year_input.toString()}`;
        dateRange.push(formattedDate);

        // Tăng tháng đi 1 để tiếp tục vòng lặp với tháng tiếp theo
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return dateRange;
}

exports.getPriceOrderZaloPay = async (req, res) => {
    let list_order = req.body.list_order;
    let map_voucher_cus_id = req.body.map_voucher_cus_id;
    let delivery_address_id = req.body.delivery_address_id;
    if (delivery_address_id == null) {
        return res.send({message: "Delivery address id is required", code: 0});
    }
    if (list_order == null || list_order.length === 0) {
        return res.send({message: "list order is required", code: 0});
    }
    try {
        let voucherPrice = 0;
        let errorOccurred = false;
        let total_amount = 0;
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        await Promise.all(list_order.map(async item => {
            let product = await ProductModel.productModel.findById(item.product_id);
            if (Number(product.quantity) < Number(item.quantity)) {
                errorOccurred = true;
            }
        }));
        if (errorOccurred) {
            return res.send({message: "Product quantity is out of stock", code: 0});
        }
        await Promise.all(list_order.map(async item => {
            let product = await ProductModel.productModel.findById(item.product_id);
            total_amount = total_amount + (Number(product.price) * Number(item.quantity));
        }));
        if (map_voucher_cus_id !== null) {
            let mapVoucher = await MapVoucherModel.mapVoucherModel.findOne({
                _id: map_voucher_cus_id,
                customer_id: data.cus._id,
                is_used: false
            });
            if (mapVoucher) {
                let voucher = await VoucherModel.voucherModel.findById(mapVoucher.vocher_id);
                if (voucher) {
                    voucherPrice = Number(voucher.price);
                }
            }
        }
        total_amount = total_amount - voucherPrice;
        return res.send({message: "get price order success", total_amount: total_amount, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
const createOrderPaymentMethod = async (req, res, paymentMethod) => {
    let list_order = req.body.list_order;
    let map_voucher_cus_id = req.body.map_voucher_cus_id;
    let employee_id = req.body.employee_id;
    let delivery_address_id = req.body.delivery_address_id;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (delivery_address_id == null) {
        return res.send({message: "Delivery address id is required", code: 0});
    }
    if (list_order == null || list_order.length === 0) {
        return res.send({message: "list order is required", code: 0});
    }
    try {
        let voucherPrice = 0;
        let errorOccurred = false;
        let total_amount = 0;
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findById(data.cus._id);
        await Promise.all(list_order.map(async item => {
            let product = await ProductModel.productModel.findById(item.product_id);
            if (Number(product.quantity) < Number(item.quantity)) {
                errorOccurred = true;
            }
        }));
        if (errorOccurred) {
            return res.send({message: "Product quantity is out of stock", code: 0});
        }
        let order = new OrderModel.oderModel({
            customer_id: cus._id,
            employee_id: employee_id,
            delivery_address_id: delivery_address_id,
            create_time: create_time,
            payment_methods: paymentMethod,
        });
        await Promise.all(list_order.map(async item => {
            let detailOrder = new DetailOrder.detailOrderModel({
                order_id: order._id,
                product_id: item.product_id,
                quantity: item.quantity,
            });
            let product = await ProductModel.productModel.findById(item.product_id);
            total_amount = total_amount + (Number(product.price) * Number(item.quantity));
            product.quantity = (Number(product.quantity) - Number(item.quantity)).toString();
            product.sold = (Number(product.sold) + Number(item.quantity)).toString();
            await product.save();
            await detailOrder.save();
        }));
        if (map_voucher_cus_id !== null) {
            let mapVoucher = await MapVoucherModel.mapVoucherModel.findOne({
                _id: map_voucher_cus_id,
                customer_id: data.cus._id,
                is_used: false
            });
            if (mapVoucher) {
                let voucher = await VoucherModel.voucherModel.findById(mapVoucher.vocher_id);
                if (voucher) {
                    voucherPrice = Number(voucher.price);
                    mapVoucher.is_used = true;
                    order.map_voucher_cus_id = map_voucher_cus_id;
                    await order.save();
                    await mapVoucher.save();
                }
            }
        }
        order.total_amount = total_amount - voucherPrice;
        await order.save();
        await Promise.all(list_order.map(async item => {
            if (item.productCartId != null) {
                let productCart = await ProductCartModel.productCartModel.findById(item.productCartId);
                if (productCart) {
                    await ProductCartModel.productCartModel.deleteOne({_id: item.productCartId});
                }
            }
        }))
        let product = await ProductModel.productModel.findById(list_order[0].product_id);
        await createNotifi("Đặt đơn hàng", `Bạn đã đặt một đơn hàng vào lúc ${create_time} phương thức thanh toán ${paymentMethod} với mã đơn hàng ${order._id}`, product.img_cover, create_time, order.customer_id, cus.fcm);
        return res.send({message: "Create order success", code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
const sendMessage = (registrationToken, title, body) => {
    let message = {
        data: {
            title: title,
            body: body,
        },
        token: registrationToken,
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
}
const createNotifi = async (title, content, img, create_time, customer_id, registrationToken) => {
    let notification = new NotificationModel.notificationModel({
        title: title,
        content: content,
        img: img,
        create_time: create_time,
    });
    let mapNotiCus = new MapNotiCus.mapNotificationModel({
        notification_id: notification._id,
        customer_id: customer_id,
        create_time: create_time,
    });
    await notification.save();
    await mapNotiCus.save();
    sendMessage(registrationToken, title, content);
}
exports.getOrderByOrderId = async (req, res) => {
    let orderId = req.body.orderId;
    if (orderId == null) {
        return res.send({message: "orderId is required", code: 0})
    }
    try {
        let listDetailOrder = [];
        let data = jwt.verify(req.header('Authorization'), process.env.ACCESS_TOKEN_SECRET);
        let cus = await CustomerModel.customerModel.findById(data.cus._id);
        let order = await OrderModel.oderModel.find({
            customer_id: cus._id,
            _id: orderId
        })
            .populate("map_voucher_cus_id")
            .populate("customer_id")
            .populate("employee_id")
            .populate("delivery_address_id")
        await Promise.all(order.map(async item => {
            let listProduct = [];
            let detailOrder = await DetailOrder.detailOrderModel.find({
                order_id: item._id,
            })
                .populate("order_id")
                .populate("product_id")
            await Promise.all(detailOrder.map(async item => {
                let product = await ProductModel.productModel.findById(item.product_id);
                product.quantity = item.quantity;
                listProduct.push(product);
            }))
            listDetailOrder.push({order: item, listProduct: listProduct});
        }))
        listDetailOrder.sort((b, a) => moment(a.order.create_time, "YYYY-MM-DD-HH:mm:ss") - moment(b.order.create_time, "YYYY-MM-DD-HH:mm:ss"));
        return res.send({message: "get order success", listDetailOrder: listDetailOrder, code: 1})
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}
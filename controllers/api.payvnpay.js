let $ = require('jquery');
const moment = require("moment-timezone");
const querystring = require("qs");
const crypto = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const CustomerModel = require("../modelsv2/model.customer");
const EmployeeModel = require("../modelsv2/model.employee");
const VoucherModel = require("../modelsv2/model.voucher");
const MapVoucherModel = require("../modelsv2/model.map_voucher_cust")
const ProductImg = require("../modelsv2/model.imgproduct");
const OrderModel = require("../modelsv2/model.order");
const DetailOrder = require("../modelsv2/model.detailorder");
const ProductModel = require("../modelsv2/model.product");
const ProductCartModel = require("../modelsv2/model.ProductCart");
const NotificationModel = require("../modelsv2/model.notification");
const MapNotiCus = require("../modelsv2/model.map_notifi_cust");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceaccountkey/datn-789e4-firebase-adminsdk-nbmof-aa2593c4f9.json");
let mList_order;
let mMap_voucher_cus_id;
let mEmployee_id;
let mDelivery_address_id;
let ipAddress = process.env.IP_ADDRESS;
let mData;
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
exports.createPaymentUrl = async (req, res) => {
    let list_order = req.body.list_order;
    let map_voucher_cus_id = req.body.map_voucher_cus_id;
    let employee_id = req.body.employee_id;
    let delivery_address_id = req.body.delivery_address_id;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
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
        let createDate = moment(date).tz(specificTimeZone).format('YYYYMMDDHHmmss');
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;
        let orderId = moment(date).tz(specificTimeZone).format('DDHHmmss');
        let bankCode = req.body.bankCode;
        let locale = req.body.language;
        if (locale === null || locale === '') {
            locale = 'vn';
        }
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Number(total_amount) * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }
        vnp_Params = sortObject(vnp_Params);
        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, {encode: false});
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, {encode: false});
        mList_order = list_order;
        mMap_voucher_cus_id = map_voucher_cus_id;
        mEmployee_id = employee_id;
        mDelivery_address_id = delivery_address_id;
        mData = data;
        return res.send({message: "get url success", code: 1, url: vnpUrl});
    } catch (e) {
        console.log(e.message);
        return res.send({message: "create order fail", code: 0});
    }
}

exports.payFail = (req, res) => {
    return res.send({message: "pay fail", code: 0});
}
exports.paySuccess = async (req, res) => {
    return res.send({message: "pay success", code: 1});

}
exports.vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    vnp_Params = sortObject(vnp_Params);
    let tmnCode = process.env.VNP_TMN_CODE;
    let secretKey = process.env.VNP_HASH_SECRET;
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, {encode: false});
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (secureHash === signed) {
        let code = vnp_Params['vnp_ResponseCode'];
        if (code === "00") {
            try {
                let voucherPrice = 0;
                let errorOccurred = false;
                let total_amount = 0;
                let cus = await CustomerModel.customerModel.findById(mData.cus._id);
                await Promise.all(mList_order.map(async item => {
                    let product = await ProductModel.productModel.findById(item.product_id);
                    if (Number(product.quantity) < Number(item.quantity)) {
                        errorOccurred = true;
                    }
                }));
                if (errorOccurred) {
                    return res.redirect(`https://${ipAddress}/apiv2/payFail`);
                }
                let order = new OrderModel.oderModel({
                    customer_id: cus._id,
                    employee_id: mEmployee_id,
                    delivery_address_id: mDelivery_address_id,
                    create_time: create_time,
                    payment_methods: "Thanh toán qua VnPay",
                });
                await Promise.all(mList_order.map(async item => {
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
                if (mMap_voucher_cus_id !== null) {
                    let mapVoucher = await MapVoucherModel.mapVoucherModel.findOne({
                        _id: mMap_voucher_cus_id,
                        customer_id: mData.cus._id,
                        is_used: false
                    });
                    if (mapVoucher) {
                        let voucher = await VoucherModel.voucherModel.findById(mapVoucher.vocher_id);
                        if (voucher) {
                            voucherPrice = Number(voucher.price);
                            mapVoucher.is_used = true;
                            order.map_voucher_cus_id = mMap_voucher_cus_id;
                            await order.save();
                            await mapVoucher.save();
                        }
                    }
                }
                order.total_amount = total_amount - voucherPrice;
                await order.save();
                await Promise.all(mList_order.map(async item => {
                    if (item.productCartId != null) {
                        let productCart = await ProductCartModel.productCartModel.findById(item.productCartId);
                        if (productCart) {
                            await ProductCartModel.productCartModel.deleteOne({_id: item.productCartId});
                        }
                    }
                }))
                let product = await ProductModel.productModel.findById(mList_order[0].product_id);
                await createNotifi("Đặt đơn hàng", `Bạn đã đặt một đơn hàng vào lúc ${create_time} phương thức thanh toán thanh toán qua VnPay với mã đơn hàng ${order._id}`, product.img_cover, create_time, order.customer_id, cus.fcm);
                return res.redirect(`https://${ipAddress}/apiv2/paySuccess`);
            } catch (e) {
                console.log(e.message);
                return res.redirect(`https://${ipAddress}/apiv2/payFail`);
            }
        } else {
            return res.redirect(`https://${ipAddress}/apiv2/payFail`);
        }
    } else {
        return res.redirect(`https://${ipAddress}/apiv2/payFail`);
    }
}

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
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
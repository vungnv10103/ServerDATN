const express = require("express");
const router = express.Router();
const Middleware = require("../middleware/middleware");
const CusController = require("../controllersv2/controller.customer");
const CategoryController = require("../controllersv2/controller.category");
const ProductController = require("../controllersv2/controller.product");
const ProductCartCtrl = require("../controllersv2/controller.ProductCart");
const DeliveryAddressCtrl = require("../controllersv2/controller.deliveryaddress");
const VoucherCtrl = require("../controllersv2/controller.voucher");
const OrderCtrl = require("../controllersv2/controller.order");
const BannerCtrl = require("../controllersv2/controller.banner");
const FeedBackCtrl = require("../controllersv2/controller.feedback");
const AdminCtr = require("../controllersv2/controller.admin");
const EmployeeCtrl = require("../controllersv2/controller.employee");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const VnPayCtrl = require("../controllers/api.payvnpay");
const ApiBanner = require("../controllers/api.banner");
const NotificationCtrl = require("../controllersv2/controller.notification");
const ConversationCtrl = require("../controllersv2/controller.conversation");
const MessageCtrl = require("../controllersv2/controller.message");
//customer
router.post("/registerCustomer", CusController.registerCustomer);
router.post("/loginCustomer", CusController.loginCustomer);
router.post("/getInfoCus", Middleware.authorizationToken, CusController.getInfoCus);
router.post("/addFCM", CusController.addFCM);
router.post("/verifyCusLogin", CusController.verifyCusLogin);
router.get("/verifyCusRegister", CusController.verifyCusRegister);
router.get("/getInfoCus", Middleware.authorizationToken, CusController.getInfoCus);
router.post("/editCus", Middleware.authorizationToken, CusController.editCus);
router.post("/sendOtpEditCus", Middleware.authorizationToken, CusController.sendOtpEditCus);
router.post("/sendOtpEditPass", Middleware.authorizationToken, CusController.sendOtpEditPass);
router.post("/editPass", Middleware.authorizationToken, CusController.editPass);
router.post("/getPassWord", CusController.getPassWord);
router.get("/resetPassword", CusController.resetPassword);

//Admin
router.post("/loginAdmin", AdminCtr.loginAdmin);
router.post("/verifyOtpLoginAdmin", AdminCtr.verifyOtpLoginAdmin);


//Employee
router.post("/loginEmployee", EmployeeCtrl.loginEmployee);
router.post("/verifyOtpLoginEmployee", EmployeeCtrl.verifyOtpLoginEmployee);


//category
router.post("/getCategory", Middleware.authorizationToken, CategoryController.getCategory);

//product
router.post("/getAllProduct", Middleware.authorizationToken, ProductController.getAllProduct);
router.post("/getDetailProduct", Middleware.authorizationToken, ProductController.getDetailProduct);
router.post("/getRunOutProducts", ProductController.getRunOutProducts);
router.post("/getHotSaleProducts", ProductController.getHotSellProducts);
router.post("/getProductByCategoryId", Middleware.authorizationToken, ProductController.getProductByCategoryId);
router.post("/searchProductByName", Middleware.authorizationToken, ProductController.searchProductByName);


// cart
router.post("/addCart", Middleware.authorizationToken, ProductCartCtrl.addCard);
router.post("/getCartByIdCustomer", Middleware.authorizationToken, ProductCartCtrl.getCartByIdCustomer);
router.post("/updateCart", Middleware.authorizationToken, ProductCartCtrl.updateCart);
router.post("/editCartV2", Middleware.authorizationToken, ProductCartCtrl.editCartV2
);

//DeliveryAddress
router.post("/addDeliveryAddress", Middleware.authorizationToken, DeliveryAddressCtrl.addDeliveryAddress);
router.post("/deleteDeliveryAddress", Middleware.authorizationToken, DeliveryAddressCtrl.deleteDeliveryAddress
);
router.post("/editDeliveryAddress", Middleware.authorizationToken, DeliveryAddressCtrl.editDeliveryAddress);
router.post("/getDeliveryAddress", Middleware.authorizationToken, DeliveryAddressCtrl.getDeliveryAddress);

//voucher
router.post("/addVoucherAllUser", Middleware.authorizationToken, VoucherCtrl.addVoucherAllUser);
router.post("/getVoucherByIdV2", Middleware.authorizationToken, VoucherCtrl.getVoucherByIdV2);
router.post("/getVoucherByVoucherId", Middleware.authorizationToken, VoucherCtrl.getVoucherByVoucherId);

//order
router.post("/createOrder", Middleware.authorizationToken, OrderCtrl.createOrder);
router.post("/getOrderByStatus", Middleware.authorizationToken, OrderCtrl.getOrderByStatus);
router.post("/cancelOrder", Middleware.authorizationToken, OrderCtrl.cancelOrder);
router.post("/updateStatusOrder", OrderCtrl.updateStatusOrder);
router.post("/createOrderGuest", Middleware.authorizationToken, OrderCtrl.createOrderGuest);
router.post("/getStatic", OrderCtrl.getStatic);
router.post("/getYearStatic", OrderCtrl.getYearStatic);
router.post("/getPriceOrderZaloPay", Middleware.authorizationToken, OrderCtrl.getPriceOrderZaloPay);
router.post("/createOrderZaloPay", Middleware.authorizationToken, OrderCtrl.createOrderZaloPay);
router.post("/getOrderByOrderId", Middleware.authorizationToken, OrderCtrl.getOrderByOrderId);
router.post("/createPaymentUrl", Middleware.authorizationToken, VnPayCtrl.createPaymentUrl);
router.get("/payFail", VnPayCtrl.payFail);
router.get("/paySuccess", VnPayCtrl.paySuccess);
router.get("/vnpayReturn", VnPayCtrl.vnpayReturn);

// feedback
router.post("/addFeedback", Middleware.authorizationToken, FeedBackCtrl.addFeedback);
router.post("/getFeedBackByProductId", Middleware.authorizationToken, FeedBackCtrl.getFeedBackByProductId);
router.post("/getAllFeedBackByProductId", Middleware.authorizationToken, FeedBackCtrl.getAllFeedBackByProductId);

// banner
router.post(
    "/getListBanner",
    // Middleware.authorizationToken,
    BannerCtrl.getLisBanner
);
//notification
router.post("/getNotificationByUser", Middleware.authorizationToken, NotificationCtrl.getNotificationByUser);

// conversation
router.post("/createConversation", Middleware.authorizationToken, ConversationCtrl.createConversation);
router.post("/getConversationByIDUser", Middleware.authorizationToken, ConversationCtrl.getConversationByIDUser);
router.post("/getAnyUserById", Middleware.authorizationToken, ConversationCtrl.getAnyUserById);

// chat
router.post("/addMessage",
    Middleware.authorizationToken,
    upload.fields([
        { name: "filess", maxCount: 3 },
        { name: "images", maxCount: 3 },
        { name: "video", maxCount: 1 },
    ]),
    MessageCtrl.addMessage
);
router.post("/getMessageByIDConversation", Middleware.authorizationToken, MessageCtrl.getMessageByIDConversation);
router.post("/updateStatusMessage", Middleware.authorizationToken, MessageCtrl.updateStatusMessage);
router.post("/deleteMessage", Middleware.authorizationToken, MessageCtrl.deleteMessage);


module.exports = router;

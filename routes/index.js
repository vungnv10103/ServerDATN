var express = require("express");
var router = express.Router();
const ProductModel = require("./../modelsv2/model.product");
const ProductVideo = require("./../modelsv2/model.productvideo");
const ProductImg = require("./../modelsv2/model.imgproduct");
const OrderModel = require("./../modelsv2/model.order");
const CategoryModel = require("./../modelsv2/model.category");
const CartModelv2 = require("../modelsv2/model.ProductCart");
const UserModel = require("./../models/model.user");
const ConversationModel = require("./../modelsv2/model.conversation");
const MessageModel = require("./../modelsv2/model.message");
const VoucherModel = require("./../modelsv2/model.voucher");
const NotificationModel = require("./../modelsv2/model.notification");
const BannerModel = require("./../modelsv2/model.banner");
const MapVoucherCus = require("./../modelsv2/model.map_voucher_cust");
const AdminModel = require("./../modelsv2/model.admin");
const DetailOrderModel = require("./../modelsv2/model.detailorder");
const UploadFileFirebase = require("./../modelsv2/uploadFileFirebase");
const diliveryaddress = require("./../modelsv2/model.deliveryaddress");
const MapNotiCus = require("../modelsv2/model.map_notifi_cust");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const moment = require("moment-timezone");
const utils_1 = require('../public/js/ultils_1');
const path = require("path");
const mongoose = require('mongoose');
// const {cartModel, CartModel} = require("../models/model.cart");

const crypto = require("crypto");

const { stat } = require("fs");
const UploadFile = require("../models/uploadFile");
const CustomerModel = require("../modelsv2/model.customer");
const EmployeeModel = require("../modelsv2/model.employee");
const { sendOTPByEmail, sendOTPByEmailGetPass, sendNewPassByEmailGetPass } = require("../models/otp");
const admin = require('firebase-admin');
const serviceAccount = require('../serviceaccountkey/datn-789e4-firebase-adminsdk-nbmof-aa2593c4f9.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const axios = require("axios");
const CusModel = require("../modelsv2/model.customer");
const MapVoucherModel = require("../modelsv2/model.map_voucher_cust");
require("dotenv").config();

const match = [
    "image/jpeg",
    "image/*",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/jp2",
    "image/heif",
];
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneNumberRegex = /^(?:\+84|0)[1-9]\d{8}$/;
/* GET home page. */
router.get("/", (req, res) => {
    res.redirect("/stech.manager/type_login");
});
router.get("/stech.manager/home", async function (req, res, next) {
    try {
        res.render("index");
    } catch (e) {
        console.log(e.message);
        res.send({ message: "home not found", code: 0 })
    }
});
router.get("/stech.manager/product_action", async function (req, res, next) {
    const token = req.cookies.token
    try {
        let listProduct = await ProductModel.productModel.find();
        let listCategory = await CategoryModel.categoryModel.find();
        res.render("product_action", {
            products: listProduct,
            categories: listCategory,
            message: "get list product success",
            token: token,
            code: 1
        });
    } catch (e) {
        console.log(e.message);
        res.send({ message: "product not found", code: 0 })
    }
});
router.post("/stech.manager/AddProduct", upload.fields([{ name: "img_cover", maxCount: 1 }, {
    name: "video",
    maxCount: 1
}, { name: "list_img", maxCount: 10 }]), async function (req, res, next) {
    try {
        const name = req.body.name;
        const category_id = req.body.category_id;
        const price = req.body.price;
        const quantity = req.body.quantity;
        const color = req.body.color;
        const color_code = req.body.color_code;
        const ram = req.body.ram !== "" ? req.body.ram : null;
        const rom = req.body.rom !== "" ? req.body.rom : null;
        const description = req.body.description;

        const fileimg_cover = req.files["img_cover"];
        const filelist_img = req.files["list_img"];
        const filevideo = req.files["video"];
        const sold = req.body.sold;
        const status = req.body.status;
        let date = new Date();
        let specificTimeZone = 'Asia/Ha_Noi';
        let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
        if (category_id == null || name == null || description == null || fileimg_cover === undefined || filelist_img === undefined || filevideo === undefined || price == null || quantity == null || color == null || color_code == null) {
            return res.send({ message: "All fields are required", code: 0 });
        }

        if (isNaN(price) || isNaN(quantity)) {
            return res.send({ message: "Price and quantity must be numbers", code: 0 });
        }

        let product = new ProductModel.productModel({
            category_id: category_id,
            name: name,
            ram: ram,
            rom: rom,
            color: color,
            quantity: quantity,
            price: price,
            description: description,
            sold: sold,
            status: status,
            color_code: color_code,
            create_time: create_time,
        });

        let img_cover = await UploadFileFirebase.uploadFile(
            req,
            product._id.toString(),
            "img_cover",
            "products",
            fileimg_cover[0]
        );

        if (img_cover === 0) {
            return res.send({ message: "Failed to upload img_cover", code: 0 });
        }

        product.img_cover = img_cover;

        let productVideo = new ProductVideo.productVideoModel({
            product_id: product._id,
        });

        let video = await UploadFileFirebase.uploadFile(
            req,
            product._id.toString(),
            "video",
            "products",
            filevideo[0]
        );

        if (video === 0) {
            return res.send({ message: "Failed to upload video", code: 0 });
        }

        productVideo.video = video;

        for (const file of filelist_img) {
            let productListImg = new ProductImg.productImgModel({
                product_id: product._id,
            });

            let img = await UploadFileFirebase.uploadFile(
                req,
                product._id.toString(),
                "list_img",
                "products",
                file
            );

            if (img === 0) {
                return res.send({ message: "Failed to upload list_img", code: 0 });
            }

            productListImg.img = img;
            await productListImg.save();
        }

        await productVideo.save();
        await product.save();
        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error adding product", code: 0 });
    }
});
router.post("/stech.manager/EditProduct", upload.fields([{ name: "img_cover", maxCount: 1 }, {
    name: "video",
    maxCount: 1
}, { name: "list_img", maxCount: 10 }]), async function (req, res, next) {
    try {
        let productId = req.body.productId;
        const name = req.body.name;
        const category_id = req.body.category_id;
        const price = req.body.price;
        const quantity = req.body.quantity;
        const color = req.body.color;
        const color_code = req.body.color_code;
        const ram = req.body.ram !== "" ? req.body.ram : null;
        const rom = req.body.rom !== "" ? req.body.rom : null;
        const description = req.body.description;

        const fileimg_cover = req.files["img_cover"];
        const filelist_img = req.files["list_img"];
        const filevideo = req.files["video"];
        const sold = req.body.sold;
        const status = req.body.status;
        let date = new Date();
        let specificTimeZone = 'Asia/Ha_Noi';
        let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

        if (productId == null) {
            return res.send({ message: "product not found", code: 0 });
        }

        let product = await ProductModel.productModel.findById(productId);
        if (!product) {
            return res.send({ message: "product not found", code: 0 });
        }

        if (category_id !== undefined) {
            product.category_id = category_id;
        }
        if (name !== undefined) {
            product.name = name;
        }
        if (description !== undefined) {
            product.description = description;
        }
        if (price !== undefined) {
            product.price = price;
        }
        if (quantity !== undefined) {
            product.quantity = quantity;
        }
        if (sold !== undefined) {
            product.sold = sold;
        }
        if (ram !== null) {
            product.ram = ram;
        }
        if (rom !== null) {
            product.rom = rom;
        }
        if (color !== undefined) {
            product.color = color;
        }
        if (color_code !== undefined) {
            product.color_code = color_code;
        }
        if (status !== undefined) {
            product.status = status;
        }

        // Xóa thư mục img_cover cũ

        const imgCoverFolder = `products/${productId}/img_cover`;
        await UploadFileFirebase.deleteFolderAndFiles(res, imgCoverFolder);

        // Upload file mới cho img_cover
        let img_cover = await UploadFileFirebase.uploadFile(req, product._id.toString(), "img_cover", "products", fileimg_cover[0]);
        if (img_cover === 0) {
            return res.send({ message: "upload file fail", code: 0 });
        }
        product.img_cover = img_cover;

        // Xóa thư mục video cũ
        let productVideo = await ProductVideo.productVideoModel.findOne({ product_id: productId });

        const videoFolder = `products/${productId}/video`;
        await UploadFileFirebase.deleteFolderAndFiles(res, videoFolder);

        // Upload file mới cho video
        let video = await UploadFileFirebase.uploadFile(
            req,
            product._id.toString(),
            "video",
            "products",
            filevideo[0]
        );
        if (video === 0) {
            return res.send({ message: "upload file fail", code: 0 });
        }
        productVideo.video = video;

        // Xóa thư mục list_img cũ và xóa dữ liệu cũ trong MongoDB
        let productListImgs = await ProductImg.productImgModel.find({ product_id: productId });
        for (const productListImg of productListImgs) {
            const listImgFolder = `products/${productId}/list_img`;
            await UploadFileFirebase.deleteFolderAndFiles(res, listImgFolder);

            await ProductImg.productImgModel.findByIdAndDelete(productListImg._id);
        }

        // Upload file mới cho list_img và thêm dữ liệu mới vào MongoDB
        for (const file of filelist_img) {
            let img = await UploadFileFirebase.uploadFile(
                req,
                productId.toString(),
                "list_img",
                "products",
                file
            );

            if (img === 0) {
                return res.send({ message: "upload file fail", code: 0 });
            }

            const newProductListImg = new ProductImg.productImgModel({
                product_id: productId,
                img: img
            });

            await newProductListImg.save();
        }

        await productVideo.save();
        await product.save();
        return res.redirect('/stech.manager/product');
    } catch (e) {
        console.log(e);
        return res.send({ message: e.message.toString(), code: 0 });
    }
});
router.post('/stech.manager/deleteProduct', async function (req, res, next) {
    let productId = req.body.productId;
    if (productId == null) {
        return res.send({ message: "product not found", code: 0 });
    }
    try {
        const updateStatus = { status: 'remove' };
        await ProductModel.productModel.findByIdAndUpdate(productId, updateStatus);

        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e);
        return res.send({ message: e.message.toString(), code: 0 });
    }
});
router.post('/stech.manager/undeleteProduct', async function (req, res, next) {
    let productId = req.body.productId;
    if (productId == null) {
        return res.send({ message: "product not found", code: 0 });
    }
    try {
        const updateStatus = { status: 'stocking' };
        await ProductModel.productModel.findByIdAndUpdate(productId, updateStatus);

        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e);
        return res.send({ message: e.message.toString(), code: 0 });
    }
});

router.get('/stech.manager/product', async function (req, res, next) {
    try {
        let listProduct = await ProductModel.productModel.find();
        let terifyWith = req.cookies.verifyWith;

        res.render("product", {
            products: listProduct,
            terifyWith: terifyWith,
            message: "get list product success",
            code: 1
        });
    } catch (e) {
        console.log(e.message);
        res.render("error", { message: "product not found", code: 0 });
    }
});
router.post(
    "/stech.manager/add-category",
    upload.single('image'),
    async function (req, res, next) {
        try {
            const name = req.body.name;
            if (!req.file) {
                return res.status(400).send('Error: not receiving file');
            }
            const fileimg = req.file;
            let date = new Date();
            let specificTimeZone = 'Asia/Ha_Noi';
            let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss");

            if (name == null || name.toString().trim().length === 0) {
                return res.send({ message: "name category require", code: 0 });
            }
            if (fileimg == null) {
                return res.send({ message: "image category require", code: 0 });
            }

            let category = new CategoryModel.categoryModel({
                name,
                create_time,
            });

            let img = await UploadFileFirebase.uploadFileToFBStorage(
                category._id.toString(),
                "",
                "categories",
                fileimg
            );
            if (img === 0) {
                return res.send({ message: "Failed to upload image category", code: 0 });
            }
            category.img = img;
            await category.save();
            return res.redirect("category")
        } catch (e) {
            console.log(e.message);
            return res.send({ message: "Error add category", code: 0 });
        }
    });
router.post("/stech.manager/delete-cate", async function (req, res, next) {

    const CODE_DELETE = 1;

    if (!req.body.idCate) {
        return res.status(400).send('can not id category');
    }

    const idCate = req.body.idCate;
    if (idCate == null) {
        return res.send({ message: "category not found", code: 0 });
    }
    try {
        let message = req.body.message == null ? -1 : req.body.message;
        let dataProductByCate = await ProductModel.productModel.find({ category_id: idCate })
        if (dataProductByCate.length > 0 && message != CODE_DELETE) {
            return res.status(200).send({
                code: 'CATEGORY_USED',
                message: CODE_DELETE
            });
        }

        await CategoryModel.categoryModel.findByIdAndDelete(idCate);
        const categoryFirebase = `categories/${idCate}`;
        await UploadFileFirebase.deleteFolderAndFiles(res, categoryFirebase);
        return res.status(200).send({
            code: 'SUCCESS',
            message: "Delete category success"
        })
    } catch (e) {
        console.log(e);
        return res.send({ message: "error get data product", code: 0 });
    }

});

router.post("/stech.manager/get-cate", async function (req, res, next) {
    if (!req.body.idCate) {
        return res.status(400).send('can not id category');
    }

    const idCate = req.body.idCate;
    if (idCate == null) {
        return res.send({ message: "category not found", code: 0 });
    }
    try {
        let dataCategoryByID = await CategoryModel.categoryModel.findById(idCate)
        return res.status(200).send({
            dataCategoryByID,
            code: 'GET_SUCCESS',
            message: "get category success",
        })
    } catch (e) {
        console.log(e);
        return res.send({ message: "error get data category", code: 0 });
    }
});

router.post("/stech.manager/update-category",
    upload.single('image'),
    async function (req, res, next) {
        if (!req.body.idCate) {
            return res.status(400).send('can not id category');
        }

        const idCate = req.body.idCate;
        const name = req.body.name;
        const fileimg = req.file;

        let date = new Date();
        // let specificTimeZone = 'Asia/Ha_Noi';
        // let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss");

        if (idCate == null) {
            return res.send({ message: "category not found", code: 0 });
        }
        let category = await CategoryModel.categoryModel.findById(idCate);
        if (!category) {
            return res.send({ message: "category not found", code: 0 });
        }
        if (fileimg === undefined) {
            const result = await CategoryModel.categoryModel.updateOne({ _id: idCate }, { name: name });
            if (result.nModified > 0) {
                return res.json({ success: false, message: 'Failed to update category' });
            } else {
                return res.redirect('category')
            }
        }
        // console.log("img", fileimg);
        // xoá ảnh cũ ...
        const imgCateFolder = `categories/${idCate}`;
        await UploadFileFirebase.deleteFolderAndFiles(res, imgCateFolder);
        // Upload file mới cho category
        let img = await UploadFileFirebase.uploadFileCategory(
            req,
            category._id.toString(),
            "",
            "categories",
            fileimg
        );
        if (img === 0) {
            return res.send({ message: "upload file category fail", code: 0 });
        }
        category.name = name
        category.img = img;
        await category.save();
        return res.redirect('category');
    });

router.get("/stech.manager/category", async function (req, res, next) {
    let terifyWith = req.cookies.verifyWith;
    if (terifyWith == null || terifyWith.length == 0) {
        return res.redirect('/stech.manager/type_login')
    }
    try {
        let listCategory = await CategoryModel.categoryModel.find();

        res.render("category", {
            terifyWith: terifyWith,
            category: listCategory,
            message: "get list category success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        res.send({ message: "category not found", code: 0 });
    }
});
router.get("/stech.manager/login", function (req, res, next) {
    res.render("login");
});
router.get("/stech.manager/type_login", function (req, res, next) {
    res.render("type_of_login");
});
router.get("/stech.manager/register", function (req, res, next) {
    res.render("register");
});
router.get("/stech.manager/detail_product", async function (req, res, next) {
    try {
        var encodedProductId = req.query.productId;
        let productId = Buffer.from(encodedProductId, 'base64').toString('utf8');
        //let productId = req.query.productId;
        console.log("Received productId from cookie:", productId);

        let product = await ProductModel.productModel.findById(productId).populate({
            path: 'category_id',
            select: 'name'
        });

        if (product) {
            res.render("detail_product", { detailProduct: product, message: "get product details success", code: 1 });
        } else {
            res.send({ message: "Product not found", code: 0 });

        }
    } catch (e) {
        console.error("Error fetching:", e.message);
        res.send({ message: "Error ", code: 0 });
    }
});
router.get("/stech.manager/detail_user", async function (req, res, next) {
    try {
        var encodedUserId = req.query.userId;
        let userId = Buffer.from(encodedUserId, 'base64').toString('utf8');
        //let productId = req.query.productId;
        console.log("Received userId from cookie:", userId);

        let user = await UserModel.userModel.findById(userId).populate({ path: 'address', select: 'city' });

        if (user) {
            res.render("detail_user", { detailUser: user, message: "get user details success", code: 1 });
            console.log(user)
        } else {
            res.send({ message: "user not found", code: 0 });
        }
    } catch (e) {
        console.error("Error fetching user details:", e.message);
        res.send({ message: "Error fetching user details", code: 0 });
    }
});

router.get('/stech.manager/user', async function (req, res, next) {
    try {

        let listUser = await UserModel.userModel.find().populate({ path: 'address', select: 'city' });

        res.render("user", {
            users: listUser,
            message: "get list user success",
            code: 1,
        });

    } catch (e) {
        console.log(e.message);
        res.send({ message: "user not found", code: 0 });
    }
});
router.get('/stech.manager/customer', async function (req, res, next) {
    try {
        let listCus = await CustomerModel.customerModel.find({ status: { $ne: 'banned' } });

        res.render("customer", {
            customers: listCus,
            message: "Get list of non-banned customers success",
            code: 1,
        });

    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error getting customers", code: 0 });
    }
});
router.get('/stech.manager/employee', async function (req, res, next) {
    try {

        let listEmployee = await EmployeeModel.employeeModel.find({ status: { $ne: 'banned' } });

        res.render("employee", {
            employees: listEmployee,
            message: "get list Employee success",
            code: 1,
        });

    } catch (e) {
        console.log(e.message);
        res.send({ message: "user not found", code: 0 });
    }
});
router.get('/stech.manager/ban', async function (req, res, next) {
    try {
        let listCustomer = await CustomerModel.customerModel.find({ status: 'banned' });
        let listEmployee = await EmployeeModel.employeeModel.find({ status: 'banned' });

        let banned = [...listCustomer, ...listEmployee];
        res.render("ban", {
            banned: banned,
            message: "Get list of banned users and employees success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error getting banned users and employees", code: 0 });
    }
});
router.post('/stech.manager/banCustomer', async function (req, res, next) {
    try {
        const customerId = req.body.customerId;

        const updatedCustomer = await CustomerModel.customerModel.findByIdAndUpdate(
            customerId,
            { $set: { status: 'banned' } },
            { new: true }
        );

        if (updatedCustomer) {
            res.redirect('/stech.manager/customer');
        } else {
            console.log(`Customer ${customerId} not found.`);
            res.send({ message: "Customer not found", code: 0 });
        }
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error banning customer", code: 0 });
    }
});
router.post('/stech.manager/banEmployee', async function (req, res, next) {
    try {
        const EmployeeId = req.body.EmployeeId;

        const updatedEmployee = await EmployeeModel.employeeModel.findByIdAndUpdate(
            EmployeeId,
            { $set: { status: 'banned' } },
            { new: true }
        );

        if (updatedEmployee) {
            res.redirect('/stech.manager/employee');
        } else {
            console.log(`Employee ${EmployeeId} not found.`);
            res.send({ message: "Employee not found", code: 0 });
        }
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error banning Employee", code: 0 });
    }
});
router.post('/stech.manager/unban', async function (req, res, next) {
    try {
        const unbanId = req.body.unbanId;

        // Kiểm tra xem unbanId thuộc về Customer hay Employee
        const isCustomer = await CustomerModel.customerModel.exists({ _id: unbanId });
        const isEmployee = await EmployeeModel.employeeModel.exists({ _id: unbanId });

        if (isCustomer) {
            // Unban Customer
            const updatedCustomer = await CustomerModel.customerModel.findByIdAndUpdate(
                unbanId,
                { $set: { status: 'Has been activated' } },
                { new: true }
            );

            if (updatedCustomer) {
                res.redirect('/stech.manager/customer');
            } else {
                console.log(`Customer ${unbanId} not found.`);
                res.send({ message: "Customer not found", code: 0 });
            }
        } else if (isEmployee) {
            const updatedEmployee = await EmployeeModel.employeeModel.findByIdAndUpdate(
                unbanId,
                { $set: { status: 'Has been activated' } },
                { new: true }
            );

            if (updatedEmployee) {
                res.redirect('/stech.manager/employee');
            } else {
                console.log(`Customer ${unbanId} not found.`);
                res.send({ message: "Customer not found", code: 0 });
            }
        } else {
            console.log(`User with ID ${unbanId} not found.`);
            res.send({ message: "User not found", code: 0 });
        }
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error unbanning user", code: 0 });
    }
});

router.post('/stech.manager/AddEmployee', upload.fields([{
    name: "avatar",
    maxCount: 1
}]), async function (req, res, next) {
    try {
        const full_name = req.body.full_name;
        const password = req.body.password;
        const fileAvatar = req.files["avatar"];
        const email = req.body.email;
        const phone_number = req.body.phone_number;
        let date = new Date();
        let specificTimeZone = 'Asia/Ha_Noi';
        let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
        let employee = new EmployeeModel.employeeModel({
            full_name: full_name,
            email: email,
            password: password,
            phone_number: phone_number,
            create_time: create_time,
        });

        let avatar = await UploadFileFirebase.uploadFileProfile(
            req,
            employee._id.toString(),
            "avatar",
            "Employees",
            fileAvatar[0]
        );

        if (avatar === 0) {
            return res.send({ message: "Failed to upload avatar", code: 0 });
        }

        employee.avatar = avatar;
        await employee.save();
        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error adding employee", code: 0 });
    }
});
router.post('/stech.manager/AddCustomer', upload.fields([{
    name: "avatar",
    maxCount: 1
}]), async function (req, res, next) {
    try {
        const full_name = req.body.full_name;
        const password = req.body.password;
        const fileAvatar = req.files["avatar"];
        const email = req.body.email;
        const phone_number = req.body.phone_number;
        let date = new Date();
        let create_time = moment(date).format("YYYY-MM-DD-HH:mm:ss")
        let customer = new CustomerModel.customerModel({
            full_name: full_name,
            email: email,
            password: password,
            phone_number: phone_number,
            create_time: create_time,
        });
        if (fileAvatar != null) {
            let avatar = await UploadFileFirebase.uploadFileProfile(
                req,
                customer._id.toString(),
                "avatar",
                "Customers",
                fileAvatar[0]
            );
            customer.avatar = avatar;
        }
        await customer.save();
        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error adding customer", code: 0 });
    }
});
router.post('/stech.manager/UpdateCustomer', upload.fields([{
    name: "avatar",
    maxCount: 1
}]), async function (req, res, next) {
    try {
        const idCustomer = req.body.idCustomer;
        const full_name = req.body.full_name;
        const password = req.body.password;
        const fileAvatar = req.files["avatar"];
        const email = req.body.email;
        const phone_number = req.body.phone_number;
        let date = new Date();
        if (idCustomer == null) {
            return res.send({ message: "customer not found", code: 0 });
        }

        let customer = await CustomerModel.customerModel.findById(idCustomer);
        if (!customer) {
            return res.send({ message: "customer not found", code: 0 });
        }
        if (fileAvatar === undefined) {
            const result = await CustomerModel.customerModel.updateOne({ _id: idCustomer }, {
                full_name: full_name,
                password: password,
                email: email,
                phone_number: phone_number
            });

            if (result.nModified > 0) {
                return res.json({ success: false, message: 'Failed to update employee' });
            } else {
                return res.redirect('customer')
            }
        }
        // console.log("img", fileimg);
        // xoá ảnh cũ ...
        const imgCustomerFolder = `Customers/${idCustomer}`;
        await UploadFileFirebase.deleteFolderAndFiles(res, imgCustomerFolder);
        let avatar = await UploadFileFirebase.uploadFileProfile(
            req,
            customer._id.toString(),
            "avatar",
            "Customers",
            fileAvatar[0]
        );

        if (avatar === 0) {
            return res.send({ message: "Failed to upload avatar", code: 0 });
        }

        employee.avatar = avatar;
        await employee.save();
        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error adding employee", code: 0 });
    }
});
router.post('/stech.manager/get-employee', async function (req, res, next) {
    if (!req.body.idEmployee) {
        return res.status(400).send('can not id employee');
    }

    const idEmployee = req.body.idEmployee;
    if (idEmployee == null) {
        return res.send({ message: "employee not found", code: 0 });
    }
    try {
        let dataEmployeeByID = await EmployeeModel.employeeModel.findById(idEmployee)
        return res.status(200).send({
            dataEmployeeByID,
            code: 'GET_SUCCESS',
            message: "get employee success",
        })
    } catch (e) {
        console.log(e);
        return res.send({ message: "error get data employee", code: 0 });
    }
})
router.post('/stech.manager/UpdateEmployee', upload.fields([{
    name: "avatar",
    maxCount: 1
}]), async function (req, res, next) {
    try {
        const idEmployee = req.body.idEmployee;
        const full_name = req.body.full_name;
        const password = req.body.password;
        const fileAvatar = req.files["avatar"];
        const email = req.body.email;
        const phone_number = req.body.phone_number;
        let date = new Date();
        if (idEmployee == null) {
            return res.send({ message: "employee not found", code: 0 });
        }
        let employee = await EmployeeModel.employeeModel.findById(idEmployee);
        if (!employee) {
            return res.send({ message: "employee not found", code: 0 });
        }
        // let employee = new EmployeeModel.employeeModel({
        //     full_name: full_name,
        //     email: email,
        //     password: password,
        //     phone_number: phone_number,
        //     create_time: create_time,
        // });
        if (fileAvatar === undefined) {
            const result = await EmployeeModel.employeeModel.updateOne({ _id: idEmployee }, {
                full_name: full_name,
                password: password,
                email: email,
                phone_number: phone_number
            });

            if (result.nModified > 0) {
                return res.json({ success: false, message: 'Failed to update employee' });
            } else {
                return res.redirect('employee')
            }
        }
        // console.log("img", fileimg);
        // xoá ảnh cũ ...
        const imgEmployeeFolder = `Employees/${idEmployee}`;
        await UploadFileFirebase.deleteFolderAndFiles(res, imgEmployeeFolder);
        let avatar = await UploadFileFirebase.uploadFileProfile(
            req,
            employee._id.toString(),
            "avatar",
            "Employees",
            fileAvatar[0]
        );

        if (avatar === 0) {
            return res.send({ message: "Failed to upload avatar", code: 0 });
        }

        employee.avatar = avatar;
        await employee.save();
        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e.message);
        res.send({ message: "Error adding employee", code: 0 });
    }
});
router.get("/stech.manager/verify", async function (req, res, next) {
    res.render("verify");
});
router.get("/stech.manager/profile", async function (req, res, next) {
    const id = utils_1.getCookie(req, 'Uid');
    const verifyWith = utils_1.getCookie(req, 'verifyWith');
    try {
        if (verifyWith == "Employee") {
            let listprofile = await EmployeeModel.employeeModel.findById(id);

            res.render("profile", {
                profiles: listprofile,
                message: "get list profile success",
                code: 1,
            });
        } else if (verifyWith == "Admin") {

            let listAdmin = await AdminModel.adminModel.findById(id);
            res.render("profile", {
                profiles: listAdmin,
                message: "get list profile success",
                code: 1,
            });
        }
    } catch (e) {
        console.log(e.message);
        res.send({ message: "profile not found", code: 0 });
    }
});

router.post("/stech.manager/create-conversation", async function (req, res, next) {
    let idUserLoged = req.cookies.Uid;
    if (idUserLoged == null || idUserLoged.length <= 0) {
        return res.redirect('/stech.manager/type_login')
    }
    let idUserSelected = req.body.idUserSelected;
    if (idUserSelected === undefined) {
        return res.status(200).send({
            code: "",
            message: "ID user selected not found"
        })
    }

    let idLoged = new mongoose.Types.ObjectId(idUserLoged);
    let idSelected = new mongoose.Types.ObjectId(idUserSelected);
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss");

    let conversation = await ConversationModel.conversationModel.findOne({ receive_id: idSelected })
    if (conversation == null) {
        let newConversation = new ConversationModel.conversationModel({
            creator_id: idLoged,
            receive_id: idSelected,
            created_at: create_time,
            updated_at: "",
            deleted_at: ""
        });
        await newConversation.save();
        return res.status(200).send({ code: "CREATE_SUCCESS", message: "create conversation" });
    }

    return res.status(200).send({ code: "REDIRECT", message: "conversation exist" });
})


router.post("/stech.manager/create-message", async function (req, res, next) {
    let idUserLoged = req.cookies.Uid;
    if (idUserLoged == null || idUserLoged.length <= 0) {
        return res.redirect('/stech.manager/type_login')
    }

    let dataChat = req.cookies.dataChat;
    let myData = Buffer.from(dataChat, 'base64').toString('utf8');
    let mData = JSON.parse(myData);
    let idConversation = mData.idConSelected;

    let message = req.body.message;
    if (message === undefined) {
        return res.status(200).send({ code: "ERROR", message: "can not get message" })
    }

    try {
        let date = new Date();
        let specificTimeZone = 'Asia/Ha_Noi';
        let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss");

        let messageEncrypted = ''
        const algorithm = 'aes-128-cbc';
        const IV_LENGTH = 16;
        const ENCRYPTION_KEY = process.env.API_KEY;
        const hash = crypto.createHash("sha1");
        hash.update(ENCRYPTION_KEY)
        const digestResult = hash.digest();
        // Chuyển đổi kết quả digest thành Uint8Array
        const uint8Array = new Uint8Array(digestResult);
        // Sử dụng slice từ Uint8Array.prototype
        const keyUint8Array = uint8Array.slice(0, 16);
        // Chuyển đổi kết quả Uint8Array về Buffer nếu cần
        const keyBuffer = Buffer.from(keyUint8Array);

        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
        let encrypted = cipher.update(message, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        messageEncrypted = iv.toString('hex') + ':' + encrypted;

        let newMessage = new MessageModel.messageModel({
            conversation_id: idConversation,
            sender_id: idUserLoged,
            message: messageEncrypted,
            message_type: "text",
            status: "unseen",
            created_at: create_time,
        });
        await newMessage.save();
        return res.status(200).send({
            dataMessage: newMessage,
            code: "CREATE_SUCCESS",
            message: "create message success"
        });
    } catch (e) {
        console.log(e);
        return res.status(200).send({ code: "", message: "create message error" })
    }
});


async function decryptedMessage(encryptedMessage) {
    let message = ''
    if (encryptedMessage.length <= 0) {
        return encryptedMessage
    }
    const ENCRYPTION_KEY = process.env.API_KEY;
    const algorithm = process.env.ALGORITHM;
    const hash = crypto.createHash("sha1");
    hash.update(ENCRYPTION_KEY)
    const digestResult = hash.digest();
    const uint8Array = new Uint8Array(digestResult);
    const keyUint8Array = uint8Array.slice(0, 16);
    const keyBuffer = Buffer.from(keyUint8Array);
    let textParts = encryptedMessage.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf8');
    message = decrypted;

    return message;
}

async function getDataConversation(idUserLoged) {
    let listConversation = await ConversationModel.conversationModel.find({ creator_id: idUserLoged });

    let dataIDuser = []
    listConversation.map((con) => {
        if (con.creator_id != idUserLoged) {
            dataIDuser.push(con.creator_id);
        }
        if (con.creator_id == idUserLoged) {
            dataIDuser.push(con.receive_id);
        }
    })

    let dataUser = [];
    await Promise.all(
        dataIDuser.map(async (id) => {
            try {
                let user = await CustomerModel.customerModel.findById(id);
                dataUser.push(user);
            } catch (error) {
                console.log(`get data user: ${error}`);
            }
        })
    );

    let dataUserRender = []
    let userRender = {};
    await Promise.all(
        dataUser.map(async (user) => {
            userRender[user._id] = {
                id: user._id,
                name: user.full_name,
                avatar: user.avatar,
                email: user.email,
                phone: user.phone_number
            }
        })
    );

    for (let userID in userRender) {
        dataUserRender.push(userRender[userID]);
    }

    let dataLastMessage = [];
    await Promise.all(
        listConversation.map(async (con) => {
            let listMessage = await MessageModel.messageModel.find({ conversation_id: con._id });
            if (listMessage.length > 0) {
                const latestMessage = listMessage.reduce((acc, current) => {
                    const accDate = new Date(acc.created_at);
                    const currentDate = new Date(current.created_at);
                    return accDate > currentDate ? acc : current;
                });
                dataLastMessage.push(latestMessage);
            }
        })
    );

    let dataConversation = [];
    // Lặp qua mảng listConversation
    for (let conversation of listConversation) {
        // Tìm thông tin user trong dataUserRender
        let userData = dataUserRender.find(user => user.id.toString() === conversation.receive_id.toString());
        // Tìm thông tin last message trong dataLastMessage
        let lastMessage = dataLastMessage.find(message => message.conversation_id.toString() === conversation._id.toString());
        // Tạo đối tượng mới với thông tin kết hợp từ ba mảng
        let message = await decryptedMessage(lastMessage ? lastMessage.message : '');
        let newMsg = lastMessage ? lastMessage.deleted_at.length > 0 ? "Đã gỡ 1 tin nhắn" : message : "";
        let newMsg2 = lastMessage ? lastMessage.message_type == "image" ? "Đã gửi 1 ảnh" : newMsg : "";
        let newMsg3 = lastMessage ? lastMessage.message_type == "video" ? "Đã gửi 1 video" : newMsg2 : "";
        let combinedData = {
            conversation_id: conversation._id,
            sender_id: lastMessage ? lastMessage.sender_id : "",
            // message: lastMessage ? lastMessage.deleted_at.length > 0 ? "Đã gỡ 1 tin nhắn" : message : "",
            message: lastMessage ? message.sender_id == idUserLoged ? "Bạn: " + newMsg3 : newMsg3 : "",
            message_type: lastMessage ? lastMessage.message_type : '',
            idMsg: lastMessage ? lastMessage._id : "",
            status: lastMessage ? lastMessage.status : 'unseen',
            creator_id: conversation.creator_id,
            receive_id: conversation.receive_id,
            msg_deleted_at: lastMessage ? lastMessage.deleted_at : "",
            created_at: lastMessage ? lastMessage.created_at : conversation.created_at,
            updated_at: conversation.updated_at,
            deleted_at: conversation.deleted_at,
            __v: conversation.__v,
            userID: userData ? userData.id : "",
            name: userData ? userData.name : '',
            avatar: userData ? userData.avatar : '',
            email: userData ? userData.email : '',
            phone: userData ? userData.phone : ''
        };
        dataConversation.push(combinedData);
    }

    /* Data Preview
        console.log(listConversation);
        console.log(dataUserRender);
        console.log(dataLastMessage);
        console.log(dataConversation);
        */

    return dataConversation;
}

router.get("/stech.manager/chat/c/", async function (req, res, next) {

    let dataChat = req.cookies.dataChat;
    let myData = Buffer.from(dataChat, 'base64').toString('utf8');
    let mData = JSON.parse(myData);
    let idConversation = mData.idConSelected;
    let idMsg = mData.idMsg;
    let idUserSelected = mData.idUserSelected;

    try {
        let idUserLoged = req.cookies.Uid;
        if (idUserLoged == null || idUserLoged.length <= 0) {
            return res.redirect('/stech.manager/type_login')
        }
        // const typeLogin = req.cookies.LoginType;

        // Start Data User
        let dataUserLoged = await AdminModel.adminModel.findById({ _id: idUserLoged });
        if (dataUserLoged == null) {
            dataUserLoged = await EmployeeModel.employeeModel.findById({ _id: idUserLoged });
        }
        let dataUserSelected = await CustomerModel.customerModel.findById({ _id: idUserSelected });
        // End Data User

        // Update status message
        if (idMsg != null) {
            try {
                let message = await MessageModel.messageModel.findByIdAndUpdate(idMsg, { status: "seen" });
            } catch (e) {
                console.log(e);
                // return res.send({ message: "update status message fail", code: 0 });
            }
        }

        let dataConversation = await getDataConversation(idUserLoged);
        // let dataConversation = await ConversationModel.conversationModel.find({ creator_id: idUserLoged });
        // let dataConversation = await ConversationModel.conversationModel.find();
        let dataMessage = await MessageModel.messageModel.find({ conversation_id: idConversation });

        let newDataMessage = []
        dataMessage.map((msg) => {
            let message = ''
            if (msg.message.length <= 0) {
                return msg.message
            }
            const algorithm = process.env.ALGORITHM;
            const ENCRYPTION_KEY = process.env.API_KEY;
            const hash = crypto.createHash("sha1");
            hash.update(ENCRYPTION_KEY)
            const digestResult = hash.digest();
            const uint8Array = new Uint8Array(digestResult);
            const keyUint8Array = uint8Array.slice(0, 16);
            const keyBuffer = Buffer.from(keyUint8Array);
            let textParts = msg.message.split(':');
            let iv = Buffer.from(textParts.shift(), 'hex');
            let encryptedText = Buffer.from(textParts.join(':'), 'hex');
            let decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
            decrypted += decipher.final('utf8');

            message = decrypted;

            let itemMsg = {
                _id: msg._id,
                conversation_id: msg.conversation_id,
                sender_id: msg.sender_id,
                message: msg.deleted_at.length > 0 ? "Đã gỡ 1 tin nhắn" : message,
                message_type: msg.message_type,
                created_at: msg.created_at,
                deleted_at: msg.deleted_at
            }
            newDataMessage.push(itemMsg);
        });

        return res.render("chat", {
            conversations: dataConversation.length > 0 ? dataConversation : [],
            userLoged: dataUserLoged,
            dataMessage: newDataMessage,
            dataHeaderMsg: dataUserSelected,
            idConversation: idConversation,
            isOpenChat: true,
        });
    } catch (e) {
        console.log(e.message);
        res.send({ message: "conversation not found", code: 0 });
    }
});

router.get("/stech.manager/chat", async function (req, res, next) {
    try {
        // Check login
        let idUserLoged = req.cookies.Uid
        if (idUserLoged == null || idUserLoged.length <= 0) {
            return res.redirect('/stech.manager/type_login')
        }
        let dataUserLoged = await AdminModel.adminModel.findById({ _id: idUserLoged });
        if (dataUserLoged == null) {
            dataUserLoged = await EmployeeModel.employeeModel.findById({ _id: idUserLoged });
        }

        let dataConversation = await getDataConversation(idUserLoged);
        // let dataConversation = await ConversationModel.conversationModel.find({ creator_id: idUserLoged });
        // console.log(dataConversation);
        return res.render("chat", {
            conversations: dataConversation.length > 0 ? dataConversation : [],
            userLoged: dataUserLoged,
            // dataMessage: {},
            isOpenChat: false,
            idConversation: "",
        });
    } catch (e) {
        console.log(`error get chat: ${e.message}`);
        return res.send({ message: "conversation not found", code: 0 });
    }
});

router.get("/stech.manager/cart", async function (req, res, next) {
    // const userId = req.query.userId;
    const userId = utils_1.getCookie(req, 'Uid');
    let terifyWith = req.cookies.verifyWith;
    try {
        let cartUser = await CartModelv2.productCartModel.find({ customer_id: userId })
        if (cartUser !== null) {
            let dataProduct = [];
            await Promise.all(cartUser.map(async (cart) => {
                let idCart = cart.product_id;
                let item = await ProductModel.productModel.findById(idCart)
                dataProduct.push(item)
            }))
            let dataCart = [];
            await Promise.all(cartUser.map(async (cart) => {
                dataProduct.map((product) => {
                    if (cart.product_id.equals(product._id)) {
                        dataCart.push({
                            _id: cart._id,
                            customer_id: cart.customer_id,
                            product_id: cart.product_id,
                            product_name: product.name,
                            product_ram: product.ram,
                            product_rom: product.rom,
                            product_color: product.color,
                            product_price: product.price,
                            quantity: cart.quantity,
                            create_time: cart.create_time,
                            img_cover: product.img_cover
                        })
                    }
                })
            }))
            res.render("cart", {
                dataCart: dataCart,
                terifyWith: terifyWith,
                message: "get list cart success",
                code: 1,
            })
        }
    } catch (e) {
        console.log(e.message);
        res.send({ message: "cart not found", code: 0 })
    }
});

router.post("/stech.manager/AddCart", async (req, res) => {
    const userID = req.cookies.Uid;
    const productID = req.body.productId;
    const quantity = req.body.quantity;

    try {
        // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng hay chưa
        const existingCartItem = await CartModelv2.productCartModel.findOne({
            customer_id: userID,
            product_id: productID,
        });

        if (existingCartItem) {
            existingCartItem.quantity = parseInt(existingCartItem.quantity);
            let gt1 = parseInt(existingCartItem.quantity);
            let gt2 = parseInt(quantity);
            console.log(gt1 + gt2)
            // Nếu sản phẩm đã tồn tại, cập nhật số lượng
            if ('quantity' in existingCartItem) {
                gt1 += gt2; // Chuyển đổi quantity thành số trước khi cộng
                console.log(gt1);
                await CartModelv2.productCartModel.findByIdAndUpdate(existingCartItem._id, { $set: { quantity: gt1 } });
            } else {
                console.error('Error adding to cart: "quantity" property not found in existingCartItem');
            }
        } else {
            // Nếu sản phẩm chưa tồn tại, tạo mới một item trong giỏ hàng
            let date = new Date();
            let specificTimeZone = 'Asia/Ha_Noi';
            let timestamp = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
            const cart = new CartModelv2.productCartModel({
                customer_id: userID,
                product_id: productID,
                quantity: parseInt(quantity), // Chuyển đổi quantity thành số
                create_time: timestamp,
            });

            await cart.save();
        }

        return res.redirect('/stech.manager/cart');
    } catch (error) {
        console.error('Error adding to cart:', error.message);
        return res.redirect('/stech.manager/cart'); // Xử lý lỗi và chuyển hướng về trang giỏ hàng
    }
});

router.post('/apiv2/editCartV2/:cartId', async (req, res) => {
    const userId = req.body.userId;
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    const cartId = req.params.cartId;

    try {
        // TODO: Thực hiện cập nhật quantity trong MongoDB sử dụng cartId
        // Ví dụ:
        const result = await CartModelv2.productCartModel.updateOne({ _id: cartId }, { quantity: quantity });

        if (result.nModified > 0) {
            return res.json({ success: false, message: 'Failed to update quantity' });
        } else {
            return res.json({ success: true, message: 'Quantity updated successfully' });
        }
    } catch (error) {
        console.error('Error updating quantity:', error.message);
        return res.json({ success: false, message: 'Error updating quantity' });
    }
});

const deleteProductFromCart = async (customerId, cartId) => {
    try {
        // Gọi model để xoá sản phẩm từ giỏ hàng trong CSDL
        const result = await CartModelv2.productCartModel.deleteOne({
            customer_id: customerId,
            _id: cartId,
        });
        console.log(customerId)
        if (result.deletedCount > 0) {
            // Sản phẩm đã được xoá thành công
            return { success: true, message: 'Product removed from cart successfully' };
        } else {
            // Không có sản phẩm nào được xoá (productId không tồn tại trong giỏ hàng của người dùng)
            return { success: false, message: 'Product not found in the cart' };
        }
    } catch (error) {
        console.error('Error deleting product from cart:', error.message);
        return { success: false, message: 'Error deleting product from cart' };
    }
};
router.post('/stech.manager/DeleteCart', async (req, res) => {
    const userID = req.cookies.Uid;
    const cartId = req.body.cartId;
    if (!userID) {
        console.error('UserID not found in cookies');
    } else {
        console.log(userID)
    }
    try {
        const result = await deleteProductFromCart(userID, cartId);
        // Xử lý kết quả và trả về phản hồi cho người dùng
        if (result.success) {
            res.redirect('/stech.manager/cart'); // Chuyển hướng về trang giỏ hàng sau khi xoá
        } else {
            // Xử lý lỗi (có thể chuyển hướng hoặc hiển thị thông báo)
            res.redirect('/stech.manager/cart'); // Chuyển hướng về trang giỏ hàng nếu có lỗi
        }
    } catch (error) {
        console.error('Error handling deleteFromCart:', error.message);
        res.redirect('/stech.manager/cart'); // Chuyển hướng về trang giỏ hàng nếu có lỗi
    }
});
router.get("/stech.manager/order", async function (req, res, next) {
    try {
        var encodedValueStatus = req.cookies.status;
        let verifyWith = req.cookies.verifyWith;

        if (encodedValueStatus === undefined || Buffer.from(encodedValueStatus, 'base64').toString('utf8') == 'All') {
            let orders = await OrderModel.oderModel.find().populate('customer_id employee_id delivery_address_id');
            orders.reverse();

            res.render("order", { orders: orders, terifyWith: verifyWith, message: "get list order success", code: 1 });

        } else {
            let valueStatus = Buffer.from(encodedValueStatus, 'base64').toString('utf8');
            let orders = await OrderModel.oderModel.find({ status: valueStatus }).populate('customer_id employee_id delivery_address_id');
            orders.reverse();

            res.render("order", { orders: orders, terifyWith: verifyWith, message: "get list order success", code: 1 });


        }

        // res.render("order", { orders: ordersWithProductInfo, message: "get list order success", code: 1 });
    } catch (e) {
        console.log(e.message);
        res.send({ message: "order not found", code: 0 })
    }
});
router.get("/stech.manager/detail_order", async function (req, res, next) {
    try {
        var encodedOrderId = req.query.orderId;
        let orderId = Buffer.from(encodedOrderId, 'base64').toString('utf8');
        let order = await OrderModel.oderModel.findById(orderId).populate('customer_id employee_id delivery_address_id');
        let detailOrders = await DetailOrderModel.detailOrderModel.find({ order_id: orderId }).populate('product_id');

        if (order) {
            res.render("detail_order", {
                order: order,
                detailOrders: detailOrders,
                message: "get order details success",
                code: 1
            });
        } else {
            res.send({ message: "Order not found", code: 0 });
        }
    } catch (e) {
        console.error("Error fetching order details:", e.message);
        res.send({ message: "Error fetching order details", code: 0 });
    }
});
router.get("/stech.manager/invoice", function (req, res, next) {

    function getCookie(name) {
        const match = req.headers.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
    }

    const orderDataCookie = getCookie('dataToInvoice');

    if (orderDataCookie) {
        // Giải mã cookie để có được dữ liệu đặt hàng
        const orderData = JSON.parse(decodeURIComponent(orderDataCookie));

        // Truyền dữ liệu vào layout "invoice.pug"
        res.render("invoice", {
            guestName: orderData.guestName,
            guestPhone: orderData.guestPhone,
            guestAddress: orderData.guestAddress,
            products: orderData.product,
        });
    } else {
        // Xử lý khi không có giá trị cookie
        res.send({ message: "No order data found in the cookie", code: 0 });
    }
});
router.get("/stech.manager/cart", async function (req, res, next) {
    // const userId = req.query.userId;
    // const userId = utils_1.getCookie(req, 'Uid');

    const userId = new mongoose.Types.ObjectId(utils_1.getCookie(req, 'Uid'));
    let verifyWith = req.cookies.verifyWith;

    console.log("id", userId)
    try {
        let cartUser = await CartModel.cartModel.findOne({ userId }).populate({
            path: 'product',
            select: 'productId quantity'
        });
        ;
        console.log(cartUser)

        res.render("cart", {
            carts: cartUser,
            terifyWith: verifyWith,
            message: "get list profile success",
            code: 1,
        })


    } catch (e) {
        console.log(e.message);
        res.send({ message: "cart not found", code: 0 })
    }
});
router.post('/updateQuantity/:productId', async (req, res) => {
    const productId = req.params.productId;
    const newQuantity = req.body.quantity;

    try {
        // Tìm và cập nhật số lượng trong cơ sở dữ liệu
        const updatedProduct = await CartModel.updateOne(
            { 'product._id': productId },
            { $set: { 'product.$.quantity': newQuantity } }
        );

        if (updatedProduct.nModified > 0) {
            // Cập nhật thành công
            res.json({ success: true, message: 'Quantity updated successfully' });
        } else {
            // Không có bản ghi nào được cập nhật (productId không tồn tại)
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating quantity' });
    }
});

router.get("/stech.manager/banner", async function (req, res, next) {
    try {
        let listbanner = await BannerModel.bannerModel.find();

        res.render("banner", { banners: listbanner, message: "get list banner success", code: 1 });


    } catch (e) {
        console.log(e.message);
        res.send({ message: "banner not found", code: 0 })
    }
});
router.get("/stech.manager/pay", function (req, res, next) {
    try {
        var cookieValue = req.headers.cookie.replace(/(?:(?:^|.*;\s*)selectedProducts\s*=\s*([^;]*).*$)|^.*$/, "$1");
        var listProduct = JSON.parse(decodeURIComponent(cookieValue));

        return res.render("pay", { products: listProduct })

    } catch (e) {
        console.log(e.message);
        res.send({ message: "pay not found", code: 0 })
    }
});
router.get("/stech.manager/edit_product_action", async function (req, res, next) {

    var cookieValue = req.headers.cookie.replace(/(?:(?:^|.*;\s*)productId\s*=\s*([^;]*).*$)|^.*$/, "$1");
    var productId = JSON.parse(decodeURIComponent(cookieValue));
    const token = req.cookies.token
    try {

        let productSelected = await ProductModel.productModel.findById(productId);
        let listCategory = await CategoryModel.categoryModel.find();

        res.render("edit_product_action",
            {
                products: productSelected,
                categories: listCategory,
                message: "get list product success",
                token: token,
                code: 1
            })
    } catch (e) {
        console.log(e.message);
        res.send({ message: "product not found", code: 0 })
    }
});

//Voucher
router.get("/stech.manager/voucher", async function (req, res, next) {
    try {
        //Voucher su dung nhieu nhat
        let mostVoucherValue = await MapVoucherCus.mapVoucherModel.aggregate([
            {
                $match: {
                    is_used: true
                }
            },
            {
                $group: {
                    _id: "$voucher_id",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 } // Sắp xếp theo số lần sử dụng giảm dần
            },
            {
                $limit: 1
            },
            {
                $project: {
                    vocher_id: "$_id", // Chỉ định lại tên trường
                    count: 1
                }
            }
        ]);

        let mostVoucher = await VoucherModel.voucherModel.findById(mostVoucherValue[0]._id);

        // Voucher được sử dụng ít nhất
        let lessVoucherValue = await MapVoucherCus.mapVoucherModel.aggregate([
            {
                $group: {
                    _id: "$voucher_id",
                    count: { $sum: { $cond: [{ $eq: ["$is_used", true] }, 1, 0] } }
                }
            },
            {
                $sort: { count: 1 } // Sắp xếp theo số lần sử dụng tăng dần
            },
            {
                $limit: 1
            },
            {
                $project: {
                    vocher_id: "$_id", // Chỉ định lại tên trường
                    count: 1
                }
            }
        ]);

        let lessVoucher = await VoucherModel.voucherModel.findById(lessVoucherValue[0]._id);

        let listVoucher = await VoucherModel.voucherModel.find();
        res.render("voucher", {
            vouchers: listVoucher.length > 0 ? listVoucher : [],
            mostVoucher: mostVoucher,
            mostCount: mostVoucherValue[0].count,
            lessVoucher: lessVoucher,
            lessCount: lessVoucherValue[0].count,
            message: "get list voucher success",
            code: 1,
        });
        // res.render("voucher", {
        //     vouchers: listVoucher.length > 0 ? listVoucher : [],
        //     mostVoucher: [],
        //     mostCount: 1,
        //     lessVoucher: [],
        //     lessCount: 1,
        //     message: "get list voucher success",
        //     code: 1,
        // });
    } catch (e) {
        console.log(e.message);
        res.send({ message: "voucher not found", code: 0 });
    }
});
router.post("/stech.manager/createVoucher", async function (req, res, next) {
    let name = req.body.name;
    let content = req.body.content;
    let price = req.body.price;
    let toDate = req.body.toDate;
    let fromDate = req.body.fromDate;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (name == null) {
        return res.send({ message: "title is required", code: 0 });
    }
    if (content == null) {
        return res.send({ message: "content is required", code: 0 });
    }
    if (price == null) {
        return res.send({ message: "price is required", code: 0 });
    }
    if (toDate == null) {
        return res.send({ message: "toDate is required", code: 0 });
    }
    if (fromDate == null) {
        return res.send({ message: "fromDate is required", code: 0 });
    }
    if (create_time == null) {
        return res.send({ message: "create_time is required", code: 0 });
    }
    try {
        let voucher = new VoucherModel.voucherModel({
            name: name,
            content: content,
            price: price,
            toDate: moment(toDate).tz(specificTimeZone).format('YYYY-M-D'),
            fromDate: moment(fromDate).tz(specificTimeZone).format('YYYY-M-D'),
            create_time: create_time,
        });
        await voucher.save();
        let cus = await CusModel.customerModel.find();
        await Promise.all(cus.map(async item => {
            let mapVoucher = new MapVoucherModel.mapVoucherModel({
                vocher_id: voucher._id,
                customer_id: item._id,
                is_used: false,
                create_time: create_time,
            });
            await mapVoucher.save();
        }));
        await Promise.all(cus.map(async item => {
            await createNotifi(name, content, create_time, item._id, item.fcm, voucher._id);
        }));
        res.redirect(req.get('referer'));
    } catch (e) {
        return res.send({ message: e.message.toString(), code: 0 });
    }
});
router.post("/stech.manager/updateVoucher", async function (req, res, next) {
    try {
        let name = req.body.name;
        let content = req.body.content;
        let price = req.body.price;
        let toDate = req.body.toDate;
        let fromDate = req.body.fromDate;
        let voucherId = req.body.voucherId;
        if (voucherId == null) {
            return res.send({ message: "voucherId is required", code: 0 });
        }
        try {
            let voucher = await VoucherModel.voucherModel.findById(voucherId);
            let newVoucher = {
                name: voucher.name,
                content: voucher.content,
                price: voucher.price,
                toDate: formatDateTime(voucher.toDate),
                fromDate: formatDateTime(voucher.fromDate),
                create_time: voucher.create_time,
            }
            if (name !== null) {
                newVoucher.name = name;
            }
            if (content !== null) {
                newVoucher.content = content;
            }
            if (price !== null) {
                newVoucher.price = price;
            }
            if (toDate !== null) {
                newVoucher.toDate = toDate;
            }
            if (fromDate !== null) {
                newVoucher.fromDate = fromDate;
            }
            await VoucherModel.voucherModel.updateMany({ _id: voucherId }, { $set: newVoucher });
            res.redirect(req.get('referer'));
        } catch (e) {
            console.log(e.message);
            return res.send({ message: e.message.toString(), code: 0 });
        }
    } catch (e) {
        console.log(e.message);
        res.send({ message: "create voucher fail", code: 0 });
    }
})

function formatDateTime(dateTimeString) {
    var selectedDate = new Date(dateTimeString);

    // Lấy các thành phần của ngày và giờ
    var year = selectedDate.getFullYear();
    var month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    var day = selectedDate.getDate().toString().padStart(2, '0');
    var hour = selectedDate.getHours().toString().padStart(2, '0');
    var minute = selectedDate.getMinutes().toString().padStart(2, '0');
    var second = selectedDate.getSeconds().toString().padStart(2, '0');

    // Định dạng lại theo "YYYY-MM-DD HH:mm:ss"
    var formattedDate = `${year}-${month}-${day}-${hour}:${minute}:${second}`;

    return formattedDate;
}

router.post("/stech.manager/deleteVoucher", async function (req, res, next) {
    let voucherId = req.body.voucherId;
    if (voucherId === null) {
        return res.send({ message: "voucher id is required", code: 0 })
    }
    try {
        let voucher = await VoucherModel.voucherModel.findById(voucherId);
        if (!voucher) {
            return res.send({ message: "voucher not found", code: 0 })
        }
        await VoucherModel.voucherModel.deleteMany({ _id: voucherId });
        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
});
//Notification
router.get("/stech.manager/notification", async function (req, res, next) {
    try {
        let listNotification = await NotificationModel.notificationModel.find();

        res.render("notification", {
            notifications: listNotification,
            message: "get list notification success",
            code: 1,
        });


    } catch (e) {
        console.log(e.message);
        res.send({ message: "notification not found", code: 0 });
    }
});

router.post("/stech.manager/addBanner", upload.fields([{
    name: "img",
    maxCount: 1
}]), async function (req, res, next) {
    const img = req.files["img"];
    let date = new Date();
    let create_time = moment(date).format("YYYY-MM-DD-HH:mm:ss")
    let admin_id = req.cookies.Uid;

    try {
        let banner = new BannerModel.bannerModel({
            admin_id: admin_id,
            create_time: create_time
        });
        let imgBanner = await UploadFileFirebase.uploadFileBanner(
            req,
            banner._id.toString(),
            "img",
            "banners",
            img[0]
        );
        if (imgBanner === 0) {
            return res.send({ message: "upload file img fail", code: 0 });
        }
        banner.img = imgBanner;
        await banner.save();
        res.redirect(req.get('referer'));
    } catch (e) {
        return res.send({ message: e.message.toString(), code: 0 });
    }

});
router.post("/stech.manager/updateBanner", upload.fields([{
    name: "img",
    maxCount: 1
}]), async function (req, res, next) {
    const img = req.files["img"];
    let bannerId = req.body.bannerId;

    if (bannerId == null) {
        return res.send({ message: "bannerId is required", code: 0 });
    }
    try {
        let banner = await BannerModel.bannerModel.findById(bannerId);
        let newBanner = {
            admin_id: banner.admin_id,
            create_time: banner.create_time
        }
        if (img != null) {
            const productFirebase = `banners/${bannerId}`;
            await UploadFileFirebase.deleteFolderAndFiles(res, productFirebase);

            let imgBanner = await UploadFileFirebase.uploadFileBanner(
                req,
                banner._id.toString(),
                "img",
                "banners",
                img[0]
            );
            if (imgBanner === 0) {
                return res.send({ message: "upload file img fail", code: 0 });
            }
            newBanner.img = imgBanner;
        }

        await BannerModel.bannerModel.updateMany({ _id: bannerId }, { $set: newBanner });
        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
});
router.post("/stech.manager/deleteBanner", async function (req, res, next) {
    try {
        let bannerId = req.body.bannerId;
        if (bannerId == null) {
            return res.send({ message: "bannerId is required", code: 0 });
        }

        await BannerModel.bannerModel.deleteMany({ _id: bannerId });

        const productFirebase = `banners/${bannerId}`;
        await UploadFileFirebase.deleteFolderAndFiles(res, productFirebase);

        res.redirect(req.get('referer'));

    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
})


router.post("/stech.manager/createNotification", upload.fields([{
    name: "img",
    maxCount: 1
}]), async function (req, res, next) {
    const img = req.files["img"];
    let title = req.body.title;
    let content = req.body.content;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let create_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")

    if (title == null) {
        return res.send({ message: "title is required", code: 0 });
    }
    if (content == null) {
        return res.send({ message: "content is required", code: 0 });
    }
    try {
        let notification = new NotificationModel.notificationModel({
            title: title,
            content: content,
            create_time: create_time,
        });
        let imgNoti = await UploadFileFirebase.uploadFileNotifi(
            req,
            notification._id.toString(),
            "img",
            "notifications",
            img[0]
        );
        if (imgNoti === 0) {
            return res.send({ message: "upload file img fail", code: 0 });
        }
        notification.img = imgNoti;
        await notification.save();
        let cus = await CustomerModel.customerModel.find();
        await Promise.all(cus.map(async item => {
            let mapNotiCus = new MapNotiCus.mapNotificationModel({
                notification_id: notification._id,
                customer_id: item._id,
                create_time: create_time,
            });
            await mapNotiCus.save();

        }));
        await Promise.all(cus.map(item => {
            if (item.fcm !== null) {
                sendMessage(item.fcm, title, content);
            }
        }));
        res.redirect(req.get('referer'));
    } catch (e) {
        return res.send({ message: e.message.toString(), code: 0 });
    }

});

router.post("/stech.manager/updateNotification", upload.fields([{
    name: "img",
    maxCount: 1
}]), async function (req, res, next) {
    const img = req.files["img"];
    let title = req.body.title;
    let content = req.body.content;
    let notificationId = req.body.notificationId;

    if (notificationId == null) {
        return res.send({ message: "notificationId is required", code: 0 });
    }
    try {
        let notification = await NotificationModel.notificationModel.findById(notificationId);
        let newNotification = {
            title: notification.title,
            content: notification.content,
            img: notification.img,
            create_time: notification.create_time,
        }
        if (title != null) {
            newNotification.title = title;
        }
        if (content != null) {
            newNotification.content = content;
        }
        if (img != null) {
            const productFirebase = `notifications/${notificationId}`;
            await UploadFileFirebase.deleteFolderAndFiles(res, productFirebase);

            let imgNoti = await UploadFileFirebase.uploadFileNotifi(
                req,
                notification._id.toString(),
                "img",
                "notifications",
                img[0]
            );
            if (imgNoti === 0) {
                return res.send({ message: "upload file img fail", code: 0 });
            }
            newNotification.img = imgNoti;
        }

        await NotificationModel.notificationModel.updateMany({ _id: notificationId }, { $set: newNotification });
        res.redirect(req.get('referer'));
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
});

router.post("/stech.manager/deleteNotification", async function (req, res, next) {
    try {
        let notificationId = req.body.NotifiId;
        if (notificationId == null) {
            return res.send({ message: "notificationId is required", code: 0 });
        }

        await NotificationModel.notificationModel.deleteMany({ _id: notificationId });

        const productFirebase = `notifications/${notificationId}`;
        await UploadFileFirebase.deleteFolderAndFiles(res, productFirebase);

        res.redirect(req.get('referer'));

    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
})
router.post("/stech.manager/editUser", upload.single('avatar'), async function (req, res, next) {
    let file = req.file;
    let password = req.body.password;
    let full_name = req.body.full_name;
    let phone_number = req.body.phone_number;
    let email = req.body.email;

    let idUser = req.cookies.Uid;
    let verifyWith = req.cookies.verifyWith;
    if (idUser == null) {
        return res.send({ message: "Admin not found", code: 0 });
    }

    try {
        let user;
        if (verifyWith == "Admin") {
            user = await AdminModel.adminModel.findById({ _id: idUser });
        } else if (verifyWith == "Employee") {
            user = await EmployeeModel.employeeModel.findById({ _id: idUser });
        }

        if (user == null) {
            return res.send({ message: "Admin not found", code: 0 });
        }
        if (password != null) {
            if (!passwordRegex.test(password)) {
                return res.send({
                    message:
                        "Minimum password 8 characters, at least 1 capital letter, 1 number and 1 special character",
                    code: 0,
                });
            }
            user.password = password;
        }
        if (full_name != null) {
            user.full_name = full_name;
        }
        if (phone_number != null) {
            if (!phoneNumberRegex.test(phone_number)) {
                return res.send({
                    message: "The phone number is not in the correct format",
                    code: 0,
                });
            }
            user.phone_number = phone_number;
        }
        if (email != null) {
            if (!emailRegex.test(email)) {
                return res.send({
                    message: "The email is not in the correct format",
                    code: 0,
                });
            }
            user.email = email;
        }
        if (file != null) {
            const imgFirebase = `admins/${idUser}`;
            await UploadFileFirebase.deleteFolderAndFiles(res, imgFirebase);

            let imgProfile = await UploadFileFirebase.uploadFileProfile(
                req,
                user._id.toString(),
                "avatar",
                "admins",
                file
            );
            if (imgProfile === 0) {
                return res.send({ message: "upload file img fail", code: 0 });
            }
            user.avatar = imgProfile;
        }
        await user.save();
        return res.redirect("profile");
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
})
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
const createNotifi = async (title, content, create_time, customer_id, registrationToken, voucher_id) => {
    let notification = new NotificationModel.notificationModel({
        title: title,
        content: `${content} với mã giảm giá ${voucher_id}`,
        img: "https://firebasestorage.googleapis.com/v0/b/datn-789e4.appspot.com/o/voucher%2F246797237_113729601098160_3073863297711986973_n.jpg?alt=media&token=42b7b8f1-45ba-444f-b7f8-09af65e75db5",
        create_time: create_time,
    });
    let mapNotiCus = new MapNotiCus.mapNotificationModel({
        notification_id: notification._id,
        customer_id: customer_id,
        create_time: create_time,
    });
    await notification.save();
    await mapNotiCus.save();
    sendMessage(registrationToken, title, `${content} với mã giảm giá ${voucher_id}`);
}
module.exports = router;
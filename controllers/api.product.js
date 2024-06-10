const ProductModel = require("../models/model.product");
const fs = require("fs");
const path = require("path");
const UploadFile = require("../models/uploadFile");
const moment = require("moment-timezone");
const matchImg = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/jp2",
    "image/heif",
    "image/jfif",
];
const matchVideo = [
    "video/mp4",
    "video/x-msvideo",
    "video/x-matroska",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/x-flv",
    "video/webm",
    "video/3gpp",
    "video/ogg",
    "video/mpeg",
];
exports.addProduct = async (req, res) => {
    let category = req.body.category;
    let title = req.body.title;
    let description = req.body.description;
    let fileimg_cover;
    let filelist_img;
    let filevideo;
    let option = req.body.option;
    try {
        fileimg_cover = req.files["img_cover"];
        filelist_img = req.files["list_img"];
        filevideo = req.files["video"];
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "error read fields" });
    }
    let price = req.body.price;
    let quantity = req.body.quantity;
    let sold = req.body.sold;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (category == null) {
        return res.send({ message: "category is required", code: 0 });
    }
    if (title == null) {
        return res.send({ message: "title is required", code: 0 });
    }
    if (description == null) {
        return res.send({ message: "description is required", code: 0 });
    }
    if (fileimg_cover === undefined) {
        return res.send({ message: "img cover is required", code: 0 });
    }
    if (filelist_img === undefined) {
        return res.send({ message: "img des is required", code: 0 });
    }
    if (filevideo === undefined) {
        return res.send({ message: "video des is required", code: 0 });
    }
    if (price == null) {
        return res.send({ message: "price is required", code: 0 });
    }
    if (quantity == null) {
        return res.send({ message: "quantity is required", code: 0 });
    }
    if (sold == null) {
        return res.send({ message: "sold is required", code: 0 });
    }
    if (isNaN(price)) {
        return res.send({ message: "price is number", code: 0 });
    }
    if (isNaN(quantity)) {
        return res.send({ message: "quantity is number", code: 0 });
    }
    if (isNaN(sold)) {
        return res.send({ message: "sold is number", code: 0 });
    }
    let isFormat = true;
    filelist_img.map((item) => {
        if (matchImg.indexOf(item.mimetype) === -1) {
            isFormat = false;
        }
    });
    if (matchImg.indexOf(fileimg_cover[0].mimetype) === -1) {
        isFormat = false;
    }
    if (matchVideo.indexOf(filevideo[0].mimetype) === -1) {
        isFormat = false;
    }
    if (isFormat === false) {
        return res.send({
            message: "The uploaded file is not in the correct format",
            code: 0,
        });
    }
    let product = new ProductModel.productModel({
        category: category,
        title: title,
        description: description,
        price: price,
        quantity: quantity,
        sold: sold,
        date: date_time,
        option: JSON.parse(option),
    });
    try {
        let img_cover = await UploadFile.uploadFile(
            req,
            product._id.toString(),
            "product",
            fileimg_cover[0],
            ".jpg"
        );
        if (img_cover === 0) {
            return res.send({ message: "upload file fail", code: 0 });
        }
        let video = await UploadFile.uploadFile(
            req,
            product._id.toString(),
            "product",
            filevideo[0],
            ".mp4"
        );
        if (video === 0) {
            return res.send({ message: "upload file fail", code: 0 });
        }
        let list_img = await UploadFile.uploadFiles(
            req,
            product._id.toString(),
            "product",
            filelist_img,
            ".jpg"
        );
        if (list_img === 0) {
            return res.send({ message: "upload file fail", code: 0 });
        }
        product.img_cover = img_cover;
        product.list_img = list_img;
        product.video = video;
        await product.save();
        return res.send({ message: "add product success", code: 1 });
    } catch (e) {
        console.log("sai" + e);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.getListProduct = async (req, res) => {
    try {
        let listProduct = await ProductModel.productModel
            .find()
            .populate("category");
        // console.log(`getListproduct: ${listProduct}`);
        return res.send({
            product: listProduct,
            message: "get list product success",
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.getProductById = async (req, res) => {
    let productId = req.body.productId;
    if (productId == null) {
        return res.send({ message: "product id is required" });
    }
    try {
        console.log(productId);
        let product = await ProductModel.productModel
            .findById(productId)
            .populate("category");
        if (!product) {
            return res.send({ message: "product not found", code: 0 });
        }
        console.log(product);
        if (!product) {
            return res.send({ message: "get product fail", code: 0 });
        }
        res.send({ product: product, message: "get product success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};

exports.getProductByIdCate = async (req, res) => {
    let categoryId = req.body.categoryId;
    if (categoryId == null) {
        return res.send({ message: "category id is required" });
    }
    try {
        let product = await ProductModel.productModel
            .find({ category: categoryId })
            .populate("category");
        if (!product) {
            return res.send({ message: "product not found", code: 0 });
        }
        if (!product) {
            return res.send({ message: "get product by id cate fail", code: 0 });
        }
        res.send({ product: product, message: "get product by id cate success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};

exports.deleteProduct = async (req, res) => {
    let productId = req.body.productId;
    if (productId == null) {
        return res.send({ message: "product not found", code: 0 });
    }
    try {
        let product = await ProductModel.productModel.findById(productId);
        if (!product) {
            return res.send({ message: "product not found", code: 0 });
        }
        let list_img = product.list_img;
        let img_cover = product.img_cover;
        let video = product.video;
        list_img.push(img_cover, video);
        let pathFolderDelete = img_cover.split("/")[5];
        let isRemove = true;
        list_img.map((item) => {
            if (item.split("3000")[1] !== undefined) {
                fs.unlink(
                    path.join(__dirname, "../public" + item.split("3000")[1]),
                    (err) => {
                        if (err) {
                            console.log(err.message);
                            isRemove = false;
                        }
                    }
                );
            }
        });
        if (isRemove === false) {
            return res.send({ message: "delete product fail", code: 0 });
        }
        if (pathFolderDelete !== undefined) {
            fs.rmdir(
                path.join(__dirname, "../public/images/product/" + pathFolderDelete),
                async (err) => {
                    if (err) {
                        isRemove = false;
                        console.log(err.message);
                    } else {
                        await ProductModel.productModel.deleteOne({ _id: productId });
                        return res.send({ message: "Delete product success", code: 1 });
                    }
                }
            );
        }
        if (isRemove === false) {
            return res.send({ message: "delete product fail", code: 0 });
        }
    } catch (e) {
        console.log(e);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.editProduct = async (req, res) => {
    let productId = req.body.productId;
    let category = req.body.category;
    let title = req.body.title;
    let description = req.body.description;
    let price = req.body.price;
    let quantity = req.body.quantity;
    let sold = req.body.sold;
    let fileimg_cover;
    let filelist_img;
    let filevideo;
    let option = req.body.option;
    let op = JSON.parse(req.body.option);
    try {
        fileimg_cover = req.files["img_cover"];
        filelist_img = req.files["list_img"];
        filevideo = req.files["video"];
    } catch (e) {
        console.log(e.message);
        return res.send({ message: "error read fields" });
    }
    if (productId == null) {
        return res.send({ message: "product not found", code: 0 });
    }
    try {
        let product = await ProductModel.productModel.findById(productId);
        if (!product) {
            return res.send({ message: "product not found", code: 0 });
        }
        if (category !== undefined) {
            product.category = category;
        }
        if (title !== undefined) {
            product.title = title;
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
        if (option !== undefined) {
            product.option = op;
        }
        if (fileimg_cover !== undefined) {
            console.log(fileimg_cover[0].mimetype);
            if (matchImg.indexOf(fileimg_cover[0].mimetype) === -1) {
                console.log(fileimg_cover[0].mimetype);
                return res.send({ message: "The uploaded file is not in the correct format 1", code: 0 });
            }
            if (product.img_cover.split("3000")[1] !== undefined) {
                UploadFile.deleteFile(res, product.img_cover.split("3000")[1]);
            }
            let img_cover = await UploadFile.uploadFile(req, product._id.toString(), "product", fileimg_cover[0], ".jpg");
            if (img_cover === 0) {
                return res.send({ message: "upload file fail", code: 0 });
            }
            product.img_cover = img_cover;
        }
        if (filelist_img !== undefined) {
            let isFormat = true;
            filelist_img.map(item => {
                console.log(item.mimetype);
                if (matchImg.indexOf(item.mimetype) === -1) {
                    console.log(item.mimetype);
                    isFormat = false;
                }
            });
            if (isFormat === false) {
                return res.send({ message: "The uploaded file is not in the correct format 2", code: 0 });
            }
            product.list_img.map((item) => {
                if (item.split("3000")[1] !== undefined) {
                    UploadFile.deleteFile(res, item.split("3000")[1]);
                }
            })
            let list_img = await UploadFile.uploadFiles(req, product._id.toString(), "product", filelist_img, ".jpg");
            if (list_img === 0) {
                return res.send({ message: "upload file fail", code: 0 });
            }
            product.list_img = list_img;
        }
        if (filevideo !== undefined) {
            console.log(filevideo[0].mimetype)
            if (matchVideo.indexOf(filevideo[0].mimetype) === -1) {
                console.log(filevideo[0].mimetype)
                return res.send({ message: "The uploaded file is not in the correct format 3", code: 0 });
            }
            if (product.video.split("3000")[1] !== undefined) {
                UploadFile.deleteFile(res, product.video.split("3000")[1]);
            }
            let video = await UploadFile.uploadFile(req, product._id.toString(), "product", filevideo[0], ".mp4");
            if (video === 0) {
                return res.send({ message: "upload file fail", code: 0 });
            }
            product.video = video;
        }
        await product.save();
        return res.send({ message: "Edit product success", code: 1 });
    } catch (e) {
        console.log(e);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.searchProduct = async (req, res) => {
    let txtSearch = req.body.txtSearch;
    if (txtSearch === null) {
        return res.send({ message: "text search is required", code: 0 });
    }
    try {
        let product = await ProductModel.productModel.find().populate("category");
        const filteredProducts = product.filter(item => {
            const lowercasedTitle = item.title.toLowerCase();
            const lowercasedSearchString = txtSearch.toLowerCase();
            return lowercasedTitle.includes(lowercasedSearchString);
        });
        return res.send({ message: "search success", product: filteredProducts, code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }

}


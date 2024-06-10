const CategoryModel = require("../models/model.category");
const UploadFile = require("../models/uploadFile");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const match = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/jp2",
    "image/heif"];


exports.addCategory = async (req, res) => {
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    let title = req.body.title;
    let file = req.file;
    if (title == null) {
        return res.send({ message: "title is required", code: 0 });
    }
    if (file == null) {
        return res.send({ message: "img is required", code: 0 });
    }
    if (match.indexOf(file.mimetype) === -1) {
        return res.send({ message: "The uploaded file is not in the correct format", code: 0 });
    }
    try {
        let category = new CategoryModel.categoryModel({
            title: title,
            date: date_time,
        })
        let statusCode = await UploadFile.uploadFile(req, category._id.toString(), "category", file, ".jpg");
        if (statusCode === 0) {
            return res.send({ message: "Upload file fail", code: 0 });
        } else {
            category.img = statusCode;
            await category.save();
            return res.send({ message: "add category success", code: 1 });
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 })
    }
};

exports.editCategory = async (req, res) => {
    let file = req.file;
    let title = req.body.title;
    let categoryId = req.body.categoryId;
    if (categoryId == null) {
        return res.send({ message: "category not found", code: 0 });
    }
    try {
        let category = await CategoryModel.categoryModel.findById(categoryId);
        if (!category) {
            return res.send({ message: "category not found", code: 0 });
        }
        if (title != null) {
            category.title = title;
        }
        if (file != null) {
            if (match.indexOf(file.mimetype) === -1) {
                return res.send({ message: "The uploaded file is not in the correct format", code: 0 });
            }
            const pathImgDelete = category.img.split("3000")[1];
            if(pathImgDelete !== undefined){
                UploadFile.deleteFile(res, pathImgDelete);
            }
            let statusCode = await UploadFile.uploadFile(req, category._id.toString(), "category", file, ".jpg");
            if (statusCode === 0) {
                return res.send({ message: "Upload file fail", code: 0 });
            } else {
                category.img = statusCode;
            }
        }
        await category.save();
        return res.send({ message: "Edit category success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
};
exports.deleteCategory = async (req, res) => {
    let categoryId = req.body.categoryId;
    if (categoryId == null) {
        return res.send({ message: "category not found", code: 0 });

    }
    try {
        let category = await CategoryModel.categoryModel.findById(categoryId);
        if (!category) {
            return res.send({ message: "category not found" });
        }
        const pathFolderDelete = category.img.split("/")[5];
        const pathImgDelete = category.img.split("3000")[1];
        if(pathImgDelete !== undefined && pathFolderDelete !== undefined){
            fs.unlink(path.join(__dirname, "../public" + pathImgDelete), (err) => {
                if (err) {
                    console.log(err);
                } else {
                    fs.rmdir(path.join(__dirname, "../public/images/category/" + pathFolderDelete), async (err) => {
                        if (err) {
                            console.log(err.message);
                        } else {
                            await CategoryModel.categoryModel.deleteOne({ _id: categoryId });
                            return res.send({ message: "Delete category success", code: 1 });
                        }
                    });
                }
            })
        }
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
exports.getCategoryById = async (req, res) => {
    let categoryId = req.body.categoryId;
    if (categoryId == null) {
        return res.send({message: "category id is required"})
    }
    try {
        let category = await CategoryModel.categoryModel.findById(categoryId);
        if(!category){
            return res.send({message: "category not found"})
        }
        res.send({category: category, message: "get category success", code: 1})
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

exports.getListCategory = async (req, res) => {
    try {
        let listCategory = await CategoryModel.categoryModel.find();
        return res.send({ category: listCategory, message: "get list category success", code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 })
    }
}
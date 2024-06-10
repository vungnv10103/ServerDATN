const fs = require("fs");
const path = require("path");
const {randomUUID} = require("crypto");
exports.uploadFile = (req, id, folder, fileItem, fileExtension) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uploadDir = path.join(__dirname, `../public/images/${folder}`, id);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {recursive: true});
            }
            if (!fileItem) {
                return reject("0");
            }
            let filePath = path.join(uploadDir, randomUUID() + fileExtension);
            await fs.promises.rename(fileItem.path, filePath);

            const imageUrl = `${req.protocol}://${req.get("host")}/images/${folder}/${id}/${path.basename(filePath)}`;
            resolve(imageUrl);
        } catch (e) {
            console.log(e.message);
            reject("0");
        }
    });
}
exports.deleteFile = (res, pathImgDelete) => {
    fs.unlink(path.join(__dirname, "../public" + pathImgDelete), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("delete success");
        }
    });
}
exports.uploadFiles = (req, id, folder, files, fileExtension) => {
    return new Promise(async (resolve, reject) => {
        try {
            const uploadDir = path.join(__dirname, `../public/images/${folder}`, id);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {recursive: true});
            }

            if (!files || !Array.isArray(files) || files.length === 0) {
                return reject("0");
            }

            const imageUrls = [];

            for (const fileItem of files) {
                if (!fileItem) {
                    continue;
                }
                const filePath = path.join(uploadDir, randomUUID() + fileExtension);

                await fs.promises.rename(fileItem.path, filePath);

                const imageUrl = `${req.protocol}://${req.get("host")}/images/${folder}/${id}/${path.basename(filePath)}`;
                imageUrls.push(imageUrl);
            }
            return resolve(imageUrls);
        } catch (error) {
            console.error(error.message);
            return reject("0");
        }
    });
};

const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const serviceAccount = require("../serviceaccountkey/datn-789e4-firebase-adminsdk-nbmof-aa2593c4f9.json");
// Cấu hình Firebase Admin SDK
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const bucket = admin.storage().bucket('gs://datn-13d57.appspot.com');


async function createFoldersIfNotExist(...folders) {
    for (const folder of folders) {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
    }
}
exports.uploadFileToFBStorage = async (id, fileType, folder, fileItem) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!fileItem) {
                return reject("0");
            }

            const productFolder = `${folder}/${id}`;
            const typeFolder = fileType.length > 0 ? `${productFolder}/${fileType}` : `${productFolder}`;

            // Tạo các thư mục nếu chưa tồn tại
            // await createFoldersIfNotExist(`${folder}`, productFolder, typeFolder);

            // Lưu trữ file vào đúng thư mục
            const destinationPath = `${typeFolder}/${fileItem.originalname}`; // Sử dụng tên gốc của file
            const file = bucket.file(destinationPath);

            await file.save(fileItem.buffer, {
                metadata: { contentType: fileItem.mimetype },
            });

            const token = uuidv4();
            const encodedPath = encodeURIComponent(destinationPath);
            const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

            resolve(fileUrl);
        } catch (e) {
            console.log(e.message);
            reject("0");
        }
    });
};

exports.uploadFile = async (req, id, fileType, folder, fileItem) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!fileItem) {
                return reject("0");
            }

            const productFolder = `products/${id}`;
            const typeFolder = `${productFolder}/${fileType}`;

            // Tạo các thư mục nếu chưa tồn tại
            await createFoldersIfNotExist('products', productFolder, typeFolder);

            // Lưu trữ file vào đúng thư mục
            const destinationPath = `${typeFolder}/${fileItem.originalname}`; // Sử dụng tên gốc của file
            const file = bucket.file(destinationPath);

            await file.save(fileItem.buffer, {
                metadata: { contentType: fileItem.mimetype },
            });

            const token = uuidv4();
            const encodedPath = encodeURIComponent(destinationPath);
            const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

            resolve(fileUrl);
        } catch (e) {
            console.log(e.message);
            reject("0");
        }
    });
};

exports.uploadFileNotifi = async (req, id, fileType, folder, fileItem) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!fileItem) {
                return reject("0");
            }

            const productFolder = `notifications/${id}`;
            const typeFolder = `${productFolder}/${fileType}`;

            // Tạo các thư mục nếu chưa tồn tại
            await createFoldersIfNotExist('notifications', productFolder, typeFolder);

            // Lưu trữ file vào đúng thư mục
            const destinationPath = `${typeFolder}/${fileItem.originalname}`; // Sử dụng tên gốc của file
            const file = bucket.file(destinationPath);

            await file.save(fileItem.buffer, {
                metadata: { contentType: fileItem.mimetype },
            });

            const token = uuidv4();
            const encodedPath = encodeURIComponent(destinationPath);
            const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

            resolve(fileUrl);
        } catch (e) {
            console.log(e.message);
            reject("0");
        }
    });
};
exports.uploadFileBanner= async (req, id, fileType, folder, fileItem) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!fileItem) {
                return reject("0");
            }

            const productFolder = `banners/${id}`;
            const typeFolder = `${productFolder}/${fileType}`;

            // Tạo các thư mục nếu chưa tồn tại
            await createFoldersIfNotExist('banners', productFolder, typeFolder);

            // Lưu trữ file vào đúng thư mục
            const destinationPath = `${typeFolder}/${fileItem.originalname}`; // Sử dụng tên gốc của file
            const file = bucket.file(destinationPath);

            await file.save(fileItem.buffer, {
                metadata: { contentType: fileItem.mimetype },
            });

            const token = uuidv4();
            const encodedPath = encodeURIComponent(destinationPath);
            const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

            resolve(fileUrl);
        } catch (e) {
            console.log(e.message);
            reject("0");
        }
    });
};

async function deleteFolderAndFiles(res, folderPath) {
    try {
        const files = await bucket.getFiles({ prefix: folderPath });
        for (const file of files[0]) {
            await file.delete();
        }
        console.log(`Folder ${folderPath} deleted successfully from Firebase Storage`);
    } catch (error) {
        console.error(`Error deleting folder from Firebase Storage: ${error.message}`);
        return res.send({ message: "Error deleting folder", code: 0 });
    }
}
exports.deleteFolderAndFiles = deleteFolderAndFiles;

exports.uploadFiles = async (req, id, folder, files, fileExtension) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!files || !Array.isArray(files) || files.length === 0) {
                return reject("0");
            }

            const uploadedUrls = [];

            for (const fileItem of files) {
                if (!fileItem) {
                    continue;
                }

                const destinationPath = `${folder}/${id}/${uuidv4()}`;
                const file = bucket.file(destinationPath);

                await file.save(fileItem.buffer, {
                    metadata: { contentType: fileItem.mimetype },
                });

                const token = uuidv4();
                const encodedPath = encodeURIComponent(destinationPath);
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o${encodedPath}?alt=media&token=${token}`;
                uploadedUrls.push(imageUrl);
            }

            resolve(uploadedUrls);
        } catch (error) {
            console.error(error.message);
            return reject("0");
        }
    });

};
exports.uploadFileProfile = async (req, id, fileType, folder, fileItem) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!fileItem) {
                return reject("0");
            }

            const productFolder = `${folder}/${id}`;
            const typeFolder = `${productFolder}/${fileType}`;

            // Tạo các thư mục nếu chưa tồn tại
            await createFoldersIfNotExist(folder, productFolder, typeFolder);

            // Lưu trữ file vào đúng thư mục
            const destinationPath = `${typeFolder}/${fileItem.originalname}`; // Sử dụng tên gốc của file
            const file = bucket.file(destinationPath);

            await file.save(fileItem.buffer, {
                metadata: { contentType: fileItem.mimetype },
            });

            const token = uuidv4();
            const encodedPath = encodeURIComponent(destinationPath);
            const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

            resolve(fileUrl);
        } catch (e) {
            console.log(e.message);
            reject("0");
        }
    });
};
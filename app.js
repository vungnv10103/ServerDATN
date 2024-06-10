const createError = require("http-errors");
const express = require("express");
require('dotenv').config();
const crypto = require('crypto');
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const apiRouter = require("./routes/api");
const apiRouterV2 = require("./routes/apiv2");
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io')
const { readFileSync } = require("fs");
const { createServer } = require("http");
const admin = require('firebase-admin');
const serviceAccount = require('./serviceaccountkey/datn-789e4-firebase-adminsdk-nbmof-aa2593c4f9.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const httpServer = createServer((req, res) => {
    if (req.url !== "/") {
        res.writeHead(404);
        res.end("Not found");
        return;
    }
    // reload the file every time
    const content = readFileSync(__dirname + "views");
    const length = Buffer.byteLength(content);

    res.writeHead(200, {
        "Content-Type": "text/html",
        "Content-Length": length,
    });
    res.end(content);
});
const session = require('express-session');
const sessionConfig = require('./models/session.config');
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);
app.use("/apiv2", apiRouterV2);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

const ENCRYPTION_KEY = process.env.API_KEY;
const algorithm = process.env.ALGORITHM;
const io = new Server(server, {
    // Socket.IO options
});
io.on("connection", (socket) => {
    console.log(`connect ${socket.id}`);

    socket.on("disconnect", (reason) => {
        console.log(`disconnect ${socket.id} due to ${reason}`);
    });

    // New message
    socket.on('on-chat', data => {
        // console.log(data);
        // return
        const { message, message_type } = data.message;
        // decrypt message
        let messageDecrypted = message;
        if (message.length <= 0) {
            messageDecrypted = message;
        } else {
            const hash = crypto.createHash("sha1");
            hash.update(ENCRYPTION_KEY)
            const digestResult = hash.digest();
            // Chuyển đổi kết quả digest thành Uint8Array
            const uint8Array = new Uint8Array(digestResult);
            // Sử dụng slice từ Uint8Array.prototype
            const keyUint8Array = uint8Array.slice(0, 16);
            // Chuyển đổi kết quả Uint8Array về Buffer nếu cần
            const keyBuffer = Buffer.from(keyUint8Array);
            let textParts = message.split(':');
            let iv = Buffer.from(textParts.shift(), 'hex');
            let encryptedText = Buffer.from(textParts.join(':'), 'hex');
            let decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
            decrypted += decipher.final('utf8');

            messageDecrypted = decrypted;
        }

        let newData = { ...data.message, message: messageDecrypted };
        io.emit('user-chat', newData)
    })

    socket.on('update-chat', data => {
        console.log(`update-chat: ${data}`);
        io.emit('user-update-chat', data)
    })
});

process.on('warning', (warning) => {
    console.log(warning.stack);
});


const post = process.env.PORT || 3000;
// httpServer.listen(3333);
server.listen(post, (req, res) => {
    console.log("connect to port " + post);
});
module.exports = server;

const cookie = require('cookie');

const utils = {
    getCookie: function (req, name) {
        const cookies = cookie.parse(req.headers.cookie || '');
        return cookies[name] || null;
    },

    pushCookie: function (res, name, value) {
        const cookies = cookie.serialize(name, value, {
            httpOnly: true,
        });
        res.setHeader('Set-Cookie', cookies);
    },

    showMessage: function (message) {
        console.log(message);
    },
};

module.exports = utils;
let RemoveCache;
const utils = {

    GetCookie: function(name) {
        const cookies = document.cookie.split("; ");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].split("=");
            if (cookie[0] === name) {
                return decodeURIComponent(cookie[1]);
            }
        }
        return null;
    },

    PushCookie: function (name, value){
        document.cookie = name + "=" + encodeURIComponent(value);
    },

    showMessage: function (message) {
    alert(message)
    },

    DeleteAllCookies: function() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=";
    }
},
    RemoveCache: function (){
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function(event) {
            window.history.pushState(null, null, window.location.href);
        };
    }
};
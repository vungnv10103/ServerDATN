document.addEventListener("DOMContentLoaded", function (){
    const adminBtn = document.getElementById("withAdminButton");
    const employeeBtn = document.getElementById("withEmployeeButton");

    adminBtn.addEventListener("click", function (){
        utils.PushCookie("LoginType", "LoginWithAdmin");
        window.location.assign("/stech.manager/login");
    });

    employeeBtn.addEventListener("click", function (){
        utils.PushCookie("LoginType", "LoginWithEmployee");
        window.location.assign("/stech.manager/login");
    });
});
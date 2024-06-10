

document.addEventListener('DOMContentLoaded', function () {
    const token = utils.GetCookie("token");

    // var myModal = new bootstrap.Modal(document.getElementById('UserModal'));
    // var myModalUp = new bootstrap.Modal(document.getElementById('UpdateUserModal'));
    var myModalUnBan = new bootstrap.Modal(document.getElementById('unbanCusModal'));
    const UnbanButtons = document.querySelectorAll('.unbanCus');


    const logout = document.getElementById("logout");
    logout.addEventListener("click", function () {
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });

    const detailLinks = document.querySelectorAll(".DetailUser");

    document.getElementById('unbanCusBtn').addEventListener('click', function () {
        myModalUnBan.show();
    });
    UnbanButtons.forEach(button => {
        button.addEventListener('click', function () {
            const unbanId = this.getAttribute('data-id');
            document.getElementById('idUnBan').value = unbanId;
            console.log(unbanId);
        });
    });

    detailLinks.forEach(function (detailLink) {
        detailLink.addEventListener("click", function (event) {
            event.preventDefault();
            var userId = this.getAttribute("data-id");
            var encodedUserId = btoa(userId);
            console.log(userId);
            console.log(encodedUserId); // Xuất mã hóa
            window.location.href = "/stech.manager/detail_user?userId=" + encodedUserId;
        });
    });
});
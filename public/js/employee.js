

document.addEventListener('DOMContentLoaded', function () {
    let updateCate = document.querySelectorAll('.EditUser');
    const token = utils.GetCookie("token");
    var myModal = new bootstrap.Modal(document.getElementById('EmployeeModal'));

    var myModalBan = new bootstrap.Modal(document.getElementById('banEmployeeModal'));
    const banButtons = document.querySelectorAll('.banEmployee');
    const detailLinks = document.querySelectorAll(".DetailUser");

    const logout = document.getElementById("logout");
    logout.addEventListener("click", function () {
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });


    document.getElementById('openEmployeeModal').addEventListener('click', function () {
        myModal.show();
    });
    updateCate.forEach(function (button) {
        button.addEventListener('click', function () {
            const employeeId = this.getAttribute('data-id');
            console.log(employeeId)
            getEmployeeByID(employeeId)

        })
    })

    document.getElementById('banEmployeeBtn').addEventListener('click', function () {
        myModalBan.show();
    });
    banButtons.forEach(button => {
        button.addEventListener('click', function () {
            const employeeId = this.getAttribute('data-id');
            document.getElementById('idEmployeeBan').value = employeeId;
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
function displayModalUpdate(dataEmployee) {
    let idEmployee = document.getElementById('idEmployeUp');
    let emailUp = document.getElementById('emailUp');
    let passwordUp = document.getElementById('passwordUp');
    let full_nameUp = document.getElementById('full_nameUp');
    let phone_numberUp = document.getElementById('phone_numberUp');
    let avatarUp = document.getElementById('avatarUp');

    idEmployee.value = dataEmployee._id;
    emailUp.value = dataEmployee.email;
    phone_numberUp.value = dataEmployee.phone_number;
    passwordUp.value = dataEmployee.password;
    full_nameUp.value = dataEmployee.full_name;
    avatarUp.src = dataEmployee.avatar;
    // let imageCate = document.getElementById('imageNew');
    // imageCate.src = dataCate.img;

}
function getEmployeeByID(employeeID) {
    let xhr = new XMLHttpRequest();
    let endPoint = "/stech.manager/get-employee";
    xhr.open('POST', endPoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ idEmployee: employeeID }));

    xhr.onload = function () {
        if (xhr.status === 200) {
            let myData = JSON.parse(xhr.response);
            switch (myData.code) {
                case "GET_SUCCESS":
                    let dataEmployee = myData.dataEmployeeByID
                    displayModalUpdate(dataEmployee)
                    break;

                default:
                    break;
            }
        }
    };
}
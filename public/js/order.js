document.addEventListener('DOMContentLoaded', function(){

    const token = utils.GetCookie("token");
    const Uid = utils.GetCookie("Uid");

    const modalUpdateStatusOrder = new bootstrap.Modal(document.getElementById('UpdateStatusOrderModal'));
    //
    const updateStatusButton = document.querySelectorAll(".updateStatusOrder");
    const btnGetAddress = document.getElementById('btnGetAddress');
    const btnGetImg = document.getElementById('btnGetImg');
    const btnGetTitle = document.getElementById('btnGetTitle');
    //
    const confirmUpdateButton = document.querySelectorAll(".confirmUpdateStatusOrder");
    const buttonConfirm = document.getElementById('buttonConfirm');

    const inputOrderId = document.getElementById('inputOrderId');
    const inputUserId = document.getElementById('inputUserId');
    const inputAddressId = document.getElementById('inputAddressId');
    const inputStatus = document.getElementById('inputStatus');
    const btnValueStatus = document.getElementById('updateOrderButton');
    const logout = document.getElementById("logout");
    logout.addEventListener("click", function (){
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });

    const openDetailOrder = document.querySelectorAll(".detailOrder");
    const loadListOrderByStatus = document.querySelectorAll(".statusButton");

    updateStatusButton.forEach(function (button) {
        button.addEventListener("click", async function () {
            modalUpdateStatusOrder.show();
            const orderId = this.getAttribute("data-id");
            const valueStatus = this.getAttribute("data-status");
            inputStatus.value = valueStatus;
            inputOrderId.value = orderId;

        });
    });
    confirmUpdateButton.forEach(function (button){
        button.addEventListener("click",async function () {
            const valueId = inputOrderId.value;

            const valueStatus = inputStatus.value;
            const formData = {orderId: valueId, employeeId: Uid, status: valueStatus};

            await axios.post("/apiv2/updateStatusOrder", formData, {
            }).then(function (response) {
                console.log(response);
                location.reload();
            }).catch(function (error) {
                console.log(error);
            });
        });
        modalUpdateStatusOrder.hide();
    });

    openDetailOrder.forEach(function(detailLink) {
        detailLink.addEventListener("click", function(event) {
            event.preventDefault();
            var orderId = this.getAttribute("data-id");
            var encodedProductId = btoa(orderId.toString());
            console.log(encodedProductId); // Xuất mã hóa
            window.location.href = "/stech.manager/detail_order?orderId=" + encodedProductId;
        });
    });

    function setCookie(name, value) {
        document.cookie = `${name}=${value}; path=/`;
    }

    loadListOrderByStatus.forEach(function(detailLink) {
        detailLink.addEventListener("click", function(event) {
            event.preventDefault();
            var valueStatus = this.getAttribute("data-status");
            console.log(valueStatus)
            var encodedValueStatus = btoa(valueStatus);
            console.log(encodedValueStatus); // Xuất mã hóa
            setCookie("status", encodedValueStatus)
            window.location.href = "/stech.manager/order";
        });
    });
});
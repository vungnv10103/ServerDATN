document.addEventListener('DOMContentLoaded', function(){

    // const token = utils.GetCookie("token");
    // var modalUpdateStatusOrder = new bootstrap.Modal(document.getElementById('UpdateStatusOrderModal'));
    //
    // const updateStatusButton = document.querySelectorAll(".updateStatusOrder")
    //
    // const confirmUpdateButton = document.getElementById("updateStatusOrder");
    // const openModalUpdate = document.getElementById("updateOrderButton");
    //
    // const statusButtons = document.querySelectorAll('.status-button');

    // statusButtons.forEach(function (button) {
    //     button.addEventListener('click', function () {
    //         const status = this.getAttribute('data-status');
    //         getOrderByStatus(status);
    //         console.log(status);
    //     });
    // });

    // const OrderModel = require("../models/model.order");
    //
    // openModalUpdate.forEach(function (updateButton){
    //     updateButton.addEventListener("click", function () {
    //         modalUpdateStatusOrder.show();
    //         const orderId = this.getAttribute("data-id");
    //         let order = new OrderModel.modelOrder.findById(orderId);
    //         let statusNew = "";
    //         if(order.status === "WaitConfirm"){
    //             statusNew = "WaitingGet";
    //         } else if(order.status === "WaitingGet"){
    //             statusNew = "InTransit";
    //         } else if(order.status === "Intransit"){
    //             statusNew = "PayComplete";
    //         }
    //         const dataUpdate = new FormData();
    //         dataUpdate.append("orderId", orderId);
    //         dataUpdate.append("userId", order.userId);
    //         dataUpdate.append("product", order.product);
    //         dataUpdate.append("address", order.addressId);
    //         dataUpdate.append("status", statusNew);
    //
    //         updateStatusButton.forEach(function (editCateBtn) {
    //             editCateBtn.addEventListener("click", function () {
    //                 const orderId = this.getAttribute("data-id");
    //                 console.log(orderId);
    //
    //                 const dateCategorYSelected = {
    //                     categoryId: cateId
    //                 };
    //
    //                 axios.post("/api/editOrder", dateCategorYSelected, {
    //                     headers: {
    //                         'Authorization': token
    //                     }
    //                 }).then(function (response) {
    //                     let jsonData = response.data.category
    //                     idCateInput.value = jsonData._id
    //                     imgCateUpdatePreview.src = jsonData.img
    //                     nameCateInput.value = jsonData.title
    //                     dateCateInput.value = jsonData.date
    //                 })
    //                     .catch(function (error) {
    //                         console.log(error);
    //                     });
    //             });
    //         });
    //     })
    // });
});
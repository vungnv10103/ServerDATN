document.addEventListener('DOMContentLoaded', function () {
    const token = utils.GetCookie("token");
    //Modal
    const modalCreateVoucher = new bootstrap.Modal(document.getElementById('CreateVoucherModal'));
    const modalUpdateVoucher = new bootstrap.Modal(document.getElementById('UpdateVoucherModal'));
    const modalDeleteVoucher = new bootstrap.Modal(document.getElementById('DeleteVoucherModal'));

    //Button openModal
    const openModalCreate = document.getElementById('openModalCreateVoucher');
    const openModalUpdate = document.querySelectorAll(".openModalUpdateVoucher");
    //const openModalDelete = document.querySelectorAll(".openModalDeleteVoucher");
    const logout = document.getElementById("logout");
    logout.addEventListener("click", function (){
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });


    //Create
    openModalCreate.addEventListener('click', function () {
        modalCreateVoucher.show();
    });


    //DELETE
    // openModalDelete.forEach(function (button) {
    //     button.addEventListener('click', function () {
    //
    //         const voucherId = this.getAttribute('data-id');
    //         document.getElementById('idVoucherDelete').value = voucherId;
    //         modalDeleteVoucher.show();
    //     })
    // })

    //Update
    openModalUpdate.forEach(function (button){
        button.addEventListener('click', function (){
            const voucherId = this.getAttribute('data-id');
            const valueTitle = this.getAttribute('data-title');
            const valueContent = this.getAttribute('data-content');
            const valuePrice = this.getAttribute('data-price');
            const valueFromDate = this.getAttribute('data-fromDate');
            const valueToDate = this.getAttribute('data-toDate');

            document.getElementById('idVoucherUpdate').value = voucherId;
            document.getElementById('titleUp').value = valueTitle;
            document.getElementById('contentUp').value = valueContent;
            document.getElementById('priceUp').value = valuePrice;
            document.getElementById('fromDateUp').value = convertDateTimeFormat(valueFromDate);
            document.getElementById('toDateUp').value = convertDateTimeFormat(valueToDate);
            modalUpdateVoucher.show();

        })
    })

    function convertDateTimeFormat(dateTimeString) {
        var parts = dateTimeString.split('-');

        var year = parts[0];
        var month = parts[1];
        var day = parts[2];
        var time = parts[3];

        // Định dạng lại theo "YYYY-MM-DDTHH:mm"
        var formattedDateTime = `${year}-${month}-${day}T${time}`;

        return formattedDateTime;
    }
})
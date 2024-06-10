document.addEventListener('DOMContentLoaded', function () {
    const token = utils.GetCookie("token");
    //Modal
    const modalCreateNotification = new bootstrap.Modal(document.getElementById('CreateNotificationModal'));
    const modalUpdateNotification = new bootstrap.Modal(document.getElementById('UpdateNotificationModal'));

    //Button openModal
    const openModalCreate = document.getElementById('openModalCreateNotifi');
    const openModalUpdate = document.querySelectorAll(".openModalUpdateNotifi");
    // const openModalDelete = document.querySelectorAll(".openModalDeleteNotifi");

    const logout = document.getElementById("logout");
    logout.addEventListener("click", function (){
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });
    //Create Notification
    openModalCreate.addEventListener('click', function (){
        modalCreateNotification.show();
    })


    //Update Notification
    openModalUpdate.forEach(function (button) {
        button.addEventListener('click', function (){
            const notifiId = this.getAttribute('data-id');
            const valueContent = this.getAttribute('data-content');
            const valueTitle = this.getAttribute('data-title');

            document.getElementById('idUpdate').value = notifiId;
            document.getElementById('upTitle').value = valueTitle;
            document.getElementById('upContent').value = valueContent;

            modalUpdateNotification.show();

        })
    })

    //Delete Notification
    // openModalDelete.forEach(function (button){
    //     button.addEventListener('click', function (){
    //         const notifiId = this.getAttribute('data-id');
    //         document.getElementById('idNotifiDelete').value = notifiId;
    //         modalDeleteNotification.show();
    //     })
    // })
})
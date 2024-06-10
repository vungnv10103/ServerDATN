document.addEventListener('DOMContentLoaded', function () {
    // get token
    const token = utils.GetCookie("token");
    // Modal
    const CreBannerModal = new bootstrap.Modal(document.getElementById('CreBannerModal'));
    const UpBannerModal = new bootstrap.Modal(document.getElementById('UpBannerModal'));
    const DelBannerModal = new bootstrap.Modal(document.getElementById('DelBannerModal'));
    // Button call api
    const ConfirmCreBanner = document.getElementById("ConfirmCreBanner");
    const ConfirmUpdateBanner = document.getElementById("ConfirmUpBanner");
    const ConfirmDelBanner = document.getElementById("ConfirmDelBanner");
    // Button call modal
    const DeleteBanner = document.querySelectorAll(".DeleteBanner");
    const CreateBanner = document.getElementById("CreateBanner");
    console.log(CreateBanner);
    const UpdateBanner = document.querySelectorAll(".UpdateBanner");
    const logout = document.getElementById("logout");
    logout.addEventListener("click", function (){
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });

    CreateBanner.addEventListener("click", function (e){
        CreBannerModal.show();
    });

    DeleteBanner.forEach(function (button) {
        button.addEventListener('click', function () {
            const bannerId = this.getAttribute('data-id');
            document.getElementById('idBannerDelete').value = bannerId;
            DelBannerModal.show();
        })
    });
    UpdateBanner.forEach(function (button) {
        button.addEventListener('click', function (){
            const bannerId = this.getAttribute('data-id');
            document.getElementById('idUpdate').value = bannerId;
            UpBannerModal.show();
        })
    });
});

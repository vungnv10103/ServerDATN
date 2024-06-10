document.addEventListener('DOMContentLoaded', function (){
    const token = utils.GetCookie("token");
    const id = utils.GetCookie("Uid");
    //Modal
    const ConfirmModal = new bootstrap.Modal(document.getElementById('ConfirmModal'));
    //Button open modal
    const openModalConfirm = document.getElementById('openModalConfirm');
    //Button Confirm
    const buttonConfirm = document.getElementById('buttonConfirm');
    const idCartProduct = document.querySelectorAll('.idCartProduct');

    let arrIdCart = [];

    idCartProduct.forEach(function (idCart) {
        arrIdCart.push(idCart.getAttribute('data_id'))
    })

    openModalConfirm.addEventListener('click', function (){
        ConfirmModal.show();
    })
    const logout = document.getElementById("logout");
    logout.addEventListener("click", function (){
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });
    buttonConfirm.addEventListener('click', function (){
        const valueName = document.getElementById('full_name').value;
        const valuePhone = document.getElementById('phone_number').value;
        const valueAddress = document.getElementById('address').value;

        const valueProduct = document.getElementById('product').value;

        const data = {guest_name: valueName,
            guest_phoneNumber: valuePhone,
            guest_address: valueAddress,
            list_order: valueProduct,
            arrIdCart: arrIdCart,
            employee_id: id,
            status: 'PayComplete',
            userId: id
        }

        fetch('http://localhost:3000/apiv2/createOrderGuest', {
            headers: {
                'Authorization': token,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }).then((response) => {
            console.log(response)
            const dataToInvoice = {
                guestName: valueName,
                guestPhone: valuePhone,
                guestAddress: valueAddress,
                product: JSON.parse(valueProduct),
            }

            document.cookie = `dataToInvoice=${encodeURIComponent(JSON.stringify(dataToInvoice))}`;

            window.location.href = "/stech.manager/invoice";
        }).catch((error) => {
            console.error("Error:", error);
        });
    })

})
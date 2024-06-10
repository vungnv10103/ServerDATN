document.addEventListener('DOMContentLoaded', function () {
    const Uid = utils.GetCookie("Uid");
    const token = utils.GetCookie("token");
    const checkboxes = document.querySelectorAll('.product-checkbox');
    const inputQuan = document.querySelectorAll('.quantity-checkbox');
    const totalDisplay = document.getElementById('total-display');  // Thêm một phần tử để hiển thị tổng giá
    const totalQuan = document.querySelectorAll('.total-checkbox');
    const saveButtons = document.querySelectorAll('.save-btn');
    const deleteCCartPro = document.querySelectorAll('.deleteCartPro');
    const deleteCart = document.getElementById("deleteCart");
    const DeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteCart"));
    const confirmDelete =  document.getElementById("confirmDelete");
    const detailLink =  document.getElementById("goOrder");
    // const inputQuan = document.getElementById('')
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTotal);
    });
    inputQuan.forEach(quantity => {
        quantity.addEventListener('input', updateTotalQuantity);
    });
    saveButtons.forEach(saveBtn => {
        saveBtn.addEventListener('click', saveQuantity);
    });
    const logout = document.getElementById("logout");
    logout.addEventListener("click", function (){
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });
    function updateTotal() {
        let total = 0;

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const price = parseFloat(checkbox.dataset.price);
                const quantity = parseInt(checkbox.dataset.quantity);
                total += price * quantity;
            }
        });
        // Hiển thị tổng giá
        totalDisplay.innerText = `${Intl.NumberFormat('vi-VN').format(total)} VND`;
    }
    document.getElementById('confirmDelete').addEventListener('click', async function () {
        const cartId = this.getAttribute('data-id');
    });

    deleteCCartPro.forEach(function (DeleteProduct){
        DeleteProduct.addEventListener("click", function() {
            DeleteModal.show();
            const cartId = this.getAttribute("data-id")
            // const productId = this.dataset.productid;
            console.log(cartId)
            confirmDelete.value = cartId;
            // confirmDelete.addEventListener("click", async function () {
            //     console.log("da click")
            // });
        });
    });

    function updateTotalQuantity() {
        inputQuan.forEach(item => {
            item.addEventListener("click",  () =>{
                let currentQuantity = parseInt(item.value);
                let price = parseInt(item.dataset.price);
                let cartId = item.dataset.id;
                totalQuan.forEach(itemQuan =>{
                    if (cartId === itemQuan.dataset.id){
                        itemQuan.innerText = price * currentQuantity
                    }
                })

                console.log(cartId ,currentQuantity)
                this.blur();
            })
        });
    }

    function setCookie(name, value) {
        document.cookie = `${name}=${value}; path=/`;
    }
    async function saveQuantity() {
        const productId = this.dataset.productid;
        const cartId = this.dataset.id;
        const caculation = parseInt(document.getElementById('caculation').value);

        const requestData = {
            userId: Uid,
            productId: productId,
            quantity: caculation,
        };
        const headers = {
            Authorization: token,
            'Content-Type': 'application/json',
        };

        try {
            // Gửi yêu cầu lưu vào MongoDB
            const response = await axios.post(`/apiv2/editCartV2/${cartId}`, requestData, { headers });
            console.log(response.data);
            alert(response.data.message);

            // Sau khi lưu thành công, cập nhật lại trang hoặc làm bất cứ điều gì phù hợp với ứng dụng của bạn
            window.location.reload();
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }


    document.getElementById('goOrder').addEventListener('click', function (){
        var selectedProducts = [];
        checkboxes.forEach(function (checkbox){
            if (checkbox.checked){
                var productData = JSON.parse(checkbox.getAttribute('data-product'));
                selectedProducts.push(productData);
            }
        })

        document.cookie = 'selectedProducts=' + encodeURIComponent(JSON.stringify(selectedProducts));
        window.location.href = '/stech.manager/pay';
    })

})
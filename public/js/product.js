document.addEventListener('DOMContentLoaded', function () {
    // get token
    const Uid = utils.GetCookie("Uid");
    const token = utils.GetCookie("token");
    const detailLinks = document.querySelectorAll(".DetailPro");
    const openModalDelete = document.querySelectorAll(".openModalDeleteProduct");
    const openModalUnDelete = document.querySelectorAll(".openModalUnDeleteProduct");
    const detailLink = document.getElementById("Detail");

    //
    const color = document.getElementById("colorDropdown");
    const ram = document.getElementById("ramDropdown");
    const rom = document.getElementById("romDropdown");
    const addimg = document.getElementById('Addimg');
    const addtitle = document.getElementById("Addtitle");
    const addquantity = document.getElementById("Addquantity");
    const productIdv2 = document.getElementById("productId");
    //
    const logout = document.getElementById("logout");
    logout.addEventListener("click", function (){
        window.location.assign("/stech.manager/login");
        utils.DeleteAllCookies();
    });
    // Modal
    const DelProModal = new bootstrap.Modal(document.getElementById('DeleteProductModal'));
    const unDelProModal = new bootstrap.Modal(document.getElementById('unDeleteProductModal'));
    const AddCartModal = new bootstrap.Modal(document.getElementById('AddCartModal'));
    // Button call api
    const ConfirmCrePro = document.getElementById("ConfirmCrePro");
    const ConfirmAddCartPro = document.getElementById("ConfirmAddCartPro");
    // Button call modal


    const AddCartPro = document.querySelectorAll(".AddCartPro");
    const OpenUpdateProduct = document.querySelectorAll(".OpenUpdateProduct");
    let quantityRequest ;

    //DELETE
    openModalDelete.forEach(function (button) {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            console.log(productId)
            document.getElementById('idProductDelete').value = productId;
            DelProModal.show();

        })
    })
    openModalUnDelete.forEach(function (button) {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            console.log(productId)
            document.getElementById('idProductUnDelete').value = productId;
            unDelProModal.show();

        })
    })



    AddCartPro.forEach(function (AddToCart){
        AddToCart.addEventListener("click", function (){
            let product = this.getAttribute("data-id");
            let data_product = JSON.parse(product)
            const total = document.getElementById('total');

            quantityRequest = 1;

            addimg.src =data_product.img_cover;
            addtitle.value = data_product.name;

            ram.value= data_product.ram;
            rom.value = data_product.rom;
            color.value = data_product.color;
            totalData = data_product.price;
            total.value = totalData;
            total.innerText = totalData.toString();
            productIdv2.value = data_product._id;

            addquantity.addEventListener("change", function (){
                totalData = (Number(data_product.price)) * Number(addquantity.value);
                total.innerText = totalData.toString();
                quantityRequest = addquantity.value.toString();
            })



        })
    });

    // function setCookie(name, value) {
    //     document.cookie = `${name}=${value}; path=/`;
    // }
    //     setCookie("productId", productId);
    detailLinks.forEach(function(detailLink) {
        detailLink.addEventListener("click", function(event) {
            event.preventDefault();
            var productId = this.getAttribute("data-id");
            var encodedProductId = btoa(productId);
            console.log(encodedProductId); // Xuất mã hóa
            window.location.href = "/stech.manager/detail_product?productId=" + encodedProductId;

        });
    });

    OpenUpdateProduct.forEach(function (button){
        button.addEventListener('click', function (event){
            event.preventDefault();
            var  productId = this.getAttribute("data-id");
            document.cookie = 'productId=' + encodeURIComponent(JSON.stringify(productId));
            window.location.href = "/stech.manager/edit_product_action";
        })
    })
});
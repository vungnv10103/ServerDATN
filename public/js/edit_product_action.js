document.addEventListener('DOMContentLoaded', function (){

    const categoryDropdown = document.getElementById('categoryDropdown');
    const dropdown = document.querySelectorAll('.dropdown_item');
    const categorykey = document.getElementById('keyword');


    //
    const product_avatar = document.getElementById('product_avatar');
    const img_cover = document.getElementById('img_cover');
    const video = document.getElementById('video');
    const list_img = document.getElementById('list_img');
    //
    const save_option = document.getElementById('save_option');
    let idProduct = document.getElementById('idProduct').textContent+"";

    console.log(idProduct)



    dropdown.forEach(function (itemDropDown){
        itemDropDown.addEventListener('click',function () {
            let cateId = itemDropDown.getAttribute('data-id')
            categorykey.value = cateId;
            categoryDropdown.style.display = 'none';
        })
    })
    categorykey.addEventListener('click', function () {
        categoryDropdown.style.display = 'block';
    });


    img_cover.addEventListener("change", function (event) {
        product_avatar.src = URL.createObjectURL(event.target.files[0]);
        product_avatar.onload = function () {
            URL.revokeObjectURL(product_avatar.src);
        };
    });

    video.addEventListener("change", function (event) {
        let file = event.target.files[0];
        let fileURL = URL.createObjectURL(file);
        video_product.src = fileURL;
    });

    let swiperWrapper = document.querySelector('.swiper-wrapper');
    list_img.addEventListener('change', function (event) {
        let files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fileURL = URL.createObjectURL(file);
            let imageSlide = document.createElement('div');
            imageSlide.className = 'swiper-slide';
            let imagePreview = document.createElement('img');
            imagePreview.src = fileURL;
            imagePreview.height = 140;
            imagePreview.width = 240;
            imageSlide.appendChild(imagePreview);
            swiperWrapper.appendChild(imageSlide);
        }
        let swiper = new Swiper('.swiper-container', {
            slidesPerView: 'auto',
            grabCursor: true,
            centeredSlides: true,
            loop: true,
            allowTouchMove: true,
            spaceBetween: 0,
        });
    });

})
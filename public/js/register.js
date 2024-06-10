document.addEventListener("DOMContentLoaded", function (){
    const registerButton = document.getElementById("registerButton");
    // create function
    async function register(full_name, phone_number, email, password) {
        try {
            const response = await axios.post('/api/registerUser', {
                full_name: full_name,
                phone_number: phone_number,
                email: email,
                password: password
            });
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    function validFormSignUp(full_name, phone_number, email, password) {
        const phonePatternSignUp = /^(0|\+84)[3789][0-9]{8}$/;
        const emailPatternSignUp = /^[A-Za-z0-9+_.-]+@(.+)$/;

        const patternEmail = new RegExp(emailPatternSignUp);
        const patternPhone = new RegExp(phonePatternSignUp);

        const isEmail = patternEmail.test(email);
        const isPhone = patternPhone.test(phone_number);

        if (full_name.trim().length === 0) {
            alert('Please enter name');
            return false;
        }
        if (password.trim().length === 0) {
            alert('Please enter password');
            return false;
        }
        if (!isPhone) {
            alert('Wrong  phone number');
            return false;
        }
        if (!isEmail) {
            alert('Wrong email');
            return false;
        }
        return true;
    }


    registerButton.addEventListener("click",function () {
        const full_name = document.getElementById("full_name").value;
        const phone_number = document.getElementById("phone_number").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        if (validFormSignUp(full_name, phone_number, email, password)) {
        register(full_name, phone_number, email, password).then(data => {
                if (data.code === 1){
                    const Uid = data.id;
                    document.cookie = "Uid=" + encodeURIComponent(Uid);
                    utils.PushCookie("Uid", Uid);
                    utils.PushCookie("typeVerify", "signup");
                    window.location.assign('/stech.manager/verify');
                }else {
                    utils.showMessage(data.message);
                }
            }).catch(error => {
                console.error('Login error:', error);
            });
        }
    });
});
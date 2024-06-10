const axios = require('axios');

// Thay thế các giá trị sau bằng thông tin tài khoản InfoBip của bạn
const apiKey = 'df3b11a996831dee0ed12cc93bbc0532-32bd11ad-9a6c-4e2c-8fe9-330ee305b96a';
const baseUrl = 'https://api.infobip.com/sms/1/text/advanced';
const to = '84373360624'; // Số điện thoại nhận OTP

// Tạo một mã OTP ngẫu nhiên (ví dụ: 6 chữ số)
const otp = Math.floor(100000 + Math.random() * 900000);

// Tạo nội dung tin nhắn OTP
const text = `Mã OTP của bạn là: ${otp}`;

// Định cấu hình header cho yêu cầu
const headers = {
    'Authorization': `App ${apiKey}`,
    'Content-Type': 'application/json',
};

// Tạo payload cho tin nhắn
const payload = {
    messages: [
        {
            destinations: [{ to }],
            text,
        },
    ],
};

// Gửi tin nhắn OTP bằng InfoBip REST API
axios.post(baseUrl, payload, { headers })
    .then((response) => {
        console.log('Tin nhắn đã được gửi:', response.data);
    })
    .catch((error) => {
        console.error('Lỗi khi gửi tin nhắn:', error);
    });

// invoice.js

function getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    var yyyy = today.getFullYear();

    return dd + ' ' + getMonthName(mm) + ' ' + yyyy;
}

function getMonthName(month) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[parseInt(month, 10) - 1];
}

document.addEventListener('DOMContentLoaded', function () {
    var currentDate = getCurrentDate();
    var dateElement = document.getElementById('dateTime');
    if (dateElement) {
        dateElement.textContent = 'Date: ' + currentDate;
    } else {
        console.error('Could not find the date element in the DOM.');
    }
});

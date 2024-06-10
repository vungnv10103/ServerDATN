const db = require("../models/database");
const status = "Not verified";
const employeeSchema = db.mongoose.Schema({
    full_name: {type: String, required: true},
    avatar: {type: String, required: false},
    email: {type: String, required: true},
    password: {type: String, required: true},
    phone_number: {type: String, required: true},
    status: {type: String, required: true, default: status},
    create_time: {type: String, required: true},
    otp: {type: String, required: false},
}, {
    collection: "Employees"
});
const employeeModel = db.mongoose.model("employees", employeeSchema);
module.exports = {employeeModel};
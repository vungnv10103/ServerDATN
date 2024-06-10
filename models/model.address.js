
const mongoose = require('./database');
const addressSchema = mongoose.mongoose.Schema({
    name: {type: String, required: true},
    city: {type: String, required: true},
    street:{type: String, required: true},
    phone_number: {type: String, required: true},
    date:{type: String, required: true},
}, {
    collection: "Address"
});
const modelAddress = mongoose.mongoose.model("address", addressSchema);
module.exports = {modelAddress}
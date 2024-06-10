const mongoose = require("mongoose");
require("dotenv").config();
mongoose
  .connect(process.env.URL_DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("connected to DB."))
  .catch((err) => console.log(err));
module.exports = { mongoose };

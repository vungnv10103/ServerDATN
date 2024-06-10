const db = require("../models/database");
const categorySchema = db.mongoose.Schema(
  {
    name: { type: String, required: true },
    img: { type: String, required: true },
    create_time: { type: String, required: true },
  },
  {
    collection: "Categories",
  }
);
const categoryModel = db.mongoose.model("categories", categorySchema);
module.exports = { categoryModel };

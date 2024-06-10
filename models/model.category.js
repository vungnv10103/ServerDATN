const database = require("./database");
const categorySchema = database.mongoose.Schema(
  {
    title: { type: String, required: true },
    img: { type: String, required: true },
    date: { type: String, required: true },
  },
  {
    collection: "Category",
  }
);
const categoryModel = database.mongoose.model("category", categorySchema);
module.exports = { categoryModel };

const CategoryModel = require("../modelsv2/model.category");
exports.getCategory = async (req, res) => {
    try {
        let category = await CategoryModel.categoryModel.find();
        return res.send({ message: "get category success", category: category, code: 1 });
    } catch (e) {
        console.log(e.message);
        return res.send({ message: e.message.toString(), code: 0 });
    }
}
const Feedback = require("../models/model.feedback");
const Oder = require("../models/model.order");
const moment = require("moment-timezone");
class FeedBackCtrl {
  async addFeedBack(req, res) {
    const { userId, productId, rating, comment, nameUser, avtUser } = req.body;
    let date = new Date();
    let specificTimeZone = 'Asia/Ha_Noi';
    let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
    if (userId == null) {
      return res.send({ message: "userId is required", code: 0 });
    }
    if (productId == null) {
      return res.send({ message: "productId is required", code: 0 });
    }
    if (comment == null) {
      return res.send({ message: "comment is required", code: 0 });
    }
    if (nameUser == null) {
      return res.send({ message: "nameUser is required", code: 0 });
    }

    try {
      var myOder = await Oder.modelOrder.find({ userId });
      var listProductId = [];

      listProductId = myOder.flatMap((order) =>
        order.product.map((product) => product.productId)
      );
      const index = listProductId.findIndex((id) => id == productId);
      if (index == -1) {
        return res.send({
          message: "Bạn không thể để lại FeedBack khi chưa mua hàng",
          code: 0,
        });
      } else {
        const objFeedBack = new Feedback.modelFeedback(req.body);
        objFeedBack.date = date_time;
        objFeedBack.rating = rating ? rating : Number(5);
        await objFeedBack.save();
        return res.send({
          message: "FeedBack thành công",
          code: 1,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.send({ message: error.message.toString(), code: 0 });
    }
  }
  async getFeedBackByProductId(req, res) {
    const { productId } = req.body;
    try {
      const listFeedBack = await Feedback.modelFeedback
        .find({ productId })
        .limit(10);
      if (listFeedBack) {
        return res.send({
          listFeedBack: listFeedBack,
          message: "Get list FeedBack success",
          code: 1,
        });
      } else {
        return res.send({
          message: "List FeedBack is empty",
          code: 0,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.send({ message: e.message.toString(), code: 0 });
    }
  }
  async getAllFeedBackByProductId(req, res) {
    const { productId } = req.body;
    try {
      const listFeedBack = await Feedback.modelFeedback.find({ productId });
      if (listFeedBack) {
        return res.send({
          listFeedBack: listFeedBack,
          message: "Get list FeedBack success",
          code: 1,
        });
      } else {
        return res.send({
          message: "List FeedBack is empty",
          code: 0,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.send({ message: e.message.toString(), code: 0 });
    }
  }
}
module.exports = new FeedBackCtrl();

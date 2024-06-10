const FeedBack = require("../modelsv2/model.feedbackV2");
const moment = require("moment-timezone");
exports.addFeedback = async (req, res) => {
  const { customer_id, product_id, rating, comment } = req.body;
  let date = new Date();
  let specificTimeZone = 'Asia/Ha_Noi';
  let date_time = moment(date).tz(specificTimeZone).format("YYYY-MM-DD-HH:mm:ss")
  if (customer_id == null) {
    return res.send({ message: "customer_id is required", code: 0 });
  }
  if (product_id == null) {
    return res.send({ message: "product_id is required", code: 0 });
  }
  if (comment == null) {
    return res.send({ message: "comment is required", code: 0 });
  }
  if (rating == null) {
    return res.send({ message: "rating is required", code: 0 });
  }
  try {
    const myFeedBack = FeedBack.feedBackModel();
    myFeedBack.customer_id = customer_id;
    myFeedBack.product_id = product_id;
    myFeedBack.rating = rating;
    myFeedBack.comment = comment;
    myFeedBack.create_time = date_time;
    await myFeedBack.save();
    return res.send({
      message: "FeedBack thành công",
      code: 1,
    });
  } catch (error) {
    console.log(error.message);
    return res.send({ message: error.message.toString(), code: 0 });
  }
};
exports.getFeedBackByProductId = async (req, res) => {
  const { product_id } = req.body;
  if (product_id == null) {
    return res.send({ message: "product_id is required", code: 0 });
  }
  try {
    const listFeedBack = await FeedBack.feedBackModel
      .find({ product_id })
      .limit(10)
      .populate("customer_id")
      .sort({ create_time: -1 });
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
};
exports.getAllFeedBackByProductId = async (req, res) => {
  const { product_id } = req.body;
  if (product_id == null) {
    return res.send({ message: "product_id is required", code: 0 });
  }
  try {
    const listFeedBack = await FeedBack.feedBackModel
      .find({ product_id })
      .limit(10)
      .populate("customer_id")
      .sort({ create_time: -1 });
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
};

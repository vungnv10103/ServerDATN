const BannerModel = require("../modelsv2/model.banner");

exports.getLisBanner = async (req, res) => {
    try {
        let banner = await BannerModel.bannerModel.find();
        return res.send({message: "get list banner success", code: 1, banner: banner});
    } catch (e) {
        console.log(e)
        return res.send({message: e.message.toString(), code: 0});
    }
}
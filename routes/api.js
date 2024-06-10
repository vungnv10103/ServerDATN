const express = require("express");
const router = express.Router();
const Middleware = require("../middleware/middleware");
const ApiBanner = require("../controllers/api.banner");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
router.post(
  "/addBanner",
  Middleware.authorizationToken,
  upload.single("file"),
  ApiBanner.addBanner
);
router.post(
  "/editBanner",
  Middleware.authorizationToken,
  upload.single("file"),
  ApiBanner.editBanner
);
router.post(
  "/deleteBanner",
  Middleware.authorizationToken,
  upload.single("file"),
  ApiBanner.deleteBanner
);
router.post(
  "/getListBanner",
  Middleware.authorizationToken,
  upload.single("file"),
  ApiBanner.getLisBanner
);
router.post(
  "/getBannerById",
  Middleware.authorizationToken,
  upload.single("file"),
  ApiBanner.getBannerById
);
module.exports = router;

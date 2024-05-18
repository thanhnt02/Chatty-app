const express = require("express");
const {
  upload,
} = require("../controllers/fileControllers");

const { handleUpload, handleUploadSingle  } = require("../middleware/multer");

const router = express.Router();

router.route("/").post(handleUploadSingle, upload);

module.exports = router;

const express = require("express");
const {
  allMessages,
  sendMessage,
  markMessageAsSeen
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//call middleware auth, sau đó mới gọi allMessages
router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/:messageId/seen").put(protect, markMessageAsSeen); //Seen by
module.exports = router;

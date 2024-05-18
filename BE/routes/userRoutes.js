const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  checkExistUser,
  updateUser,
  verifyUser,
} = require("../controllers/userControllers");

const { addFriend, unFriend, allFriends, rejectFriendRequest, acceptFriendRequest, blockUser } = require("../controllers/friendControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/block").post(protect, blockUser);
router.route("/:email").put( checkExistUser);
router.route("/allfriend/:userId").get(allFriends);

router.route("/").post(registerUser);
router.route("/update").post(updateUser);
router.route("/verify/:token").get(verifyUser);

router.post("/login", authUser);
router.route("/rejectfriend").post(protect, rejectFriendRequest); //API reject friend request
router.route("/acceptfriend").post(protect, acceptFriendRequest);
router.route("/addfriend").post(protect, addFriend); //API add friend request
router.route("/unfriend").post(protect, unFriend); //API unfriend


module.exports = router;

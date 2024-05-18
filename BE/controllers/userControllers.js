const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../config/email-config");
const dotenv = require("dotenv");
dotenv.config();

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public

// Hàm allUsers dùng cho search user, nó lấy keyword từ request,
// /api/user?search=, nếu ko tìm thấy sẽ trả về rỗng
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
          { phoneNumber: { $regex: req.query.search, $options: "i" } },
          { university: { $regex: req.query.search, $options: "i" } },
          { residence: { $regex: req.query.search, $options: "i" } },
          { workplace: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Hãy điền đầy đủ thông tin");
  }

  const userExists = await User.findOne({ email });
  // console.log(userExists);
  if (userExists) {
    res.status(400);
    throw new Error("Email đã tồn tại");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    // generate token
    const token = generateToken(user.email);
    const from = process.env.EMAIL,
      to = email,
      subject = "Xác thực tài khoản",
      text = "",
      html = `<a href='${process.env.MAIL_VERIFY_URL}/api/user/verify/${token}' target='_blank' '>Xác thực tài khoản</a>`;

    // sending verification to user email
    sendMail(from, to, subject, text, html);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      // token: generateToken(user._id),
      isVerified: user.isVerified,
    });
  } else {
    res.status(400);
    throw new Error("Không tìm thấy Email");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    // if(!user.isVerified) res.send({result: "failed", message: "User is not verified. Check your email to verify your account"})
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
      isVerified: user.isVerified,
    });
  } else {
    res.status(401);
    throw new Error("Email hoặc mật khẩu không đúng");
  }
});

//@description     Check if user is existed and update pic
//@route           PUT /api/user/:email
//@access          Public
const checkExistUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { pic } = req.body;
  const user = await User.findOne({ email });
  user.pic = pic;
  await user.save();
  if (user) {
    res.send({
      result: "okie",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      },
    });
  } else {
    res.send({ result: "failed" });
  }
});

//@description     update a user
//@route           POST /api/user/update
//@access          Public
const updateUser = asyncHandler(async (req, res) => {
  const { name, phoneNumber, university, residence, workplace, pic, _id } =
    req.body;

  // Check if phone number already exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser && existingUser._id.toString() !== _id) {
    res.status(400).send({ message: "Số điện thoại đã tồn tại" });
    return;
  }

  // Find the user document
  let user = await User.findById(_id);
  if (!user) {
    res.status(404).send({ message: "Không tìm thấy Email" });
    return;
  }

  // Update user fields if provided
  if (name) user.name = name;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (university) user.university = university;
  if (residence) user.residence = residence;
  if (workplace) user.workplace = workplace;
  if (pic) user.pic = pic;
  console.log(user);
  // Save the updated user document
  await user.save();

  // Send response
  res.send({
    result: "okie",
    user: {
      name: user.name,
      phoneNumber: user.phoneNumber,
      university: user.university,
      residence: user.residence,
      workplace: user.workplace,
      pic: user.pic,
    },
    message: "Cập nhật thành công",
  });
});

/** Verify User Account */
const verifyUser = async (req, res) => {
  const token = req.params.token;
  // verifying user token
  let decoded = jwt.verify(token, process.env.JWT_SECRET);
  let { id } = decoded;
  console.log(decoded);
  // Sử dụng id đã giải mã từ code trên, tìm xem user id có tồn tại không
  let user = await User.findOne({ email: id });
  if (user) {
    user.isVerified = true;
    await user.save();
    res.send({ result: "okie", message: "Xác thực thành công" });
  } else {
    res.send({ result: "failed", message: "Xác thực không thành công" });
  }
};
module.exports = {
  allUsers,
  registerUser,
  authUser,
  checkExistUser,
  updateUser,
  verifyUser,
};

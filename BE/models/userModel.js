const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String"},
    phoneNumber: { type: "String"},
    university: { type: "String"},
    residence: { type: "String"},
    workplace: { type: "String"},
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    friends: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" }],
    blockUsers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" }],
    requested: [{ // Danh sách người đã gửi lời mời đi
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    friendRequests: [{ // Danh sách lời mời mà người khác gửi cho mình
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  { timestaps: true }
);

//SO sánh pw đã nhập với pw hiện tại trong DB, sử dụng bcrypt
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Mã hóa pw trước khi lưu vào DB
userSchema.pre("save", async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

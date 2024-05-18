const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    // kiểm tra xem request header có chứa mã thông báo và định dạng "Bearer" không
    // Lấy mã thông báo từ header và giải mã để lấy thông tin người dùng
    // Xác thực người dùng và tiếp tục xử lý
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Nếu mã thông báo hợp lệ, nó tiến hành giải mã và xác thực người 
      // dùng bằng cách truy vấn cơ sở dữ liệu để tìm người dùng có ID tương ứng 
      // với mã thông báo
      token = req.headers.authorization.split(" ")[1]; //Tách chuỗi thành mảng,
      // lấy phần tử thứ 2 trong mảng tức là token, bỏ chữ Barear

      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Sử dụng id đã giải mã từ code trên, tìm xem user id có tồn tại không
      req.user = await User.findById(decoded.id);
      next(); // Sau khi xác thực xong gọi hàm next()
    } catch (error) {
      res.status(401);
      console.log(error)
      console.log("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };

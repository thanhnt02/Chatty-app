const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, type , chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    type: type,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const markMessageAsSeen = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }

    if (!message.seenBy.includes(req.user._id)) {
      message.seenBy.push(req.user._id); // Thêm người dùng vào danh sách seenBy
      await message.save(); // Lưu lại tin nhắn đã được đánh dấu

      // Gửi thông báo đánh dấu đã xem đến người gửi hoặc thông báo tương tự
      // tùy thuộc vào yêu cầu của bạn

      // Gửi thông báo đánh dấu đã xem đến người gửi
      // const sender = await User.findById(message.sender);
      // sender.sendNotification('message_seen', { messageId });
    }

    res.json({ message: "Message marked as seen" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage, markMessageAsSeen };

const User = require("./userModel")
const Message = require("./messageModel")
const Chat = require("./chatModel")
const connectDB = require("../config/db");

connectDB()
User.createCollection().then(function (collection) {
    console.log('Collection "User" is created!');
});
Message.createCollection().then(function (collection) {
    console.log('Collection "Message" is created!');
});
Chat.createCollection().then(function (collection) {
    console.log('Collection "Chat" is created!');
});
const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const fileRouters = require("./routes/fileRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { chat } = require("./data/data")
const path = require("path");
var cors = require('cors')
const users = require('./users');

dotenv.config();
connectDB();
const app = express();

app.use(cors())
app.use(express.json()); // to accept json data

// app.get("/", (req, res) => {
//   res.send("API Running!");
// });
app.use('/public/uploads/', express.static('public/uploads/'));

app.use("/test", (req, res) => {
  res.send("test")
})
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/file", fileRouters);


// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);
console.log(process.env.FE_URL)

const io = require("socket.io")(server, {
  cors: {
    // origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
  },
  transports: ['polling', 'websocket'],
  log: true,
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");

    // thêm user mới khi đăng nhập vào users để sử dụng cho việc call video, call, check online
    users.create(socket, userData)

    // socket.broadcast.emit("user online", userData._id);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket
  .on('request', (data) => {
      // lấy thông tin socket của người nhận rồi chuyển call request để họ nhận cuộc gọi
      const receiver = users.get(data.to);
      // lấy thông tin của người gọi để hiển thị ở người nhận
      const senderInfo = users.getInfo(data.from)
      if (receiver) {
        receiver.emit('request', { from: data.from, fromUser: senderInfo.name });
      }
    })
    .on('call', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('call', { ...data, from:  data.from });
      } else {
        socket.emit('failed');
      }
    })
    .on('end', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('end');
      }
    })

    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
      users.remove(userData._id);
      console.log(userData._id, 'disconnected');
    });
});

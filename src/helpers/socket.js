const socket = require("socket.io");
const Chat = require("../models/chat");
const User = require("../models/user");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("joinChat", ({ senderName, senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);
      console.log(senderName + " joined in room: " + roomId)
    });

    socket.on(
      "sendMessage",
      async ({ senderFirstName, senderLastName, senderId, receiverId, message }) => {

        try {
          const roomId = [senderId, receiverId].sort().join("_");

          console.log("server: massage received, saving the message")

          let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [senderId, receiverId],
              messages: [],
            });
          }

          const timeStamp = new Date()

          chat.messages.push({
            sender: senderId,
            receiver: receiverId,
            message,
            timeStamp
          });

          await chat.save();

          console.log("server: message saved, sending to frontend")

          io.to(roomId).emit("messageRecived", { senderId, senderFirstName, senderLastName, message, timeStamp });
        } catch (e) {
          console.log(e);
        }
      },
    );

    socket.on("userOnline", async ({ userId }) => {
      socket.userId = userId
      const user = await User.findByIdAndUpdate(userId, { status: true })
    })

    socket.on("disconnect", async () => {
      const userId = socket.userId
      const user = await User.findByIdAndUpdate(userId, { status: false, lastSeen: new Date() })
    })

  });
};

module.exports = initializeSocket;

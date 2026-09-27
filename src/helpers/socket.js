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

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    socket.on("userOnline", async ({ userId }) => {
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      const user = await User.findByIdAndUpdate(userId, { status: true });
    });

    socket.on("joinChat", ({ senderName, senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);

    });

    socket.on("leaveChat", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.leave(roomId);

    });

    socket.on(
      "sendMessage",
      async ({
        senderFirstName,
        senderLastName,
        senderId,
        receiverId,
        message,
      }) => {
        try {
          const roomId = [senderId, receiverId].sort().join("_");

          let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [senderId, receiverId],
              messages: [],
            });
          }

          const timeStamp = new Date();

          chat.messages.push({
            sender: senderId,
            receiver: receiverId,
            message,
            timeStamp,
          });

          await chat.save();

          io.to(roomId).emit("messageRecived", {
            senderId,
            senderFirstName,
            senderLastName,
            message,
            timeStamp,
          });

          receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessageNotification", {
              senderId,
              senderFirstName,
              senderLastName,
              message,
            });
          }
        } catch (e) {
          console.log(e);
        }
      },
    );

    socket.on("disconnect", async () => {
      const userId = socket.userId;
      const user = await User.findByIdAndUpdate(userId, {
        status: false,
        lastSeen: new Date(),
      });
    });
  });
};

module.exports = initializeSocket;

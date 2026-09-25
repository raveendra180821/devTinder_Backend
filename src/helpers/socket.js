const socket = require("socket.io");
const Chat = require("../models/chat");

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
    });

    socket.on(
      "sendMessage",
      async ({ senderFirstName, senderLastName, senderId, receiverId, message }) => {
        const roomId = [senderId, receiverId].sort().join("_");
        

        try {
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

          io.to(roomId).emit("messageRecived", { senderId, senderFirstName, senderLastName, message, timeStamp });
        } catch (e) {
          console.log(e);
        }
      },
    );
  });
};

module.exports = initializeSocket;

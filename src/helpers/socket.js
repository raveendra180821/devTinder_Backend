const socket = require("socket.io");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ senderName, senderId, recieverId }) => {
      const roomId = [senderId, recieverId].sort().join("_");
      console.log(senderName + ": joined room - " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ senderFirstName, senderLastName, senderId, recieverId, message }) => {
        const roomId = [senderId, recieverId].sort().join("_");

        try {
          let chat = await Chat.findOne({
            participants: { $all: [senderId, recieverId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [senderId, recieverId],
              messages: [],
            });
          }

          chat.messages.push({
            sender: senderId,
            reciever: recieverId,
            message,
          });

          await chat.save();

          io.to(roomId).emit("messageRecived", { senderFirstName, senderLastName, message });
        } catch (e) {
          console.log(e);
        }
      },
    );
  });
};

module.exports = initializeSocket;

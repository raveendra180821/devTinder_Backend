const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:receiverId", userAuth, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { _id: senderId } = req.user;

    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    })
      .populate("messages.sender", "firstName lastName")
      .populate("messages.receiver", "firstName lastName");

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    await chat.save();

    res.send(chat.messages);
  } catch (e) {
    res.status(400).send("Something went wrong");
    console.log(e);
  }
});

module.exports = chatRouter;

const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:recieverId", userAuth, async (req, res) => {
  try {
    const { recieverId } = req.params;
    const { _id: senderId } = req.user;

    let chat = await Chat.findOne({
      participants: { $all: [senderId, recieverId] },
    })
      .populate("messages.sender", "firstName lastName")
      .populate("messages.reciever", "firstName lastName");

    if (!chat) {
      chat = new Chat({
        participants: [senderId, recieverId],
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

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

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    chat = await chat.populate([
      {
        path: "participants",
        select: "firstName lastName photoUrl",
      },
      {
        path: "messages.receiver",
        select: "firstName lastName",
      },
      {
        path: "messages.receiver",
        select: "firstName lastName",
      },
    ]);

    await chat.save();

    res.send(chat);
  } catch (e) {
    res.status(400).send("Something went wrong");
    console.log(e);
  }
});

module.exports = chatRouter;

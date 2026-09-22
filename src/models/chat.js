const mongoose = require("mongoose");

const { Schema } = mongoose;

const messagesSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timeStamp: {
      type: Date
    }
  },
  { timestamps: true },
);

const chatSchema = new Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  messages: [messagesSchema],
});

module.exports = mongoose.model("Chat", chatSchema);

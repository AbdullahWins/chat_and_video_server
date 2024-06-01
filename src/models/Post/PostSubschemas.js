const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

//post like schema
const postLikeSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

//post comment schema
const postCommentSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  repliedTo: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  repliedOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

module.exports = { postLikeSchema, postCommentSchema };

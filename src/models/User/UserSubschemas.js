const mongoose = require("mongoose");

//friends list schema
const friendsListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
});

//groups list schema
const groupsListSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "joined",
  },
});

//events list schema
const eventsListSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
});

//favorites list schema
const favoritesListSchema = new mongoose.Schema({
  favoriteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  favoriteType: {
    type: String,
    required: true,
  },
});

module.exports = {
  friendsListSchema,
  groupsListSchema,
  eventsListSchema,
  favoritesListSchema,
};

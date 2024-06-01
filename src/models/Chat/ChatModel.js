// models/ChatMessage.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { ChatFetchDTO } = require("../../dtos/ChatDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupChat",
  },
  message: {
    type: String,
    required: true,
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

//get all chats
chatMessageSchema.statics.getAllChats = async function () {
  try {
    //get last 20 chats
    const chats = await this.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "receiver",
        select: "-password",
      })
      .populate({
        path: "group",
      })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(404, "No chat found");
    }

    // Transform user objects into DTO format for each event
    const transformedChats = chats.map((chat) => {
      const chatDTO = new ChatFetchDTO(chat);
      return chatDTO;
    });

    return transformedChats;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get chats for a user
chatMessageSchema.statics.getAllChatsByUser = async function (userId) {
  try {
    //get last 20 chats for the user
    const chats = await this.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "receiver",
        select: "-password",
      })
      .populate({
        path: "group",
      })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(404, "No chat found for this user");
    }

    // Transform user objects into DTO format for each event
    const transformedChats = chats.map((chat) => {
      const chatDTO = new ChatFetchDTO(chat);
      return chatDTO;
    });

    return transformedChats;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get chats for a group
chatMessageSchema.statics.getAllChatsByGroup = async function (groupId) {
  try {
    //get last 20 chats for the group
    const chats = await this.find({ group: groupId })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "receiver",
        select: "-password",
      })
      .populate({
        path: "group",
      })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(404, "No chat found for this group");
    }

    // Transform user objects into DTO format for each event
    const transformedChats = chats.map((chat) => {
      const chatDTO = new ChatFetchDTO(chat);
      return chatDTO;
    });

    return transformedChats;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get chats between two users
chatMessageSchema.statics.getAllChatsBetweenUsers = async function (
  userId,
  otherUserId
) {
  try {
    //get last 20 chats between two users
    const chats = await this.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "receiver",
        select: "-password",
      })
      .populate({
        path: "group",
      })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(404, "No chat found between these users");
    }

    // Transform user objects into DTO format for each event
    const transformedChats = chats.map((chat) => {
      const chatDTO = new ChatFetchDTO(chat);
      return chatDTO;
    });

    return transformedChats;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get all chat on a group
chatMessageSchema.statics.getAllChatsByGroup = async function (groupId) {
  try {
    //get last 20 chats for the group
    const chats = await this.find({ group: groupId })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "receiver",
        select: "-password",
      })
      .populate({
        path: "group",
      })
      .exec();

    if (chats.length === 0) {
      throw new CustomError(404, "No chat found for this group");
    }

    // Transform user objects into DTO format for each event
    const transformedChats = chats.map((chat) => {
      const chatDTO = new ChatFetchDTO(chat);
      return chatDTO;
    });

    return transformedChats;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get group chats for a user
// chatMessageSchema.statics.getAllGroupChatsByUser = async function (userId) {
//   try {
//     //get all the group chats that userId is a part of the group
//     const chats = await this.find({
//       $and: [{ isGroupChat: true }, { receiver: userId }],
//     })
//       .sort({ timestamp: -1 })
//       .limit(20)
//       .populate({
//         path: "sender",
//         select: "-password",
//       })
//       .populate({
//         path: "receiver",
//         select: "-password",
//       })
//       .populate({
//         path: "group",
//       })
//       .exec();

//     if (chats.length === 0) {
//       throw new CustomError(404, "No group chat found for this user");
//     }

//     // Transform user objects into DTO format for each event
//     const transformedChats = chats.map((chat) => {
//       const chatDTO = new ChatFetchDTO(chat);
//       return chatDTO;
//     });

//     return transformedChats;
//   } catch (error) {
//     throw new CustomError(error?.statusCode, error?.message);
//   }
// };

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

module.exports = ChatMessage;

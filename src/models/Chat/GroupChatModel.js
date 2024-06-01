// models/GroupChat.js

const mongoose = require("mongoose");
const { GroupChatDTO } = require("../../dtos/ChatDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");

const groupChatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//get all groups
groupChatSchema.statics.getAllChatGroups = async function () {
  try {
    const groups = await this.find()
      .populate({
        path: "users",
        select: "-password",
      })
      .exec();

    if (groups?.length === 0) {
      throw new CustomError(404, "No chat group found");
    }

    //transform user objects into DTO format for each group
    const transformedGroups = groups.map((group) => {
      const groupDTO = new GroupChatDTO(group);
      return groupDTO;
    });

    return transformedGroups;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get all groups by user
groupChatSchema.statics.getAllChatGroupsByUser = async function (userId) {
  try {
    //return only the groups that contain the user
    const groups = await this.find({ users: userId })
      .populate({
        path: "users",
        select: "-password",
      })
      .exec();

    if (groups?.length === 0) {
      throw new CustomError(404, "No chat group found");
    }

    //transform user objects into DTO format for each group
    const transformedGroups = groups.map((group) => {
      const groupDTO = new GroupChatDTO(group);
      return groupDTO;
    });
    return transformedGroups;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get one group by id
groupChatSchema.statics.getChatGroupById = async function (groupId) {
  try {
    const group = await this.findById(groupId)
      .populate({
        path: "users",
        select: "-password",
      })
      .exec();

    if (!group) {
      throw new CustomError(404, "Chat group not found");
    }

    //transform user objects into DTO format
    const groupDTO = new GroupChatDTO(group);
    return groupDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const GroupChat = mongoose.model("GroupChat", groupChatSchema);

module.exports = GroupChat;

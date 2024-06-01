//chat module

const ChatMessage = require("../models/Chat/ChatModel");
const GroupChat = require("../models/Chat/GroupChatModel");

async function handleIndividualMessage(
  io,
  socket,
  { senderId, receiverId, message }
) {
  try {
    const newMessage = await ChatMessage.create({
      sender: senderId,
      receiver: receiverId,
      isGroupChat: false,
      message: message,
    });

    io.to(senderId).emit("individual", newMessage);
    io.to(receiverId).emit("individual", newMessage);
  } catch (error) {
    console.error("Error saving chat message:", error);
  }
}

async function handleGroupMessage(io, socket, { senderId, groupId, message }) {
  try {
    const newMessage = await ChatMessage.create({
      sender: senderId,
      group: groupId,
      isGroupChat: true,
      message: message,
    });

    //get users list from the group
    const group = await GroupChat.findById(groupId);
    group.users.forEach((id) => {
      io.to(id.toString()).emit("group", newMessage);
    });

    // io.to(groupId).emit("group", newMessage);
  } catch (error) {
    console.error("Error saving group chat message:", error);
  }
}

async function handleCreateGroup(io, socket, { groupName, userIds }) {
  try {
    const newGroup = await GroupChat.create({
      name: groupName,
      users: userIds,
    });

    userIds.forEach((id) => socket.join(newGroup._id.toString()));
    io.to(newGroup._id.toString()).emit("groupCreated", newGroup);
  } catch (error) {
    console.error("Error creating group:", error);
  }
}

async function handleAddUsersToGroup(io, socket, { groupId, userIds }) {
  try {
    await createGroupIfNotExists(groupId, userIds);

    //get users list from the group
    const group = await GroupChat.findById(groupId);
    group.users.forEach((id) => {
      io.to(id.toString()).emit("usersAddedToGroup", userIds);
    });

  } catch (error) {
    console.error("Error adding users to group:", error);
  }
}

async function createGroupIfNotExists(groupId, userIds) {
  const group = await GroupChat.findById(groupId);
  if (!group) {
    await GroupChat.create({
      _id: groupId,
      users: userIds,
    });
  } else {
    group.users = [...new Set([...group.users, ...userIds])];
    await group.save();
  }
}

module.exports = {
  handleIndividualMessage,
  handleGroupMessage,
  handleCreateGroup,
  handleAddUsersToGroup,
};

const ChatRouter = require("express").Router();
const { authorizeRequest } = require("../../middlewares/AuthorizeRequest");
const {
  getAllChatGroups,
  getAllChatGroupsByUser,
  getChatGroupById,
  getAllChats,
  getAllChatsByUser,
  getAllChatsBetweenUsers,
  getAllChatsByGroup,
  // getAllGroupChatsByUser,
} = require("../../controllers/Chat/ChatController");

ChatRouter.get("/groups/all", authorizeRequest, getAllChatGroups);
ChatRouter.get("/my-groups", authorizeRequest, getAllChatGroupsByUser);
ChatRouter.get("/groups/:groupId", authorizeRequest, getChatGroupById);

ChatRouter.get("/all", authorizeRequest, getAllChats);
ChatRouter.get("/my-all-chats", authorizeRequest, getAllChatsByUser);
ChatRouter.get(
  "/individual/:receiverId",
  authorizeRequest,
  getAllChatsBetweenUsers
);
ChatRouter.get("/group-chat/:groupId", authorizeRequest, getAllChatsByGroup);
// ChatRouter.get("/my-group-chats", authorizeRequest, getAllGroupChatsByUser);

module.exports = ChatRouter;

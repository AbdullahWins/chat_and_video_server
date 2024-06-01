const { createServer } = require("http");
const { Server } = require("socket.io");
const { configureApp } = require("../server/configure.config");
const ChatMessage = require("../../src/models/Chat/ChatModel");
const GroupChat = require("../../src/models/Chat/GroupChatModel");
const {
  handleCreateGroup,
  handleIndividualMessage,
  handleGroupMessage,
  handleAddUsersToGroup,
} = require("../../src/chats/ChatModule");

const app = configureApp();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  const { userId } = socket.handshake.query;
  console.log("User ID:", userId);

  socket.join(userId);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("createGroup", (data) => handleCreateGroup(io, socket, data));
  socket.on("addUsersToGroup", (data) =>
    handleAddUsersToGroup(io, socket, data)
  );
  socket.on("individual", (data) => handleIndividualMessage(io, socket, data));
  socket.on("group", (data) => handleGroupMessage(io, socket, data));
});

module.exports = { httpServer, io };

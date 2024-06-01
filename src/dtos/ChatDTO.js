//Chat DTO
const { UserChatDTO } = require("./UserDTO");

class GroupChatDTO {
  constructor(group) {
    this._id = group?._id || null;
    this.name = group?.name || "";
    this.users = group?.users
      ? group.users.map((user) => new UserChatDTO(user))
      : [];
    this.createdAt = group?.createdAt || null;
  }
}

//group fetch dto
class GroupFetchDTO {
  constructor(group) {
    this._id = group?._id || null;
    this.name = group?.name || "";
    // this.users = group?.users ? group.users : [];
    this.createdAt = group?.createdAt || null;
  }
}

class ChatDTO {
  constructor(chat) {
    this._id = chat?._id || null;
    this.sender = chat?.sender ? new UserChatDTO(chat.sender) : null;
    this.receiver = chat?.receiver ? new UserChatDTO(chat.receiver) : null;
    this.group = chat?.group ? new GroupFetchDTO(chat.group) : null;
    this.message = chat?.message || "";
    this.message = chat?.message || "";
    this.isGroupChat = chat?.isGroupChat || false;
    this.createdAt = chat?.createdAt || null;
  }
}

class ChatFetchDTO {
  constructor(chat) {
    this._id = chat?._id || null;
    this.sender = chat?.sender ? new UserChatDTO(chat.sender) : null;
    this.receiver = chat?.receiver ? new UserChatDTO(chat.receiver) : null;
    this.group = chat?.group ? new GroupFetchDTO(chat.group) : null;
    this.message = chat?.message || "";
    this.message = chat?.message || "";
    this.isGroupChat = chat?.isGroupChat || false;
    this.createdAt = chat?.createdAt || null;
  }
}

module.exports = { ChatDTO, ChatFetchDTO, GroupChatDTO, GroupFetchDTO };

//Job DTO
const { UserGroupDTO } = require("./UserDTO");

class GroupDTO {
  constructor(group) {
    this._id = group?._id || null;
    this.owner = group?.owner ? new UserGroupDTO(group.owner) : null;
    this.name = group?.name || "";
    this.coverImage = group?.coverImage || "";
    this.description = group?.description || "";
    this.members = group.members.map((member) => new UserGroupDTO(member));
    this.createdAt = group?.createdAt || null;
  }
}

module.exports = { GroupDTO };

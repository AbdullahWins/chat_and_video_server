//Event DTO
const { UserEventDTO } = require("./UserDTO");

class EventJoineeDTO {
  constructor(joinee) {
    this._id = joinee?._id || null;
    this.joinee = joinee?.joinee ? new UserEventDTO(joinee.joinee) : null;
    this.createdAt = joinee?.createdAt || null;
  }
}

class EventDTO {
  constructor(event) {
    this._id = event?._id || null;
    this.postedBy = event?.postedBy ? new UserEventDTO(event.postedBy) : null;
    this.name = event?.name || "";
    this.coverImage = event?.coverImage || "";
    this.starting = event?.starting || "";
    this.ending = event?.ending || "";
    this.type = event?.type || "";
    this.privacy = event?.privacy || "";
    this.location = event?.location || "";
    this.description = event?.description || "";
    this.joinees = event?.joinees
      ? event.joinees.map((joinee) => new EventJoineeDTO(joinee))
      : [];

    this.createdAt = event?.createdAt || null;
  }
}

class EventFetchDTO {
  constructor(event) {
    this._id = event?._id || null;
    this.postedBy = event?.postedBy ? new UserEventDTO(event.postedBy) : null;
    this.name = event?.name || "";
    this.coverImage = event?.coverImage || "";
    this.starting = event?.starting || "";
    this.ending = event?.ending || "";
    this.type = event?.type || "";
    this.privacy = event?.privacy || "";
    this.location = event?.location || "";
    this.description = event?.description || "";
    this.createdAt = event?.createdAt || null;
  }
}

module.exports = { EventDTO, EventFetchDTO };

// event model
const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { EventDTO, EventFetchDTO } = require("../../dtos/EventDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const {
  ENUM_EVENT_TYPE,
  ENUM_EVENT_PRIVACY,
} = require("../../constants/EventConstants");

const eventJoineeSchema = new mongoose.Schema({
  joinee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

const eventSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  starting: {
    type: Number,
    required: true,
  },
  ending: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ENUM_EVENT_TYPE,
    required: true,
  },
  privacy: {
    type: String,
    enum: ENUM_EVENT_PRIVACY,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  joinees: {
    type: [eventJoineeSchema],
    default: [],
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

//get all events with user populated and filtered with dto
eventSchema.statics.getAllEvents = async function () {
  try {
    // Find all events and populate the userId field while excluding the password field
    const events = await this.find()
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "joinees.joinee",
        // model: "EventApplication",
        // select: "-password",
        options: { lean: true },
      });

    if (events?.length === 0) {
      throw new CustomError(404, "No events found");
    }

    //sort events by date created in descending order
    events.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each event
    const transformedEvents = events.map((event) => {
      const eventDTO = new EventDTO(event);
      return eventDTO;
    });

    // Return transformed events
    return transformedEvents;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get active events with user populated and filtered with dto
eventSchema.statics.getRunningEvents = async function () {
  try {
    //find all events that has a ending date greater than the current date
    const events = await this.find({ ending: { $gt: Timekoto() } })
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "joinees.joinee",
        // model: "EventApplication",
        // select: "-password",
        options: { lean: true },
      });

    if (events?.length === 0) {
      throw new CustomError(404, "No running events found");
    }

    //sort events by date created in descending order
    events.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each event
    const transformedEvents = events.map((event) => {
      const eventDTO = new EventFetchDTO(event);
      return eventDTO;
    });

    // Return transformed events
    return transformedEvents;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get all events by user with user and event populated and filtered with dto

eventSchema.statics.getAllEventsByUser = async function (userId) {
  try {
    // Find all events by user and populate the userId field while excluding the password field
    const events = await this.find({ postedBy: userId })
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "joinees.joinee",
        // model: "EventApplication",
        // select: "-password",
        options: { lean: true },
      });

    if (events?.length === 0) {
      throw new CustomError(404, "No events found for this user");
    }

    //sort events by date created in descending order
    events.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each event
    const transformedEvents = events.map((event) => {
      const eventDTO = new EventDTO(event);
      return eventDTO;
    });

    // Return transformed events
    return transformedEvents;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get one event with user and event populated and filtered with dto
eventSchema.statics.getOneEvent = async function (eventId) {
  try {
    // Find one event and populate the userId field while excluding the password field
    const event = await this.findById(eventId)
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "joinees.joinee",
        // model: "EventApplication",
        // select: "-password",
        options: { lean: true },
      });

    if (!event) {
      throw new CustomError(404, "No event found");
    }

    // Transform user object into DTO format
    const eventDTO = new EventFetchDTO(event);

    // Return transformed event
    return eventDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//add new event with user and event populated and dto
eventSchema.statics.addOneEvent = async function (data) {
  try {
    const {
      postedBy,
      name,
      coverImage,
      starting,
      ending,
      type,
      privacy,
      location,
      description,
      joinees,
    } = data;
    const event = new this({
      postedBy,
      name,
      coverImage,
      starting,
      ending,
      type,
      privacy,
      location,
      description,
      joinees,
    });

    // Save event
    const result = await event.save();

    if (!result) {
      throw new CustomError(500, "Failed to add event");
    }

    // Populate the postedBy and joinees.joinee fields
    const populatedEvent = await this.findById(result._id)
      .populate({
        path: "postedBy",
        select: "-password", // Exclude fields you don't want to return
      })
      .populate({
        path: "joinees.joinee",
        // model: "EventApplication",
        // select: "-password",
      })
      .exec();

    // Transform event object into DTO format
    const eventDTO = new EventDTO(populatedEvent);

    // Return transformed event
    return eventDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//update event with user and event populated and dto
eventSchema.statics.updateEventById = async function (eventId, data) {
  try {
    //check if the value of status is valid
    // if (!ENUM_EVENT_STATUS[status]) {
    //   throw new CustomError(400, "Invalid status value");
    // }
    const updatedEvent = await this.findByIdAndUpdate(
      eventId,
      { ...data },
      { new: true }
    )
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "joinees.joinee",
        // model: "EventApplication",
        // select: "-password",
        options: { lean: true },
      });

    //process event using dto
    if (!updatedEvent) {
      throw new CustomError(404, "No event found");
    }

    // Transform event object into DTO format
    const eventDTO = new EventDTO(updatedEvent);
    return eventDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//delete one event
eventSchema.statics.deleteOneEvent = async function (eventId) {
  try {
    //to perform multiple filters at once
    const filter = {
      _id: eventId,
    };

    const result = await this.deleteOne(filter);
    if (result?.deletedCount === 0) {
      throw new CustomError(404, "No event found");
    }
    return { message: `Event deleted successfully with id: ${eventId}` };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//add application to event
eventSchema.statics.joinOneEvent = async function (eventId, userId) {
  try {
    const event = await this.findById(eventId);

    if (!event) {
      throw new CustomError(404, "No event found");
    }

    //check if application already joined
    const isJoined = event.joinees.find(
      (joinee) => joinee.joinee.toString() === userId.toString()
    );
    if (isJoined) {
      throw new CustomError(400, "Already joined this event");
    }

    //join the event
    const joinee = {
      joinee: userId,
    };

    event.joinees.push(joinee);
    const result = await event.save();

    if (!result) {
      throw new CustomError(500, "Failed to join event");
    }

    // Transform event object into DTO format
    const eventDTO = new EventFetchDTO(result);
    return eventDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

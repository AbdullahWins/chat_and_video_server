// Controllers/EventController.js
const { logger } = require("../../services/logHandlers/HandleWinston");
const Event = require("../../models/Event/EventModel");
const {
  ObjectIdChecker,
} = require("../../services/validationHandlers/ObjectIdChecker");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const {
  handleFileUpload,
} = require("../../services/fileHandlers/HandleFileUpload");

//get all Event using mongoose
const getAllEvents = async (req, res) => {
  //perform query on database
  const events = await Event.getAllEvents();
  logger.log("info", `Found ${events?.length} events`);
  return sendResponse(res, 200, "Fetched all events", events);
};

//get active Event using mongoose
const getRunningEvents = async (req, res) => {
  //perform query on database
  const events = await Event.getRunningEvents();
  logger.log("info", `Found ${events?.length} events`);
  return sendResponse(res, 200, "Fetched all active events", events);
};

//get single Event using mongoose
const getOneEvent = async (req, res) => {
  const eventId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(eventId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //perform query on database
  const event = await Event.getOneEvent(eventId);
  logger.log("info", JSON.stringify(event, null, 2));
  return sendResponse(res, 200, "Event retrieved successfully", event);
};

//get all Event by user using mongoose
const getAllEventsByUser = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    return sendResponse(res, 401, "Unauthorized");
  }

  //perform query on database
  const events = await Event.getAllEventsByUser(userId);
  logger.log("info", `Found ${events?.length} events`);
  return sendResponse(res, 200, "Fetched all events", events);
};

//add new Event using mongoose
const addOneEvent = async (req, res) => {
  const { name, starting, ending, type, privacy, location, description } = req
    ?.body?.data
    ? JSON.parse(req?.body?.data)
    : {};
  const { files } = req;
  if (
    !name ||
    !starting ||
    !ending ||
    !type ||
    !privacy ||
    !location ||
    !description ||
    !files?.single
  ) {
    sendResponse(res, 400, "Missing required field");
  }

  //validate authority from middleware authentication
  const postedBy = req?.auth?._id;
  if (!postedBy) {
    return sendResponse(res, 401, "Unauthorized");
  }

  const folderName = "events";

  let updatedData = {
    postedBy,
    name,
    starting,
    ending,
    type,
    privacy,
    location,
    description,
  };

  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const coverImage = fileUrls[0];
    updatedData = { ...updatedData, coverImage };
  }

  //add new event
  const result = await Event.addOneEvent(updatedData);
  logger.log("info", `Posted a event: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 201, "Event posted successfully", result);
};

//join event
const joinOneEvent = async (req, res) => {
  const eventId = req?.params?.id;
  const userId = req?.auth?._id;

  //object id validation
  if (!ObjectIdChecker(eventId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //check if required fields are present
  if (!eventId) {
    return sendResponse(res, 400, "Missing required field");
  }

  //add event application
  const result = await Event.joinOneEvent(eventId, userId);
  logger.log("info", `Applied for a event: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 201, "Event application successful", result);
};

// update One event status by id using mongoose
const updateEventById = async (req, res) => {
  const eventId = req?.params?.id;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { files } = req;

  //object id validation
  if (!ObjectIdChecker(eventId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  if (!data && !files?.single) {
    return sendResponse(res, 400, "Nothing to update");
  }

  //update event
  let updatedData = { ...data };
  const folderName = "events";
  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const coverImage = fileUrls[0];
    updatedData = { ...updatedData, coverImage };
  }

  const result = await Event.updateEventById(eventId, updatedData);
  logger.log("info", `Updated event: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 200, "Event updated successfully", result);
};

//delete one event
const deleteOneEventById = async (req, res) => {
  const eventId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(eventId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //delete event
  const deletionResult = await Event.deleteOneEvent(eventId);
  logger.log("info", deletionResult?.message);
  return sendResponse(res, 200, deletionResult?.message);
};

module.exports = {
  getAllEvents: asyncHandler(getAllEvents),
  getRunningEvents: asyncHandler(getRunningEvents),
  getAllEventsByUser: asyncHandler(getAllEventsByUser),
  getOneEvent: asyncHandler(getOneEvent),
  addOneEvent: asyncHandler(addOneEvent),
  joinOneEvent: asyncHandler(joinOneEvent),
  updateEventById: asyncHandler(updateEventById),
  deleteOneEventById: asyncHandler(deleteOneEventById),
};

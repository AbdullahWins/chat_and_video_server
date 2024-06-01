const EventRouter = require("express").Router();
const { authorizeRequest } = require("../../middlewares/AuthorizeRequest");
const {
  getAllEvents,
  getRunningEvents,
  getAllEventsByUser,
  getOneEvent,
  addOneEvent,
  joinOneEvent,
  updateEventById,
  deleteOneEventById,
} = require("../../controllers/Event/EventController");

EventRouter.get("/all", authorizeRequest, getAllEvents);
EventRouter.get("/running", authorizeRequest, getRunningEvents);
EventRouter.get("/get-own-jobs", authorizeRequest, getAllEventsByUser);
EventRouter.get("/find/:id", authorizeRequest, getOneEvent);
EventRouter.post("/add", authorizeRequest, addOneEvent);
EventRouter.post("/join/:id", authorizeRequest, joinOneEvent);
EventRouter.patch("/update/:id", authorizeRequest, updateEventById);
EventRouter.delete("/delete/:id", authorizeRequest, deleteOneEventById);

module.exports = EventRouter;

const MainRouter = require("express").Router();

//import routes
const DefaultRouter = require("./DefaultRoutes");
const AdminRouter = require("../Admin/AdminRoutes");
const UserRouter = require("../User/UserRoutes");
const PostRouter = require("../Post/PostRoutes");
const FlaggedPostRouter = require("../Post/FlaggedPostRoutes");
const JobRouter = require("../Job/JobRoutes");
const GroupRouter = require("../Group/GroupRoutes");
const EventRouter = require("../Event/EventRoutes");
const ChatRouter = require("../Chat/ChatRoutes");

//routes with prefixes
MainRouter.use("/admins", AdminRouter);
MainRouter.use("/users", UserRouter);
MainRouter.use("/posts", PostRouter);
MainRouter.use("/flagged-posts", FlaggedPostRouter);
MainRouter.use("/jobs", JobRouter);
MainRouter.use("/groups", GroupRouter);
MainRouter.use("/events", EventRouter);
MainRouter.use("/chats", ChatRouter);

//routes
MainRouter.use(DefaultRouter);

module.exports = { MainRouter };

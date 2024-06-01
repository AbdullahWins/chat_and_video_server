const FlaggedPostRouter = require("express").Router();
const {
  authorizeAdmin,
  authorizeRequest,
} = require("../../middlewares/AuthorizeRequest");

const {
  getAllFlaggedPosts,
  getOneFlaggedPost,
  addOneFlaggedPost,
  updateFlaggedPostById,
  deleteOneFlaggedPostById,
} = require("../../controllers/Post/FlaggedPostController");

FlaggedPostRouter.get("/all", authorizeAdmin, getAllFlaggedPosts);
FlaggedPostRouter.get("/find/:id", authorizeAdmin, getOneFlaggedPost);
FlaggedPostRouter.post("/add", authorizeRequest, addOneFlaggedPost);
FlaggedPostRouter.patch(
  "/update-status/:id",
  authorizeAdmin,
  updateFlaggedPostById
);
FlaggedPostRouter.delete(
  "/delete/:id",
  authorizeAdmin,
  deleteOneFlaggedPostById
);

module.exports = FlaggedPostRouter;

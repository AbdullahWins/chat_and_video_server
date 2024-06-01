// Controllers/FlaggedPostController.js
const FlaggedPost = require("../../models/Post/FlaggedPostModel");
const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  ObjectIdChecker,
} = require("../../services/validationHandlers/ObjectIdChecker");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const { asyncHandler } = require("../../middlewares/AsyncHandler");

//get all FlaggedPost using mongoose
const getAllFlaggedPosts = async (req, res) => {
  //perform query on database
  const flaggedPosts = await FlaggedPost.getAllFlaggedPosts();
  logger.log("info", `Found ${flaggedPosts?.length} flaggedPosts`);
  return sendResponse(res, 200, "Fetched all flaggedPosts", flaggedPosts);
};

//get single FlaggedPost using mongoose
const getOneFlaggedPost = async (req, res) => {
  const flaggedPostId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(flaggedPostId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //perform query on database
  const flaggedPost = await FlaggedPost.getOneFlaggedPost(flaggedPostId);
  logger.log("info", JSON.stringify(flaggedPost, null, 2));
  return sendResponse(
    res,
    200,
    "FlaggedPost retrieved successfully",
    flaggedPost
  );
};

//add new FlaggedPost using mongoose
const addOneFlaggedPost = async (req, res) => {
  const { postId, subject, description } = JSON.parse(
    req?.body?.data
  );
  if ( !postId || !subject || !description) {
    sendResponse(res, 400, "Missing required field");
  }

  //validate authority from middleware authentication
  const flaggedBy = req?.auth?._id;
  if (!flaggedBy) {
    return sendResponse(res, 401, "Unauthorized");
  }

  //create new flaggedPost object
  let updatedData = {
    postId,
    flaggedBy,
    subject,
    description,
  };

  //add new flaggedPost
  const result = await FlaggedPost.addOneFlaggedPost(updatedData);
  logger.log("info", `Flagged a post: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 201, "Post flagged successfully", result);
};

// update One flagged post content by id using mongoose
const updateFlaggedPostStatusById = async (req, res) => {
  const flaggedPostId = req?.params?.id;
  const { status } = req?.body?.data ? JSON.parse(req?.body?.data) : {};

  //object id validation
  if (!ObjectIdChecker(flaggedPostId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  if (!status) {
    return sendResponse(res, 400, "Missing required field");
  }

  //update flagged flaggedPost status
  let updatedData = { status };
  const result = await FlaggedPost.updateFlaggedPostStatusById(
    flaggedPostId,
    updatedData
  );
  logger.log(
    "info",
    `Updated flagged post: ${JSON.stringify(result, null, 2)}`
  );
  return sendResponse(res, 200, "FlaggedPost updated successfully", result);
};

//delete one flagged post
const deleteOneFlaggedPostById = async (req, res) => {
  const flaggedPostId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(flaggedPostId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //delete flaggedPost
  const deletionResult = await FlaggedPost.deleteOneFlaggedPost(flaggedPostId);
  logger.log("info", deletionResult?.message);
  return sendResponse(res, 200, deletionResult?.message);
};

module.exports = {
  getAllFlaggedPosts: asyncHandler(getAllFlaggedPosts),
  getOneFlaggedPost: asyncHandler(getOneFlaggedPost),
  addOneFlaggedPost: asyncHandler(addOneFlaggedPost),
  updateFlaggedPostById: asyncHandler(updateFlaggedPostStatusById),
  deleteOneFlaggedPostById: asyncHandler(deleteOneFlaggedPostById),
};

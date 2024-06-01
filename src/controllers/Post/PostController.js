// Controllers/PostController.js
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const Post = require("../../models/Post/PostModel");
const {
  handleFileUpload,
} = require("../../services/fileHandlers/HandleFileUpload");
const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const {
  ObjectIdChecker,
} = require("../../services/validationHandlers/ObjectIdChecker");

//get all Post using mongoose
const getAllPosts = async (req, res) => {
  //perform query on database
  const posts = await Post.getAllPosts();
  logger.log("info", `Found ${posts?.length} posts`);
  return sendResponse(res, 200, "Fetched all posts", posts);
};

//get single Post using mongoose
const getOnePost = async (req, res) => {
  const postId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(postId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //perform query on database
  const post = await Post.getPostByPostId(postId);
  logger.log("info", JSON.stringify(post, null, 2));
  return sendResponse(res, 200, "Post retrieved successfully", post);
};

//get posts by user id using mongoose
const getPostsByUserId = async (req, res) => {
  const userId = req?.params?.id;

  //object id validation
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //perform query on database
  const posts = await Post.getPostsByUserId(userId);
  logger.log("info", `Found ${posts?.length} posts`);
  return sendResponse(res, 200, "Fetched all posts", posts);
};

//get own posts by user using mongoose
const getOwnPostsByUser = async (req, res) => {
  const userId = req?.auth?._id;

  //object id validation
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //perform query on database
  const posts = await Post.getPostsByUserId(userId);
  logger.log("info", `Found ${posts?.length} posts`);
  return sendResponse(res, 200, "Fetched all posts", posts);
};

//get relevent posts for user using mongoose
const getRelevantPostsForUser = async (req, res) => {
  const userId = req?.auth?._id;

  //object id validation
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //perform query on database
  const posts = await Post.getRelevantPostsForUser(userId);
  logger.log("info", `Found ${posts?.length} posts`);
  return sendResponse(res, 200, "Fetched all posts", posts);
};

//add new Post using mongoose
const addOnePost = async (req, res) => {
  const { privacy, content } = JSON.parse(req?.body?.data);
  const { files } = req;
  const postedBy = req?.auth?._id;

  if (!postedBy || !privacy || !content) {
    return sendResponse(res, 400, "Missing required field");
  }

  //validate authority from middleware authentication
  const auth = req?.auth;
  if (!auth) {
    return sendResponse(res, 401, "Unauthorized");
  }

  //create new post object
  let updatedData = {
    postedBy,
    privacy,
    content,
  };

  const folderName = "posts";
  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const image = fileUrls[0];
    updatedData = { ...updatedData, image };
  }

  //add new post
  const result = await Post.createNewPost(updatedData);
  logger.log("info", `Added a new post: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 201, "Post added successfully", result);
};

// update One post content by id using mongoose
const updatePostById = async (req, res) => {
  const postId = req?.params?.id;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { files } = req;
  const { content, privacy } = data;
  //object id validation
  if (!ObjectIdChecker(postId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  if (!content && !files?.single) {
    return sendResponse(res, 400, "Missing required field");
  }
  let updatedData = { content, privacy };
  const folderName = "posts";
  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const image = fileUrls[0];
    updatedData = { ...updatedData, image };
  }
  const result = await Post.updatePostById(postId, updatedData);
  logger.log("info", `Updated post: ${JSON.stringify(result, null, 2)}`);
  return res.json({ success: true, result });
};

// update One post content by id using mongoose
const updatePostPrivacyById = async (req, res) => {
  const postId = req?.params?.id;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { privacy } = data;
  //object id validation
  if (!ObjectIdChecker(postId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  if (!privacy) {
    return sendResponse(res, 400, "Missing required field");
  }
  const result = await Post.updatePostPrivacyById(postId, privacy);
  logger.log("info", `Updated post: ${JSON.stringify(result, null, 2)}`);
  return res.json({ success: true, result });
};

// update One post likes by id using mongoose
const updatePostLikesById = async (req, res) => {
  const postId = req?.params?.id;
  const postedBy = req?.auth?._id;
  //object id validation
  if (!ObjectIdChecker(postId) || !ObjectIdChecker(postedBy)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const result = await Post.updatePostLikesById(postId, postedBy);
  logger.log("info", `Updated post: ${JSON.stringify(result, null, 2)}`);
  return res.json({ success: true, result });
};

// update One post comments by id using mongoose
const updatePostCommentsById = async (req, res) => {
  const postId = req?.params?.id;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { repliedTo, repliedOn, content } = data;
  const postedBy = req?.auth?._id;
  //object id validation
  if (!ObjectIdChecker(postId) || !ObjectIdChecker(postedBy)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  if (!content) {
    return sendResponse(res, 400, "Missing required field");
  }
  const comment = { postedBy, repliedTo, repliedOn, content };
  const result = await Post.updatePostCommentsById(postId, comment);
  logger.log("info", `Updated post: ${JSON.stringify(result, null, 2)}`);
  return res.json({ success: true, result });
};

//delete one post
const deleteOnePostById = async (req, res) => {
  const postId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(postId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  //delete post
  const deletionResult = await Post.deletePostById(postId);
  logger.log("info", deletionResult?.message);
  return sendResponse(res, 200, deletionResult?.message);
};

module.exports = {
  getAllPosts: asyncHandler(getAllPosts),
  getOnePost: asyncHandler(getOnePost),
  getPostsByUserId: asyncHandler(getPostsByUserId),
  getOwnPostsByUser: asyncHandler(getOwnPostsByUser),
  getRelevantPostsForUser: asyncHandler(getRelevantPostsForUser),
  addOnePost: asyncHandler(addOnePost),
  updatePostById: asyncHandler(updatePostById),
  updatePostPrivacyById: asyncHandler(updatePostPrivacyById),
  updatePostLikesById: asyncHandler(updatePostLikesById),
  updatePostCommentsById: asyncHandler(updatePostCommentsById),
  deleteOnePostById: asyncHandler(deleteOnePostById),
};

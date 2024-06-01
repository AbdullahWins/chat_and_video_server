const User = require("../../models/User/UserModel");
const {
  handleFileUpload,
} = require("../../services/fileHandlers/HandleFileUpload");
const {
  sendOTP,
  validateOTP,
} = require("../../services/otpHandlers/HandleOTP");
const { asyncHandler } = require("../../middlewares/AsyncHandler");
const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  hashPassword,
} = require("../../services/encryptionHandlers/HandleBcrypt");
const {
  sendResponse,
} = require("../../services/responseHandlers/HandleResponse");
const {
  ObjectIdChecker,
} = require("../../services/validationHandlers/ObjectIdChecker");

// Login User using mongoose
const loginUser = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email, password } = data;
  if (!email || !password) {
    return sendResponse(res, 400, "Missing required fields");
  }
  const result = await User.login({ email, password });
  logger.log("info", `User logged in: ${email}`);
  return sendResponse(res, 200, "User logged in successfully", result);
};

// Register User using mongoose
const registerUser = async (req, res) => {
  const { username, email, password } = JSON.parse(req?.body?.data);
  if (!username || !email || !password) {
    return sendResponse(res, 400, "Missing required fields");
  }
  const result = await User.register({ username, email, password });
  logger.log("info", `User registered: ${email}`);
  return sendResponse(res, 201, "User registered successfully", result);
};

// Get all Users using mongoose
const getAllUsers = async (req, res) => {
  const users = await User.getAllUsers();
  logger.log("info", `Found ${users?.length} users`);
  return sendResponse(res, 200, "Users retrieved successfully", users);
};

// Get User by id using mongoose
const getOneUser = async (req, res) => {
  const userId = req?.params?.id;
  if (!ObjectIdChecker(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const user = await User.getOneUser({ id: userId });
  logger.log("info", JSON.stringify(user, null, 2));
  return sendResponse(res, 200, "User retrieved successfully", user);
};

// Update User by id using mongoose
const updateUserById = async (req, res) => {
  const id = req?.params?.id;

  if (!ObjectIdChecker(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const { files } = req;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { password, ...additionalData } = data;
  const folderName = "users";
  let updatedData = {};

  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const profileImage = fileUrls[0];
    updatedData = { ...updatedData, profileImage };
  }

  if (files?.multiple) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.multiple,
      folderName,
    });
    const coverImage = fileUrls[0];
    updatedData = { ...updatedData, coverImage };
  }

  if (password) {
    const hashedPassword = await hashPassword(password);
    updatedData = { ...updatedData, password: hashedPassword };
  }

  if (Object.keys(additionalData).length > 0) {
    updatedData = { ...updatedData, ...additionalData };
  }

  logger.log("info", JSON.stringify(updatedData, null, 2));
  const updatedUser = await User.updateUserById({ id, updatedData });
  return sendResponse(res, 200, "User updated successfully", updatedUser);
};

// Send OTP for password reset
const sendPasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email } = data;
  //check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, 404, "User not found");
  }
  const result = await sendOTP({ email });
  if (result?.error) {
    logger.log("error", result?.error);
    return sendResponse(res, 401, result?.error);
  } else {
    logger.log("info", result?.message);
    return sendResponse(res, 200, result?.message);
  }
};

// Validate OTP for password reset
const validatePasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email } = data;
  //check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, 404, "User not found");
  }
  const result = await validateOTP({ email, otp });
  return sendResponse(res, 200, result?.message);
};

// Update User password by OTP
const updateUserPasswordByOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email, newPassword } = data;

  const updatedUser = await User.updatePasswordByOTP({
    email,
    otp,
    newPassword,
  });
  logger.log(
    "info",
    `Password updated successfully for: ${updatedUser?.email}`
  );
  return sendResponse(res, 200, "Password updated successfully", updatedUser);
};

// Update User password by old password
const updateUserPasswordByOldPassword = async (req, res) => {
  const email = req?.params?.email;
  const data = JSON.parse(req?.body?.data);
  const { oldPassword, newPassword } = data;

  const updatedUser = await User.updatePasswordByEmail({
    email,
    oldPassword,
    newPassword,
  });

  return sendResponse(res, 200, "Password updated successfully", updatedUser);
};

// Delete User by id using mongoose
const deleteUserById = async (req, res) => {
  const id = req?.params?.id;

  if (!ObjectIdChecker(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const deletionResult = await User.deleteUserById(id);
  logger.log("info", deletionResult?.message);
  return sendResponse(res, 200, deletionResult?.message);
};

//friends list operations

// Send friend request to user
const sendOneFriendRequest = async (req, res) => {
  const userId = req?.auth?._id;
  const friendId = req?.params?.id;
  if (!ObjectIdChecker(userId) || !ObjectIdChecker(friendId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.sendOneFriendRequest({ userId, friendId });
  logger.log("info", result?.message);
  return sendResponse(res, 200, result?.message, result?.data);
};

//accept friend request
const acceptOneFriendRequest = async (req, res) => {
  const userId = req?.auth?._id;
  const friendId = req?.params?.id;
  if (!ObjectIdChecker(userId) || !ObjectIdChecker(friendId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.acceptOneFriendRequest({ userId, friendId });
  return sendResponse(res, 200, result?.message, result?.data);
};

//cancel or remove friend
const cancelOrRemoveFriend = async (req, res) => {
  const userId = req?.auth?._id;
  const friendId = req?.params?.id;
  if (!ObjectIdChecker(userId) || !ObjectIdChecker(friendId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  const result = await User.cancelOrRemoveFriend({ userId, friendId });
  return sendResponse(res, 200, result?.message, result?.data);
};

// Export all controllers
module.exports = {
  getOneUser: asyncHandler(getOneUser),
  getAllUsers: asyncHandler(getAllUsers),
  updateUserById: asyncHandler(updateUserById),
  sendPasswordResetOTP: asyncHandler(sendPasswordResetOTP),
  validatePasswordResetOTP: asyncHandler(validatePasswordResetOTP),
  updateUserPasswordByOTP: asyncHandler(updateUserPasswordByOTP),
  loginUser: asyncHandler(loginUser),
  registerUser: asyncHandler(registerUser),
  updateUserPasswordByOldPassword: asyncHandler(
    updateUserPasswordByOldPassword
  ),
  deleteUserById: asyncHandler(deleteUserById),
  sendOneFriendRequest: asyncHandler(sendOneFriendRequest),
  acceptOneFriendRequest: asyncHandler(acceptOneFriendRequest),
  cancelOrRemoveFriend: asyncHandler(cancelOrRemoveFriend),
};

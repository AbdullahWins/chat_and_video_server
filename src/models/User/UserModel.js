// models/UserModel.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const {
  UserLoginDTO,
  UserRegisterDTO,
  UserUpdateDTO,
  UserFetchDTO,
  UserPostDTO,
} = require("../../dtos/UserDTO");
const { generateToken } = require("../../services/tokenHandlers/HandleJwt");
const { validateOTP } = require("../../services/otpHandlers/HandleOTP");
const {
  hashPassword,
  comparePasswords,
} = require("../../services/encryptionHandlers/HandleBcrypt");
const {
  friendsListSchema,
  groupsListSchema,
  eventsListSchema,
  favoritesListSchema,
} = require("./UserSubschemas");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const { logger } = require("../../services/logHandlers/HandleWinston");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (value) => {
        //validate email format
        return /\S+@\S+\.\S+/.test(value);
      },
      message: (props) => `${props?.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        //validate password length
        return value.length >= 6;
      },
      message: (props) => `${props?.value} is not a valid password!`,
    },
  },
  fullName: {
    type: String,
    default: "",
  },
  birthDay: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  hometown: {
    type: String,
    default: "",
  },
  currentTown: {
    type: String,
    default: "",
  },
  yearsOfMoving: {
    type: String,
    default: "",
  },
  occupation: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  coverImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  hobbyList: {
    type: [String],
    default: [],
  },
  friendsList: {
    type: [friendsListSchema],
    default: [],
  },
  groupsList: {
    type: [groupsListSchema],
    default: [],
  },
  eventsList: {
    type: [eventsListSchema],
    default: [],
  },
  favoritesList: {
    type: [favoritesListSchema],
    default: [],
  },

  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
  updatedAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

//get all users from the database
userSchema.statics.getAllUsers = async function () {
  try {
    const users = await this.find().populate("friendsList.userId").exec();

    // Sort users by createdAt field in descending order
    users.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform users with DTO
    const usersDTO = users.map((user) => new UserFetchDTO(user));
    return usersDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode || 500, error?.message);
  }
};

//get one user
userSchema.statics.getOneUser = async function ({ id }) {
  try {
    const user = await this.findOne({ _id: id })
      .populate("friendsList.userId")
      .exec();
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    const userDTO = new UserFetchDTO(user);
    return userDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// static method for login
userSchema.statics.login = async function ({ email, password }) {
  try {
    const user = await this.findOne({ email })
      .populate("friendsList.userId")
      .exec();
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    const passwordMatch = await comparePasswords(password, user?.password);
    if (!passwordMatch) {
      throw new CustomError(401, "Invalid password");
    }

    const token = generateToken(user?._id);
    const userDTO = new UserLoginDTO(user);

    const finalResponse = { ...userDTO, accessToken: token };
    return finalResponse;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// static method for registration
userSchema.statics.register = async function ({ username, email, password }) {
  try {
    //check if the user already exists
    const existingUserCheck = await this.findOne({ email })
      .populate("friendsList.userId")
      .exec();
    if (existingUserCheck) {
      throw new CustomError(409, "User already exists");
    }

    //hash the password
    const hashedPassword = await hashPassword(password);

    //create a new User instance
    const newUser = new this({ username, email, password: hashedPassword });

    //save the User to the database
    await newUser.save();

    //generate token
    const token = generateToken(newUser?._id);
    const userDTO = new UserRegisterDTO(newUser);

    const finalResponse = { ...userDTO, accessToken: token };
    return finalResponse;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for updating user data
userSchema.statics.updateUserById = async function ({ id, updateData }) {
  try {
    const updatedUser = await this.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );
    if (!updatedUser) {
      throw new CustomError(404, "User not found");
    }

    //populate friendsList.userId
    await updatedUser.populate("friendsList.userId");

    const userDTO = new UserUpdateDTO(updatedUser);
    return userDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for sending OTP
userSchema.statics.updatePasswordByOTP = async function ({
  email,
  otp,
  newPassword,
}) {
  try {
    // Validate OTP
    const otpStatus = await validateOTP({ email, otp, Model: this });
    if (otpStatus?.error) {
      return { error: otpStatus?.error };
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    const updatedUser = await this.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedUser) {
      throw new CustomError(404, "User not found");
    }
    //populate friendsList.userId
    await updatedUser.populate("friendsList.userId");

    const userDTO = new UserUpdateDTO(updatedUser);
    return userDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for updating password by email
userSchema.statics.updatePasswordByEmail = async function ({
  email,
  oldPassword,
  newPassword,
}) {
  try {
    const user = await this.findOne({ email });

    if (!user) {
      throw new CustomError(404, "User not found");
    }

    const passwordMatch = await comparePasswords(oldPassword, user.password);

    if (!passwordMatch) {
      throw new CustomError(401, "Invalid password");
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await this.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    //populate friendsList.userId
    await updatedUser.populate("friendsList.userId");

    const userDTO = new UserUpdateDTO(updatedUser);
    return userDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

userSchema.statics.deleteUserById = async function (id) {
  try {
    const result = await this.deleteOne({ _id: id });

    if (result?.deletedCount === 0) {
      throw new CustomError(404, "User not found");
    } else {
      return { message: `User deleted successfully with id: ${id}` };
    }
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//friends list operations

// Static method for sending friend request
userSchema.statics.sendOneFriendRequest = async function ({
  userId,
  friendId,
}) {
  try {
    //convert both userId and friendId to string
    userId = userId.toString();
    friendId = friendId.toString();

    // Find the user and friend
    const user = await this.findOne({ _id: userId }).exec();
    const friend = await this.findOne({ _id: friendId }).exec();

    // Check if the user and friend exist
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    if (!friend) {
      throw new CustomError(404, "Friend not found");
    }

    // Check if the user is trying to send a friend request to themselves
    if (userId === friendId) {
      throw new CustomError(
        400,
        "You cannot send a friend request to yourself"
      );
    }

    // Check if the friend request already exists
    const friendRequestExists = user.friendsList.find(
      (friend) => friend?.userId?.toString() === friendId
    );
    const userRequestExists = friend.friendsList.find(
      (friend) => friend?.userId?.toString() === userId
    );

    if (friendRequestExists || userRequestExists) {
      throw new CustomError(409, "Friend request already exists");
    }

    // Prepare the friend request
    user.friendsList.push({ userId: friendId, status: "pending" });
    friend.friendsList.push({ userId: userId, status: "requested" });

    // Save only those who do not have the friend request
    await user.save();
    await friend.save();

    // Return success message
    return { message: "Request sent successfully" };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for accepting friend request
userSchema.statics.acceptOneFriendRequest = async function ({
  userId,
  friendId,
}) {
  try {
    //convert both userId and friendId to string
    userId = userId.toString();
    friendId = friendId.toString();

    // Find the user and friend
    const user = await this.findOne({ _id: userId }).exec();
    const friend = await this.findOne({ _id: friendId }).exec();

    // Check if the user and friend exist
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    if (!friend) {
      throw new CustomError(404, "Friend not found");
    }

    // Check if the user is trying to accept a friend request from themselves
    if (userId === friendId) {
      throw new CustomError(
        400,
        "You cannot accept a friend request from yourself"
      );
    }

    // Check if the friend request exists
    const friendRequest = user?.friendsList?.find(
      (friend) => friend?.userId?.toString() === friendId
    );
    const userRequest = friend.friendsList.find(
      (friend) => friend?.userId?.toString() === userId
    );

    if (!friendRequest || !userRequest) {
      throw new CustomError(404, "Friend request not found");
    }

    // Check if the friend request is pending
    if (friendRequest.status !== "pending") {
      throw new CustomError(400, "Friend request is not pending");
    }

    // Accept the friend request
    friendRequest.status = "accepted";
    userRequest.status = "accepted";

    // Save the changes
    await user.save();
    await friend.save();

    // Return success message
    return { message: "Friend request accepted successfully" };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for canceling or removing friend
userSchema.statics.cancelOrRemoveFriend = async function ({
  userId,
  friendId,
}) {
  try {
    //convert both userId and friendId to string
    userId = userId.toString();
    friendId = friendId.toString();

    // Find the user and friend
    const user = await this.findOne({ _id: userId }).exec();
    const friend = await this.findOne({ _id: friendId }).exec();

    // Check if the user and friend exist
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    if (!friend) {
      throw new CustomError(404, "Friend not found");
    }

    // Check if the user is trying to cancel a friend request to themselves
    if (userId === friendId) {
      throw new CustomError(
        400,
        "You cannot cancel a friend request to yourself"
      );
    }

    // Check if the friend request exists
    const friendRequest = user?.friendsList?.find(
      (friend) => friend?.userId?.toString() === friendId
    );
    const userRequest = friend.friendsList.find(
      (friend) => friend?.userId?.toString() === userId
    );

    if (!friendRequest || !userRequest) {
      throw new CustomError(404, "Friend request not found");
    }

    // Remove the friend request
    user.friendsList = user.friendsList.filter(
      (friend) => friend.userId.toString() !== friendId
    );
    friend.friendsList = friend.friendsList.filter(
      (friend) => friend.userId.toString() !== userId
    );

    // Save the changes
    await user.save();
    await friend.save();

    // Send success message based on the status
    if (friendRequest?.status === "pending") {
      return { message: "Friend request canceled successfully" };
    } else {
      return { message: "Friend removed successfully" };
    }
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for addming a group
userSchema.statics.addAGroupToUser = async function ({ userId, groupId }) {
  try {
    //convert both userId and groupId to string
    userId = userId.toString();
    groupId = groupId.toString();

    // Find the user
    const user = await this.findOne({ _id: userId }).exec();

    // Check if the user exists
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Check if the group already exists
    const groupExists = user?.groupsList?.find(
      (group) => group?.groupId?.toString() === groupId
    );

    if (groupExists) {
      throw new CustomError(409, "Group already exists");
    }

    // Add the group
    user.groupsList.push({ groupId });

    // Save the changes
    await user.save();

    // Return success message
    return { message: "Group added successfully" };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for leaving a group
userSchema.statics.removeAGroupFromUser = async function ({ userId, groupId }) {
  try {
    //convert both userId and groupId to string
    userId = userId.toString();
    groupId = groupId.toString();

    // Find the user
    const user = await this.findOne({ _id: userId }).exec();

    // Check if the user exists
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Check if the group exists
    const groupExists = user?.groupsList?.find(
      (group) => group?.groupId?.toString() === groupId
    );

    if (!groupExists) {
      throw new CustomError(404, "Group not found");
    }

    // Remove the group
    user.groupsList = user?.groupsList?.filter(
      (group) => group?.groupId?.toString() !== groupId
    );

    // Save the changes
    await user.save();

    // Return success message
    return { message: "Group removed successfully" };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;

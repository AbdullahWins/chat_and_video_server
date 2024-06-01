// models/AdminModel.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const {
  AdminLoginDTO,
  AdminRegisterDTO,
  AdminUpdateDTO,
  AdminFetchDTO,
} = require("../../dtos/AdminDTO");
const { generateToken } = require("../../services/tokenHandlers/HandleJwt");
// const { validateOTP } = require("../../services/otpHandlers/HandleOTP");
// const {
//   hashPassword,
//   comparePasswords,
// } = require("../../services/encryptionHandlers/HandleBcrypt");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const {
  hashPassword,
  comparePasswords,
} = require("../../services/encryptionHandlers/HandleBcrypt");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (value) => {
        // Validate email format
        return /\S+@\S+\.\S+/.test(value);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

//get all admins
adminSchema.statics.getAllAdmins = async function () {
  try {
    const admins = await this.find().exec();

    //sort admins by createdAt in descending order
    admins.sort((a, b) => b?.createdAt - a?.createdAt);

    //filter with dto
    const adminsDTO = admins.map((admin) => new AdminFetchDTO(admin));

    return adminsDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get one admin
adminSchema.statics.getOneAdmin = async function ({ id }) {
  try {
    const admin = await this.findById(id).exec();
    if (!admin) {
      throw new CustomError(404, "Admin not found");
    }
    const adminDTO = new AdminFetchDTO(admin);
    return adminDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// static method for login
adminSchema.statics.login = async function ({ email, password }) {
  try {
    const admin = await this.findOne({ email }).exec();
    if (!admin) {
      throw new CustomError(404, "Admin not found");
    }

    const passwordMatch = await comparePasswords(password, admin?.password);
    if (!passwordMatch) {
      throw new CustomError(401, "Invalid password");
    }

    const token = generateToken(admin?._id);
    const adminDTO = new AdminLoginDTO(admin);

    const finalResponse = { ...adminDTO, accessToken: token };
    return finalResponse;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// static method for registration
adminSchema.statics.register = async function ({ fullName, email, password }) {
  try {
    //check if the admin already exists
    const existingAdminCheck = await this.findOne({ email }).exec();
    if (existingAdminCheck) {
      throw new CustomError(401, "Admin already exists");
    }

    //hash the password
    const hashedPassword = await hashPassword(password);

    //create a new admin instance
    const newAdmin = new this({ fullName, email, password: hashedPassword });

    //save the admin to the database
    await newAdmin.save();

    //generate token
    const token = generateToken(newAdmin?._id);
    const adminDTO = new AdminRegisterDTO(newAdmin);

    const finalResponse = { ...adminDTO, accessToken: token };
    return finalResponse;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for updating admin data
adminSchema.statics.updateAdminById = async function ({ id, updateData }) {
  try {
    const updatedAdmin = await this.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedAdmin) {
      throw new CustomError(404, "Admin not found");
    }
    const adminDTO = new AdminUpdateDTO(updatedAdmin);
    return adminDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for sending OTP
adminSchema.statics.updatePasswordByOTP = async function ({
  email,
  otp,
  newPassword,
}) {
  try {
    // Validate OTP
    const otpStatus = await validateOTP({ email, otp, Model: this });
    if (otpStatus.error) {
      throw new CustomError(401, otpStatus.error);
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    const updatedAdmin = await this.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedAdmin) {
      throw new CustomError(404, "Admin not found");
    }
    const adminDTO = new AdminUpdateDTO(updatedAdmin);
    return adminDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

// Static method for updating password by email
adminSchema.statics.updatePasswordByEmail = async function ({
  email,
  oldPassword,
  newPassword,
}) {
  try {
    const admin = await this.findOne({ email });

    if (!admin) {
      throw new CustomError(404, "Admin not found");
    }

    const passwordMatch = await comparePasswords(oldPassword, admin.password);

    if (!passwordMatch) {
      throw new CustomError(401, "Invalid password");
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedAdmin = await this.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    const adminDTO = new AdminUpdateDTO(updatedAdmin);
    return adminDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

adminSchema.statics.deleteAdminById = async function (id) {
  try {
    const result = await this.deleteOne({ _id: id });

    if (result?.deletedCount === 0) {
      throw new CustomError(404, "Admin not found");
    } else {
      return { message: `Admin deleted successfully with id: ${id}` };
    }
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

const mongoose = require("mongoose");
const { logger } = require("../logHandlers/HandleWinston");

const ObjectIdChecker = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    logger.log("error", `Invalid ObjectId: ${id}`);
    return false;
  } else {
    logger.log("info", `Valid ObjectId: ${id}`);
    return true;
  }
};

module.exports = { ObjectIdChecker };

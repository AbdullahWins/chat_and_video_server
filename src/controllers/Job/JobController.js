// Controllers/JobController.js
const { logger } = require("../../services/logHandlers/HandleWinston");
const Job = require("../../models/Job/JobModel");
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

//get all Job using mongoose
const getAllJobs = async (req, res) => {
  //perform query on database
  const jobs = await Job.getAllJobs();
  logger.log("info", `Found ${jobs?.length} jobs`);
  return sendResponse(res, 200, "Fetched all jobs", jobs);
};

//get active Job using mongoose
const getOpenJobs = async (req, res) => {
  //perform query on database
  const jobs = await Job.getOpenJobs();
  logger.log("info", `Found ${jobs?.length} jobs`);
  return sendResponse(res, 200, "Fetched all active jobs", jobs);
};

//get single Job using mongoose
const getOneJob = async (req, res) => {
  const jobId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(jobId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //perform query on database
  const job = await Job.getOneJob(jobId);
  logger.log("info", JSON.stringify(job, null, 2));
  return sendResponse(res, 200, "Job retrieved successfully", job);
};

//get all Job by user using mongoose
const getAllJobsByUser = async (req, res) => {
  const userId = req?.auth?._id;
  if (!userId) {
    return sendResponse(res, 401, "Unauthorized");
  }

  //perform query on database
  const jobs = await Job.getAllJobsByUser(userId);
  logger.log("info", `Found ${jobs?.length} jobs`);
  return sendResponse(res, 200, "Fetched all jobs", jobs);
};

//add new Job using mongoose
const addOneJob = async (req, res) => {
  const {
    post,
    company,
    deadline,
    salary,
    location,
    nature,
    context,
    responsibilities,
    education,
    experience,
  } = JSON.parse(req?.body?.data);
  if (
    !post ||
    !company ||
    !deadline ||
    !salary ||
    !location ||
    !nature ||
    !context ||
    !responsibilities ||
    !education ||
    !experience
  ) {
    sendResponse(res, 400, "Missing required field");
  }

  //validate authority from middleware authentication
  const postedBy = req?.auth?._id;
  if (!postedBy) {
    return sendResponse(res, 401, "Unauthorized");
  }

  //create new job object
  let updatedData = {
    postedBy,
    post,
    company,
    deadline,
    salary,
    location,
    nature,
    context,
    responsibilities,
    education,
    experience,
  };

  //add new job
  const result = await Job.addOneJob(updatedData);
  logger.log("info", `Posted a job: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 201, "Job posted successfully", result);
};

//add job applications
const addOneApplication = async (req, res) => {
  const userId = req?.auth?._id;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { jobId, coverLetter } = data;
  const { files } = req;

  //object id validation
  if (!ObjectIdChecker(jobId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }
  //check if required fields are present
  if (!coverLetter || !jobId || !userId || !files?.single) {
    return sendResponse(res, 400, "Missing required field");
  }

  let updatedData = { applicant: userId, coverLetter: coverLetter };
  //upload the resume file
  const folderName = "jobApplicationResumes";
  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const resume = fileUrls[0];
    updatedData = { ...updatedData, resume: resume };
  }

  //add job application
  const result = await Job.addOneApplication(jobId, updatedData);
  logger.log("info", `Applied for a job: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 201, "Job application successful", result);
};

// update One job status by id using mongoose
const updateJobById = async (req, res) => {
  const jobId = req?.params?.id;
  const { status } = req?.body?.data ? JSON.parse(req?.body?.data) : {};

  //object id validation
  if (!ObjectIdChecker(jobId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  if (!status) {
    return sendResponse(res, 400, "Missing required field");
  }

  //update job
  let updatedData = { status };
  const result = await Job.updateJobById(jobId, updatedData);
  logger.log("info", `Updated job: ${JSON.stringify(result, null, 2)}`);
  return sendResponse(res, 200, "Job updated successfully", result);
};

//delete one job
const deleteOneJobById = async (req, res) => {
  const jobId = req?.params?.id;
  //object id validation
  if (!ObjectIdChecker(jobId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  //delete job
  const deletionResult = await Job.deleteOneJob(jobId);
  logger.log("info", deletionResult?.message);
  return sendResponse(res, 200, deletionResult?.message);
};

module.exports = {
  getAllJobs: asyncHandler(getAllJobs),
  getOpenJobs: asyncHandler(getOpenJobs),
  getAllJobsByUser: asyncHandler(getAllJobsByUser),
  getOneJob: asyncHandler(getOneJob),
  addOneJob: asyncHandler(addOneJob),
  addOneApplication: asyncHandler(addOneApplication),
  updateJobById: asyncHandler(updateJobById),
  deleteOneJobById: asyncHandler(deleteOneJobById),
};

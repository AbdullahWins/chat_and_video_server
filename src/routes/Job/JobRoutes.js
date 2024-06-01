const JobRouter = require("express").Router();
const { authorizeRequest } = require("../../middlewares/AuthorizeRequest");
const {
  getAllJobs,
  getOpenJobs,
  getAllJobsByUser,
  getOneJob,
  addOneJob,
  addOneApplication,
  updateJobById,
  deleteOneJobById,
} = require("../../controllers/Job/JobController");

JobRouter.get("/all", authorizeRequest, getAllJobs);
JobRouter.get("/open", authorizeRequest, getOpenJobs);
JobRouter.get("/get-own-jobs", authorizeRequest, getAllJobsByUser);
JobRouter.get("/find/:id", authorizeRequest, getOneJob);
JobRouter.post("/add", authorizeRequest, addOneJob);
JobRouter.post("/apply", authorizeRequest, addOneApplication);
JobRouter.patch("/update/:id", authorizeRequest, updateJobById);
JobRouter.delete("/delete/:id", authorizeRequest, deleteOneJobById);

module.exports = JobRouter;

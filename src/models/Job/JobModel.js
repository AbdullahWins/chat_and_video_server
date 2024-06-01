// job model
const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { JobDTO, JobFetchDTO } = require("../../dtos/JobDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const { ENUM_JOB_STATUS } = require("../../constants/JobConstants");

const jobApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

const jobSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  deadline: {
    type: Number,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  nature: {
    type: String,
    required: true,
  },
  context: {
    type: String,
    required: true,
  },
  responsibilities: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ENUM_JOB_STATUS,
    default: "open",
  },
  applications: {
    type: [jobApplicationSchema],
    default: [],
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

//get all jobs with user populated and filtered with dto
jobSchema.statics.getAllJobs = async function () {
  try {
    // Find all jobs and populate the userId field while excluding the password field
    const jobs = await this.find()
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "applications.applicant",
        // model: "JobApplication",
        // select: "-password",
        options: { lean: true },
      });

    if (jobs?.length === 0) {
      throw new CustomError(404, "No jobs found");
    }

    //sort jobs by date created in descending order
    jobs.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each job
    const transformedJobs = jobs.map((job) => {
      const jobDTO = new JobDTO(job);
      return jobDTO;
    });

    // Return transformed jobs
    return transformedJobs;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get active jobs with user populated and filtered with dto
jobSchema.statics.getOpenJobs = async function () {
  try {
    // Find all active jobs and populate the userId field while excluding the password field
    const jobs = await this.find({ status: "open" })
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "applications.applicant",
        // model: "JobApplication",
        // select: "-password",
        options: { lean: true },
      });

    if (jobs?.length === 0) {
      throw new CustomError(404, "No open jobs found");
    }

    //sort jobs by date created in descending order
    jobs.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each job
    const transformedJobs = jobs.map((job) => {
      const jobDTO = new JobFetchDTO(job);
      return jobDTO;
    });

    // Return transformed jobs
    return transformedJobs;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get all jobs by user with user and job populated and filtered with dto

jobSchema.statics.getAllJobsByUser = async function (userId) {
  try {
    // Find all jobs by user and populate the userId field while excluding the password field
    const jobs = await this.find({ postedBy: userId })
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "applications.applicant",
        // model: "JobApplication",
        // select: "-password",
        options: { lean: true },
      });

    if (jobs?.length === 0) {
      throw new CustomError(404, "No jobs found for this user");
    }

    //sort jobs by date created in descending order
    jobs.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each job
    const transformedJobs = jobs.map((job) => {
      const jobDTO = new JobDTO(job);
      return jobDTO;
    });

    // Return transformed jobs
    return transformedJobs;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get one job with user and job populated and filtered with dto
jobSchema.statics.getOneJob = async function (jobId) {
  try {
    // Find one job and populate the userId field while excluding the password field
    const job = await this.findById(jobId)
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "applications.applicant",
        // model: "JobApplication",
        // select: "-password",
        options: { lean: true },
      });

    if (!job) {
      throw new CustomError(404, "No job found");
    }

    // Transform user object into DTO format
    const jobDTO = new JobFetchDTO(job);

    // Return transformed job
    return jobDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//add new job with user and job populated and dto
jobSchema.statics.addOneJob = async function (data) {
  try {
    const {
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
    } = data;
    const job = new this({
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
    });

    // Save job
    const result = await job.save();

    if (!result) {
      throw new CustomError(500, "Failed to add job");
    }

    // Populate the postedBy and joinees.joinee fields
    const populatedJob = await this.findById(result._id)
      .populate({
        path: "postedBy",
        select: "-password", // Exclude fields you don't want to return
        options: { lean: true },
      })
      .populate({
        path: "applications.applicant",
        // model: "JobApplication",
        // select: "-password",
        options: { lean: true },
      })
      .exec();

    // Transform job object into DTO format
    const jobDTO = new JobDTO(populatedJob);

    // Return transformed job
    return jobDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//update job with user and job populated and dto
jobSchema.statics.updateJobById = async function (jobId, data) {
  try {
    //check if the value of status is valid
    // if (!ENUM_JOB_STATUS[status]) {
    //   throw new CustomError(400, "Invalid status value");
    // }
    const updatedJob = await this.findByIdAndUpdate(
      jobId,
      { ...data },
      { new: true }
    )
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "applications.applicant",
        // model: "JobApplication",
        // select: "-password",
        options: { lean: true },
      });

    //process job using dto
    if (!updatedJob) {
      throw new CustomError(404, "No job found");
    }

    // Transform job object into DTO format
    const jobDTO = new JobDTO(updatedJob);
    return jobDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//delete one job
jobSchema.statics.deleteOneJob = async function (jobId) {
  try {
    //to perform multiple filters at once
    const filter = {
      _id: jobId,
    };

    const result = await this.deleteOne(filter);
    if (result?.deletedCount === 0) {
      throw new CustomError(404, "No job found");
    }
    return { message: `Job deleted successfully with id: ${jobId}` };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//add application to job
jobSchema.statics.addOneApplication = async function (jobId, data) {
  try {
    const { applicant, resume, coverLetter } = data;
    const job = await this.findById(jobId);

    if (!job) {
      throw new CustomError(404, "No job found");
    }

    //check if application already applied
    const applicationExists = job?.applications?.find(
      (application) =>
        application?.applicant?.toString() === applicant?.toString()
    );
    if (applicationExists) {
      throw new CustomError(400, "Application already exists");
    }

    const application = {
      applicant,
      resume,
      coverLetter,
    };

    job.applications.push(application);
    const result = await job.save();

    if (!result) {
      throw new CustomError(500, "Failed to add application");
    }

    // Transform job object into DTO format
    const jobDTO = new JobFetchDTO(result);
    return jobDTO;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;

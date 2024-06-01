//Job DTO
const { UserJobDTO } = require("./UserDTO");

class JobApplicationDTO {
  constructor(application) {
    this._id = application?._id || null;
    this.applicant = application?.applicant
      ? new UserJobDTO(application.applicant)
      : null;
    this.resume = application?.resume || "";
    this.coverLetter = application?.coverLetter || "";
    this.createdAt = application?.createdAt || null;
  }
}

class JobDTO {
  constructor(post) {
    this._id = post?._id || null;
    this.postedBy = post?.postedBy ? new UserJobDTO(post.postedBy) : null;
    this.post = post?.post || "";
    this.company = post?.company || "";
    this.deadline = post?.deadline || "";
    this.salary = post?.salary || "";
    this.location = post?.location || "";
    this.nature = post?.nature || "";
    this.content = post?.content || "";
    this.responsibilities = post?.responsibilities || "";
    this.education = post?.education || "";
    this.experience = post?.experience || "";
    this.status = post?.status || "";
    this.applications = post?.applications.map(
      (application) => new JobApplicationDTO(application)
    );
    this.createdAt = post?.createdAt || null;
  }
}

class JobFetchDTO {
  constructor(post) {
    this._id = post?._id || null;
    this.postedBy = post?.postedBy ? new UserJobDTO(post.postedBy) : null;
    this.post = post?.post || "";
    this.company = post?.company || "";
    this.deadline = post?.deadline || "";
    this.salary = post?.salary || "";
    this.location = post?.location || "";
    this.nature = post?.nature || "";
    this.content = post?.content || "";
    this.responsibilities = post?.responsibilities || "";
    this.education = post?.education || "";
    this.experience = post?.experience || "";
    this.status = post?.status || "";
    this.createdAt = post?.createdAt || null;
  }
}

module.exports = { JobDTO, JobFetchDTO };

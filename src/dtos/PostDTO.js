//Post DTOs

const { UserPostDTO } = require("./UserDTO");

class PostDTO {
  constructor(post) {
    this._id = post?._id || null;
    this.postedBy = post?.postedBy ? new UserPostDTO(post.postedBy) : null;
    this.content = post?.content || "";
    this.privacy = post?.privacy || "";
    this.createdAt = post?.createdAt || null;
  }
}

class PostLikeDTO {
  constructor(like) {
    this.postedBy = like?.postedBy ? new UserPostDTO(like.postedBy) : null;
  }
}

class PostCommentDTO {
  constructor(comment) {
    this._id = comment?._id || null;
    this.postedBy = comment?.postedBy
      ? new UserPostDTO(comment.postedBy)
      : null;
    this.repliedTo = comment?.repliedTo
      ? new UserPostDTO(comment.repliedTo)
      : null;
    this.repliedOn = comment?.repliedOn || "";
    this.content = comment?.content || "";
    this.createdAt = comment?.createdAt || null;
  }
}

class FlaggedPostDTO {
  constructor(post) {
    this._id = post?._id || null;
    this.postId = post?.postId ? new PostDTO(post.postId) : null;
    this.flaggedBy = post?.flaggedBy ? new UserPostDTO(post.flaggedBy) : null;
    this.subject = post?.subject || "";
    this.description = post?.description || "";
    this.status = post?.status || "";
    this.createdAt = post?.createdAt || null;
  }
}

module.exports = { PostLikeDTO, PostCommentDTO, FlaggedPostDTO };

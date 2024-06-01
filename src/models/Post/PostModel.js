// models/Post.js
const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { ENUM_POST_PRIVACY } = require("../../constants/PostConstants");
const { postLikeSchema, postCommentSchema } = require("./PostSubschemas");
const { PostCommentDTO, PostLikeDTO } = require("../../dtos/PostDTO");
const { UserPostDTO } = require("../../dtos/UserDTO");
const {
  CustomError,
} = require("../../services/responseHandlers/HandleResponse");
const User = require("../User/UserModel");

const postSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  privacy: {
    type: String,
    enum: ENUM_POST_PRIVACY,
    default: "public",
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  likes: {
    type: [postLikeSchema],
    default: [],
  },
  comments: {
    type: [postCommentSchema],
    default: [],
  },
  createdAt: {
    type: Number,
    default: () => Timekoto(),
  },
});

// Define a static method to get all posts
postSchema.statics.getAllPosts = async function () {
  try {
    // Find all posts and populate the postedBy field while excluding the password field
    const posts = await this.find()
      .populate({
        path: "postedBy",
        // model: "User",
        // select: "-password",
        options: { lean: true },
      })
      .populate({
        path: "likes.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.repliedTo",
        options: { lean: true },
      });

    if (posts?.length === 0) {
      throw new CustomError(404, "No posts found");
    }

    //sort comments by date created in descending order
    posts.forEach((post) => {
      post?.comments?.sort((a, b) => b?.createdAt - a?.createdAt);
    });

    //sort posts by date created in descending order
    posts.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each post
    const transformedPosts = posts.map((post) => {
      const userDTO = new UserPostDTO(post?.postedBy);
      // Transform likes array into DTO format
      const likesDTO = post.likes.map((like) => new PostLikeDTO(like));
      // Transform comments array into DTO format
      const commentsDTO = post.comments.map(
        (comment) => new PostCommentDTO(comment)
      );
      const populatedPost = {
        ...post.toObject(),
        postedBy: userDTO,
        likes: likesDTO,
        comments: commentsDTO,
      };

      return populatedPost;
    });
    // Return transformed posts
    return transformedPosts;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get posts by userId
postSchema.statics.getPostsByUserId = async function (userId) {
  try {
    // Find all posts by userId and populate the postedBy field while excluding the password field
    const posts = await this.find({ postedBy: userId })

      .populate({
        path: "postedBy",
        options: { lean: true },
      })
      .populate({
        path: "likes.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.repliedTo",
        options: { lean: true },
      });

    if (posts?.length === 0) {
      throw new CustomError(404, "No posts found");
    }

    //sort comments by date created in descending order
    posts.forEach((post) => {
      post?.comments?.sort((a, b) => b?.createdAt - a?.createdAt);
    });

    //sort posts by date created in descending order
    posts.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each post
    const transformedPosts = posts.map((post) => {
      const userDTO = new UserPostDTO(post?.postedBy);
      // Transform likes array into DTO format
      const likesDTO = post.likes.map((like) => new PostLikeDTO(like));
      // Transform comments array into DTO format
      const commentsDTO = post.comments.map(
        (comment) => new PostCommentDTO(comment)
      );
      const populatedPost = {
        ...post.toObject(),
        postedBy: userDTO,
        likes: likesDTO,
        comments: commentsDTO,
      };

      return populatedPost;
    });
    // Return transformed posts
    return transformedPosts;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get posts that user can see (all public posts and friends post only if the given user is a friend of the post owner)
postSchema.statics.getRelevantPostsForUser = async function (userId) {
  try {
    const user = await User.findById(userId).populate("friendsList").exec();
    if (!user) {
      throw new CustomError(404, "User not found");
    }
    //getting the ids of the friends of the user with status accepted
    const friendsIds = user?.friendsList
      ?.filter((friend) => friend?.status === "accepted")
      .map((friend) => friend?.userId?._id);

    const posts = await Post.find({
      $or: [
        { privacy: "public" },
        { privacy: "friends", postedBy: { $in: friendsIds } },
      ],
    })
      .populate({
        path: "postedBy",
        options: { lean: true },
      })
      .populate({
        path: "likes.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.repliedTo",
        options: { lean: true },
      })
      .exec();

    if (posts?.length === 0) {
      throw new CustomError(404, "No posts found");
    }

    //exclude own posts from the list
    const filteredPosts = posts.filter(
      (post) => post?.postedBy?._id !== userId
    );

    //sort comments by date created in descending order
    filteredPosts.forEach((post) => {
      post?.comments?.sort((a, b) => b?.createdAt - a?.createdAt);
    });

    //sort posts by date created in descending order
    filteredPosts.sort((a, b) => b?.createdAt - a?.createdAt);

    // Transform user objects into DTO format for each post
    const transformedPosts = filteredPosts.map((post) => {
      const userDTO = new UserPostDTO(post?.postedBy);
      // Transform likes array into DTO format
      const likesDTO = post.likes.map((like) => new PostLikeDTO(like));
      // Transform comments array into DTO format
      const commentsDTO = post.comments.map(
        (comment) => new PostCommentDTO(comment)
      );
      const populatedPost = {
        ...post.toObject(),
        postedBy: userDTO,
        likes: likesDTO,
        comments: commentsDTO,
      };

      return populatedPost;
    });
    // Return transformed posts

    return transformedPosts;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//get post by id
postSchema.statics.getPostByPostId = async function (postId) {
  try {
    // Populate the postedBy field and exclude the password field
    const post = await this.findById(postId)
      .populate({
        path: "postedBy",
        options: { lean: true },
      })
      .populate({
        path: "likes.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.repliedTo",
        options: { lean: true },
      });

    if (!post) {
      throw new CustomError(404, "Post not found");
    }

    // Transform user object into DTO format
    const userDTO = new UserPostDTO(post?.postedBy);

    // Transform likes array into DTO format
    const likesDTO = post?.likes?.map((like) => new PostLikeDTO(like));

    // Transform comments array into DTO format
    const commentsDTO = post.comments.map(
      (comment) => new PostCommentDTO(comment)
    );

    const populatedPost = {
      ...post.toObject(),
      postedBy: userDTO,
      likes: likesDTO,
      comments: commentsDTO,
    };

    return populatedPost;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//create a new student
postSchema.statics.createNewPost = async function (post) {
  try {
    const newPost = new this(post);
    const savedPost = await newPost.save();
    // Populate the postedBy field for the saved post
    await savedPost.populate("postedBy");

    // Transform user object into DTO format
    const userDTO = new UserPostDTO(savedPost?.postedBy);

    // Return the saved post with transformed postedBy

    const finalResponse = {
      ...savedPost.toObject(),
      postedBy: userDTO,
    };
    return finalResponse;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//update post by id
postSchema.statics.updatePostById = async function (postId, post) {
  try {
    const { content, image, privacy } = post;
    // Construct update object with available fields
    const updateData = {};
    if (content) {
      updateData.content = content;
    }
    if (image) {
      updateData.image = image;
    }
    if (privacy) {
      //check if the privacy value valid
      if (ENUM_POST_PRIVACY[privacy] === undefined) {
        throw new CustomError(400, "Invalid privacy value");
      }
      updateData.privacy = privacy;
    }
    // Find and update the post by id
    const updatedPost = await this.findByIdAndUpdate(
      postId,
      { $set: updateData },
      { new: true }
    )
      .populate({
        path: "postedBy",
        options: { lean: true },
      })
      .populate({
        path: "likes.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.repliedTo",
        options: { lean: true },
      });

    // Transform user object into DTO format
    const userDTO = new UserPostDTO(updatedPost?.postedBy);

    // Transform likes array into DTO format
    const likesDTO = updatedPost?.likes?.map((like) => new PostLikeDTO(like));

    // Transform comments array into DTO format
    const commentsDTO = updatedPost?.comments?.map(
      (comment) => new PostCommentDTO(comment)
    );

    const populatedPost = {
      ...updatedPost.toObject(),
      postedBy: userDTO,
      likes: likesDTO,
      comments: commentsDTO,
    };

    return populatedPost;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//update post content by id
postSchema.statics.updatePostPrivacyById = async function (postId, privacy) {
  try {
    //check if the privacy value valid
    if (ENUM_POST_PRIVACY[privacy] === undefined) {
      throw new CustomError(400, "Invalid privacy value");
    }
    //check if the post exists
    const post = await this.findById(postId);
    if (!post) {
      throw new CustomError(404, "Post not found");
    }
    // Find and update the post by id
    const updatedPost = await this.findByIdAndUpdate(
      postId,
      { $set: { privacy } },
      { new: true }
    )
      .populate({
        path: "postedBy",
        options: { lean: true },
      })
      .populate({
        path: "likes.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.repliedTo",
        options: { lean: true },
      });

    // Transform user object into DTO format
    const userDTO = new UserPostDTO(updatedPost?.postedBy);

    // Transform likes array into DTO format
    const likesDTO = updatedPost?.likes?.map((like) => new PostLikeDTO(like));

    // Transform comments array into DTO format
    const commentsDTO = updatedPost?.comments?.map(
      (comment) => new PostCommentDTO(comment)
    );

    const populatedPost = {
      ...updatedPost?.toObject(),
      postedBy: userDTO,
      likes: likesDTO,
      comments: commentsDTO,
    };

    return populatedPost;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//update post likes by id
postSchema.statics.updatePostLikesById = async function (postId, postedBy) {
  try {
    // Check if the user has already liked the post
    const post = await this.findById(postId);
    if (!post) {
      throw new CustomError(404, "Post not found");
    }
    const likedIndex = post?.likes?.findIndex((like) =>
      like?.postedBy?.equals(postedBy)
    );

    // Find the post by id and update the likes array
    let updatedPost;
    if (likedIndex !== -1) {
      // User has already liked the post, so remove the like
      updatedPost = await this.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: { postedBy } },
        },
        { new: true }
      );
    } else {
      // User hasn't liked the post, so add the like
      updatedPost = await this.findByIdAndUpdate(
        postId,
        {
          $addToSet: { likes: { postedBy } },
        },
        { new: true }
      );
    }

    // Populate the updated post
    updatedPost = await this.findById(postId)
      .populate({
        path: "postedBy",
        options: { lean: true },
      })
      .populate({
        path: "likes.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.repliedTo",
        options: { lean: true },
      });

    // Transform user object into DTO format
    const userDTO = new UserPostDTO(updatedPost?.postedBy);

    // Transform likes array into DTO format
    const likesDTO = updatedPost?.likes?.map((like) => new PostLikeDTO(like));

    // Transform comments array into DTO format
    const commentsDTO = updatedPost?.comments?.map(
      (comment) => new PostCommentDTO(comment)
    );

    const populatedPost = {
      ...updatedPost?.toObject(),
      postedBy: userDTO,
      likes: likesDTO,
      comments: commentsDTO,
    };

    return populatedPost;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//update post comments by id
postSchema.statics.updatePostCommentsById = async function (postId, comment) {
  try {
    //check if the post exists
    const post = await this.findById(postId);
    if (!post) {
      throw new CustomError(404, "Post not found");
    }
    console.log("comment", comment);
    // Find and update the post by id
    const updatedPost = await this.findByIdAndUpdate(
      postId,
      {
        $push: { comments: comment },
      },
      { new: true }
    )
      .populate({
        path: "postedBy",
        options: { lean: true },
      })
      .populate({
        path: "likes.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.postedBy",
        options: { lean: true },
      })
      .populate({
        path: "comments.repliedTo",
        options: { lean: true },
      });

    // Transform user object into DTO format
    const userDTO = new UserPostDTO(updatedPost?.postedBy);

    // Transform likes array into DTO format
    const likesDTO = updatedPost?.likes?.map((like) => new PostLikeDTO(like));

    // Transform comments array into DTO format
    const commentsDTO = updatedPost?.comments?.map(
      (comment) => new PostCommentDTO(comment)
    );

    const populatedPost = {
      ...updatedPost.toObject(),
      postedBy: userDTO,
      likes: likesDTO,
      comments: commentsDTO,
    };

    return populatedPost;
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

//delete post by id
postSchema.statics.deletePostById = async function (postId) {
  try {
    //to perform multiple filters at once
    const filter = {
      _id: postId,
    };
    // Find and delete the post by id
    const deletedPost = await this.findByIdAndDelete(filter);
    if (!deletedPost) {
      throw new CustomError(404, "Post not found");
    }
    return { message: `Post deleted successfully with id: ${postId}` };
  } catch (error) {
    throw new CustomError(error?.statusCode, error?.message);
  }
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;

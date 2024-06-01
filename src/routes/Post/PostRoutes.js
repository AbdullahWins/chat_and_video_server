const PostRouter = require("express").Router();
const { authorizeRequest } = require("../../middlewares/AuthorizeRequest");

const {
  getAllPosts,
  getOnePost,
  getPostsByUserId,
  getRelevantPostsForUser,
  getOwnPostsByUser,
  addOnePost,
  updatePostById,
  updatePostPrivacyById,
  updatePostLikesById,
  updatePostCommentsById,
  deleteOnePostById,
} = require("../../controllers/Post/PostController");

PostRouter.get("/all", authorizeRequest, getAllPosts);
PostRouter.get("/find/:id", authorizeRequest, getOnePost);
PostRouter.get("/find-by-user/:id", authorizeRequest, getPostsByUserId);
PostRouter.get(
  "/find-relevent-posts",
  authorizeRequest,
  getRelevantPostsForUser
);
PostRouter.get("/find-own-posts", authorizeRequest, getOwnPostsByUser);
PostRouter.post("/add", authorizeRequest, addOnePost);
PostRouter.patch("/update-post/:id", authorizeRequest, updatePostById);
PostRouter.patch(
  "/update-privacy/:id",
  authorizeRequest,
  updatePostPrivacyById
);
PostRouter.patch("/update-likes/:id", authorizeRequest, updatePostLikesById);
PostRouter.patch(
  "/update-comments/:id",
  authorizeRequest,
  updatePostCommentsById
);
PostRouter.delete("/delete/:id", authorizeRequest, deleteOnePostById);

module.exports = PostRouter;

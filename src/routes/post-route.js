const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");
const postController = require("../controllers/post-controller");
const likeController = require("../controllers/like-controller");

router.post(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("image"),
  postController.createPost
);

router.get(
  "/friend",
  authenticateMiddleware,
  postController.getAllPostIncludeFriendPost
);

router.post("/:postId/like", authenticateMiddleware, likeController.toggleLike);

module.exports = router;

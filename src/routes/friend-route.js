const express = require("express");

const friendMiddleware = require("../controllers/friend-controller");
const authenticateMiddleware = require("../middlewares/authenticate");

const router = express.Router();

router.post(
  "/:receiverId",
  authenticateMiddleware,
  friendMiddleware.requestFriend
);

router.patch(
  "/:requesterId",
  authenticateMiddleware,
  friendMiddleware.acceptFriend
);

router.delete(
  "/:requesterId/reject",
  authenticateMiddleware,
  friendMiddleware.rejectRequest
);

router.delete(
  "/:receiverId/cancel",
  authenticateMiddleware,
  friendMiddleware.cancelRequest
);

router.delete(
  "/:friendId/unfriend",
  authenticateMiddleware,
  friendMiddleware.unfriend
);

module.exports = router;

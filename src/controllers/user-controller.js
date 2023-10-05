const fs = require("fs/promises");
const cloudinary = require("../config/cloudinary");
const prisma = require("../model/prisma");
const { upload } = require("../utils/cloudinary-service");
const createError = require("../utils/create-error");
const { checkIdSchema } = require("../validators/user-validator");
const {
  AUTH_USER,
  UNKNOWN,
  STATUS_ACCEPTED,
  FRIEND,
  REQUESTER,
  RECEIVER,
} = require("../config/constants");

const getTargetUserStatusWithAuthUser = async (targetUserId, authUserId) => {
  if (targetUserId === authUserId) return AUTH_USER;

  const relationship = await prisma.friend.findFirst({
    where: {
      OR: [
        { requesterId: targetUserId, receiverId: authUserId },
        { requesterId: authUserId, receiverId: targetUserId },
      ],
    },
  });
  if (!relationship) return UNKNOWN;
  if (relationship.status === STATUS_ACCEPTED) return FRIEND;
  if (relationship.requesterId === authUserId) return REQUESTER;
  return RECEIVER;
};

const getTargetUserFriend = async (targetUserId) => {
  const relationships = await prisma.friend.findMany({
    where: {
      status: STATUS_ACCEPTED,
      OR: [{ requesterId: targetUserId }, { receiverId: targetUserId }],
    },
    select: {
      receiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          profileImage: true,
          coverImage: true,
        },
      },
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          profileImage: true,
          coverImage: true,
        },
      },
    },
  });
  const friends = relationships.map((el) =>
    el.requester.id === targetUserId ? el.receiver : el.requester
  );
  friends.sort(() => Math.random() - 0.5);
  return friends;
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(createError("Image not found", 400));
    }
    const response = {};
    if (req.files.profileImage) {
      const profileImage = await upload(req.files.profileImage[0].path);
      response.profileImage = profileImage;
      await prisma.user.update({
        data: {
          profileImage,
        },
        where: {
          id: req.user.id,
        },
      });
    }
    if (req.files.coverImage) {
      const coverImage = await upload(req.files.coverImage[0].path);
      response.coverImage = coverImage;
      await prisma.user.update({
        data: {
          coverImage,
        },
        where: {
          id: req.user.id,
        },
      });
    }

    res.status(200).json(response);
  } catch (err) {
    next(err);
  } finally {
    if (req.files.profileImage) {
      fs.unlink(req.files.profileImage[0].path);
    }
    if (req.files.coverImage) {
      fs.unlink(req.files.coverImage[0].path);
    }
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { value, error } = checkIdSchema("userId").validate(req.params);
    if (error) {
      return next(error);
    }
    const user = await prisma.user.findUnique({
      where: {
        id: value.userId,
      },
    });
    let status = null;
    let friends = null;
    if (user) {
      delete user.password;
      status = await getTargetUserStatusWithAuthUser(value.userId, req.user.id);
      friends = await getTargetUserFriend(value.userId);
    }
    res.status(200).json({ user, status, friends });
  } catch (err) {
    return next(err);
  }
};

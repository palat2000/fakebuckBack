const fs = require("fs/promises");
const cloudinary = require("../config/cloudinary");
const prisma = require("../model/prisma");
const { upload } = require("../utils/cloudinary-service");
const createError = require("../utils/create-error");
const { checkUserIdSchema } = require("../validators/user-validator");

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
    const { value, error } = checkUserIdSchema.validate(req.params);
    console.log(value);
    if (error) {
      return next(error);
    }
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });
    if (user) {
      delete user.password;
    }
    res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

exports.requestFriend = async (req, res, next) => {
  try {
    const requesterId = +req.user.id;
    const receiverId = +req.params.receiverId;
    const response = await prisma.friend.create({
      data: {
        status: "PENDING",
        receiverId,
        requesterId,
      },
    });
    console.log(response);
    res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

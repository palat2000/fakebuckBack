const prisma = require("../model/prisma");
const createError = require("../utils/create-error");
const { checkPostIdSchema } = require("../validators/post-validator");

exports.toggleLike = async (req, res, next) => {
  try {
    const { value, error } = checkPostIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const existPost = await prisma.post.findUnique({
      where: {
        id: value.postId,
      },
    });
    if (!existPost) {
      return next(createError("post does not exist", 400));
    }
    const existLike = await prisma.like.findFirst({
      where: {
        postId: value.postId,
        userId: req.user.id,
      },
    });
    if (existLike) {
      await prisma.like.delete({
        where: {
          id: existLike.id,
          userId: req.user.id,
        },
      });
      const post = await prisma.post.update({
        data: {
          totalLike: {
            decrement: 1,
          },
        },
        where: {
          id: value.postId,
        },
        include: {
          likes: {
            select: {
              userId: true,
            },
          },
        },
      });
      return res.status(200).json({ post });
    }
    await prisma.like.create({
      data: {
        postId: value.postId,
        userId: req.user.id,
      },
    });
    const post = await prisma.post.update({
      data: {
        totalLike: {
          increment: 1,
        },
      },
      where: {
        id: value.postId,
      },
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });
    return res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

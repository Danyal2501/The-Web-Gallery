import { Image } from "../models/image.js";
import { Op } from "sequelize";
import { Comment } from "../models/comment.js";
import { User } from "../models/user.js";
import { Router } from "express";
import multer from "multer";
import path from "path";
import { isAuthenticated } from "../middleware/auth.js";

export const imagesRouter = Router();
const upload = multer({ dest: "uploads/" });

imagesRouter.post(
  "/",
  isAuthenticated,
  upload.single("file"),
  async function (req, res, next) {
    if (!req.body.title || !req.file){
        return res.status(400).json({ errors: "Missing parameters" });
      }
    const title = req.body.title;
    const name = req.session.user.username;
    const file = req.file;
    let image = await Image.create({
      title: title,
      author: name,
      file: JSON.stringify(file),
      UserId: req.session.user.id,
    }); // userId refers to user
    return res.json(image);
  }
);

imagesRouter.get("", isAuthenticated, async function (req, res, next) {
  if (!req.query.incr || !req.query.image || !req.query.user){
    return res.status(400).json({ errors: "Missing parameters" });
  }
  const increment = parseInt(req.query.incr);
  const newId = parseInt(req.query.image) + increment;
  const userId = parseInt(req.query.user);
  let operator = Op.eq;
  let orderBy = "ASC";
  if (increment === -1) {
    orderBy = "DESC";
    operator = Op.lte;
  } else if (increment === 1) {
    operator = Op.gte;
  }
  let images = await Image.findOne({
    where: {
      id: {
        [operator]: newId,
      },
      UserId: {
        [Op.eq]: userId,
      },
    },
    order: [["id", orderBy]],
  });

  if (!images) {
    images = await Image.findOne({
      where: {
        UserId: {
          [Op.eq]: userId,
        },
      },
      order: [["id", orderBy]],
    });
  }
  return res.json(images);
});

imagesRouter.get("/gallery", isAuthenticated, async function (req, res, next) {
  if (!req.query.incr || !req.query.user){
    return res.status(400).json({ errors: "Missing parameters" });
    }
  const increment = parseInt(req.query.incr);
  const newId = parseInt(req.query.user) + increment;
  let operator = Op.eq;
  let orderBy = "ASC";
  if (increment === -1) {
    orderBy = "DESC";
    operator = Op.lte;
  } else if (increment === 1) {
    operator = Op.gte;
  }
  let user = await User.findOne({
    where: {
      id: {
        [operator]: newId,
      },
    },
    order: [["id", orderBy]],
  });

  if (!user) {
    user = await User.findOne({
      order: [["id", orderBy]],
    });
  }
  delete user.dataValues["password"];
  return res.json(user);
});

imagesRouter.delete("/:id/", isAuthenticated, async function (req, res, next) {
    if (!req.params.id){
        return res.status(400).json({ errors: "Missing parameters" });
      }
  const imageDelete = await Image.findOne({
    where: {
      id: {
        [Op.eq]: req.params.id,
      },
      UserId: {
        [Op.eq]: req.session.user.id,
      },
    },
  });
  if (!imageDelete) {
    return res.status(403).json({ errors: "User does not own this image" });
  }
  await Comment.destroy({
    where: {
      ImageId: {
        [Op.eq]: req.params.id,
      },
    },
  });
  await imageDelete.destroy();

  return res.json(imageDelete);
});

imagesRouter.get("/src/:id", isAuthenticated, async function (req, res, next) {
    if (!req.params.id){
        return res.status(400).json({ errors: "Missing parameters" });
      }
  let image = req.params.id;
  let images = await Image.findOne({
    where: {
      id: {
        [Op.eq]: image,
      },
    },
  });
  if (!images) {
    return res.status(404).json({ errors: "Image does not exist" });
  }
  const file = JSON.parse(images.file);
  res.setHeader("Content-Type", file.mimetype);
  res.sendFile(file.path, { root: path.resolve() });
});

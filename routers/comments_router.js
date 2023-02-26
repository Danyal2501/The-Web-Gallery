import { Op } from "sequelize";
import { Comment } from "../models/comment.js";
import { sequelize } from "../datasource.js";
import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";

export const commentsRouter = Router();

commentsRouter.post("/", isAuthenticated, async function (req, res, next) {
    if (!req.body.content){
        return res.status(400).json({ errors: "Missing parameters" });
      }
  const id = parseInt(req.body.id);
  const name = req.session.user.username;
  const content = req.body.content;
  let comment = await Comment.create({
    ImageId: id,
    author: name,
    content: content,
  });
  if (!comment) {
    return res
      .status(400)
      .json({ errors: "Could not post comment" });
  }
  return res.json(comment);
});

commentsRouter.get("/", isAuthenticated, async function (req, res, next) {
    if (!req.query.id){
        return res.status(400).json({ errors: "Missing parameters" });
      }
  const id = parseInt(req.query.id);
  const comments = await Comment.findAll({
    where: {
      ImageId: {
        [Op.eq]: id,
      },
    },
  });
  if (!comments) {
    return res
      .status(404)
      .json({ errors: "Parent image for comments does not exist" });
  }
  return res.json(comments);
});

commentsRouter.delete(
  "/:id/",
  isAuthenticated,
  async function (req, res, next) {
    if (!req.params.id){
        return res.status(400).json({ errors: "Missing parameters" });
      }
    const userId = req.session.user.id;
    const userName = req.session.user.username;
    const commentDelete = await Comment.destroy({
        where: {
          commentId: {
            [Op.eq]: req.params.id,
          },
          [Op.or]: [
            { author: userName },
            {
              ImageId: {
                [Op.in]: sequelize.literal(`(SELECT "id" FROM "Images" WHERE "userId" = ${userId})`)
              }
            }
          ]
        }
      });
    if (!commentDelete) {
      return res.status(403).json({ errors: "User does not own this comment, or its parent image" });
    }
    return res.json(commentDelete);
  }
);

import { Op } from "sequelize";
import { User } from "../models/user.js";
import { Router } from "express";
import bcrypt from "bcrypt";
import { isAuthenticated } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.post("/signup", async function (req, res, next) {
    if (!req.body.username || !req.body.password){
        return res.status(400).json({ errors: "Missing parameters" });
      }
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const password = bcrypt.hashSync(req.body.password, salt);
  const username = req.body.username;
  let user;
  try {
    user = await User.create({
      username: username,
      password: password,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Username already exists" });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.json(user);
});

usersRouter.post("/login", async function (req, res, next) {
    if (!req.body.username || !req.body.password){
        return res.status(400).json({ errors: "Missing parameters" });
      }
  const password = req.body.password;
  const username = req.body.username;
  let user;
  user = await User.findOne({
    where: {
      username: {
        [Op.eq]: username,
      },
    },
  });

  if (!user) return res.status(400).json({ error: "Username does not exist" });
  if (!bcrypt.compareSync(password, user.dataValues.password)) {
    return res.status(400).json({ error: "Incorrect password" });
  }
  req.session.user = user;
  return res.json(user);
});

usersRouter.get("/me", isAuthenticated, async (req, res) => {
  let user = req.session.user;
  return res.json({
    username: user.username,
    id: user.id,
  });
});

usersRouter.get("/logout", isAuthenticated, async (req, res) => {
  req.session.user = undefined;
  return res.json({
    status: "logged out",
  });
});

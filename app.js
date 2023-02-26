import { sequelize } from "./datasource.js";
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { imagesRouter } from "./routers/images_router.js";
import { usersRouter } from "./routers/users_router.js";
import { commentsRouter } from "./routers/comments_router.js";

export const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("static"));
app.use(
  session({
    secret: "C^,dmt#J3zqZ8Fp&>7@9?6U|",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/api/images", imagesRouter);
app.use("/api/users", usersRouter);
app.use("/api/comments", commentsRouter);

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  if (!req.session.user && req.method != "POST") {
    return res.status(403).json({ error: "User not logged in" });
  }
  next();
});

const PORT = 3000;

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});

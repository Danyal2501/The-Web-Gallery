import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Image } from "./image.js";

export const Comment = sequelize.define("Comment", {
  commentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  author: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.STRING,
  },
});

Comment.belongsTo(Image);
Image.hasMany(Comment);

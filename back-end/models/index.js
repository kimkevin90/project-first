const { Sequelize, DataTypes } = require("sequelize");
// const User = require("./user");
const Login = require("./Login");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Login = Login;

Login.init(sequelize);

module.exports = db;

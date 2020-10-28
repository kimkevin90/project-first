const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING,
        },
        password: {
          type: Sequelize.STRING,
        },
        displayName: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Login",
        tableName: "userInfo",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
};

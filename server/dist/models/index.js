"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMaterialProgress = exports.Transaction = exports.Material = exports.Course = exports.User = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Course_1 = require("./Course");
Object.defineProperty(exports, "Course", { enumerable: true, get: function () { return Course_1.Course; } });
const Material_1 = require("./Material");
Object.defineProperty(exports, "Material", { enumerable: true, get: function () { return Material_1.Material; } });
const Transaction_1 = require("./Transaction");
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return Transaction_1.Transaction; } });
const UserMaterialProgress_1 = require("./UserMaterialProgress");
Object.defineProperty(exports, "UserMaterialProgress", { enumerable: true, get: function () { return UserMaterialProgress_1.UserMaterialProgress; } });
const sequelize = new sequelize_typescript_1.Sequelize({
    database: 'e_learning',
    username: 'root',
    password: '',
    host: 'localhost',
    dialect: 'mysql',
    models: [User_1.User, Course_1.Course, Material_1.Material, Transaction_1.Transaction, UserMaterialProgress_1.UserMaterialProgress],
});
exports.sequelize = sequelize;

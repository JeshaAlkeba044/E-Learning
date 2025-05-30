"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
models_1.sequelize.sync({ force: false }).then(() => {
    console.log('Database & tables synced!');
});
exports.default = models_1.sequelize;

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Course_1 = require("./Course");
const uuid_1 = require("uuid");
let Material = class Material extends sequelize_typescript_1.Model {
};
exports.Material = Material;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
        defaultValue: (0, uuid_1.v4)(),
    }),
    __metadata("design:type", String)
], Material.prototype, "id_material", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Material.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    __metadata("design:type", String)
], Material.prototype, "topic", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
        allowNull: false,
        defaultValue: { blocks: [] },
        get() {
            const rawValue = this.getDataValue("content");
            if (typeof rawValue === "string") {
                try {
                    return JSON.parse(rawValue);
                }
                catch (e) {
                    return { blocks: [] };
                }
            }
            return rawValue || { blocks: [] };
        },
        set(value) {
            if (typeof value === "string") {
                try {
                    this.setDataValue("content", JSON.parse(value));
                }
                catch (e) {
                    this.setDataValue("content", { blocks: [] });
                }
            }
            else {
                this.setDataValue("content", value || { blocks: [] });
            }
        },
    }),
    __metadata("design:type", Object)
], Material.prototype, "content", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Material.prototype, "duration", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }),
    __metadata("design:type", Boolean)
], Material.prototype, "is_free", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }),
    __metadata("design:type", Boolean)
], Material.prototype, "is_locked", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Material.prototype, "sequence_order", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Course_1.Course),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Material.prototype, "id_course", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Course_1.Course),
    __metadata("design:type", Course_1.Course)
], Material.prototype, "course", void 0);
exports.Material = Material = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "materials",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    })
], Material);

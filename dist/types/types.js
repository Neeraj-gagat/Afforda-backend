"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigninSchema = exports.SignupSchema = void 0;
const zod_1 = require("zod");
exports.SignupSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    password: zod_1.z.string().min(6),
    email: zod_1.z.string().min(10)
});
exports.SigninSchema = zod_1.z.object({
    password: zod_1.z.string().min(6),
    email: zod_1.z.string().min(10)
});

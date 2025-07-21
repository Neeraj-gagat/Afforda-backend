"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.ResetPasswordRequestSchema = exports.SigninSchema = exports.SignupSchema = void 0;
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
exports.ResetPasswordRequestSchema = zod_1.z.object({
    email: zod_1.z.string().min(10)
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
    newPassword: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
    //   .max(100, "Password must be under 100 characters")
    //   .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    //   .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    //   .regex(/[0-9]/, "Password must contain at least one digit")
    //   .regex(/[\W_]/, "Password must contain at least one special character")
});

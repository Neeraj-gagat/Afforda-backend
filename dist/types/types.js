"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelSearchSchema = exports.ResetPasswordSchema = exports.ResetPasswordRequestSchema = exports.SigninSchema = exports.SignupSchema = void 0;
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
//  agoda api schema 
exports.HotelSearchSchema = zod_1.z.object({
    checkInDate: zod_1.z.string().min(1, "checkInDate is required"), // Format: YYYY-MM-DD
    checkOutDate: zod_1.z.string().min(1, "checkOutDate is required"),
    cityId: zod_1.z.number().int().min(1, "cityId must be a valid number"),
    additional: zod_1.z.object({
        currency: zod_1.z.string().min(1),
        language: zod_1.z.string().min(1),
        maxResult: zod_1.z.number().int().min(1),
        sortBy: zod_1.z.string().min(1),
        discount: zod_1.z.boolean().optional(),
        minimumStarRating: zod_1.z.number().int().min(0).optional(),
        minimumReviewScore: zod_1.z.number().int().min(0).optional(),
        dailyRate: zod_1.z.object({
            minimum: zod_1.z.number().int(),
            maximum: zod_1.z.number().int()
        }),
        occupancy: zod_1.z.object({
            numberOfAdult: zod_1.z.number().int().min(1),
            numberOfChildren: zod_1.z.number().int().min(0),
        }),
    }),
});

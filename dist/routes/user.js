"use strict";
// import dotenv from "dotenv";
// dotenv.config();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const types_1 = require("../types/types");
const db_1 = require("../db/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authmiddleware_1 = require("../authmiddleware");
const email_1 = require("../email/email");
const router = (0, express_1.Router)();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = types_1.SignupSchema.safeParse(body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        return res.status(411).json({
            message: "Incorrect Inputs"
        });
    }
    const { email, name, password } = parsedData.data;
    const userexist = yield db_1.prisma.user.findFirst({
        where: {
            email: parsedData.data.email
        }
    });
    if (userexist) {
        if (userexist.emailVerified) {
            return res.status(403).json({ message: "User with this email already exists" });
        }
        else {
            // If not verified, re-send verification email
            const verificationToken = jsonwebtoken_1.default.sign({ id: userexist.id }, config_1.JWT_PASSWORD, { expiresIn: "1h" });
            const verificationLink = `https://affoda.com/verify-email?token=${verificationToken}`;
            try {
                yield (0, email_1.sendVerificationEmail)(email, verificationLink);
                return res.status(200).json({
                    message: "Email already registered but not verified. Verification email resent.",
                    email
                });
            }
            catch (error) {
                console.error("Error sending verification email:", error);
                return res.status(500).json({ message: "Error sending verification email." });
            }
        }
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const newUser = yield db_1.prisma.user.create({
        data: {
            email: email,
            name: name,
            password: hashedPassword,
        }
    });
    // Create verification token
    const verificationToken = jsonwebtoken_1.default.sign({ id: newUser.id }, config_1.JWT_PASSWORD, { expiresIn: "1h" });
    // Send verification email
    const verificationLink = `https://affoda.com/verify-email?token=${verificationToken}`;
    console.log(`${verificationLink}`);
    try {
        yield (0, email_1.sendVerificationEmail)(email, verificationLink);
        console.log("✅ Email sent:");
    }
    catch (err) {
        console.error("❌ SES Email Send Error:", err);
        return res.status(500).json({ message: "Error sending verification email." });
    }
    return res.json({ message: "User created. Please check your email to verify your account.",
        email
    });
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = types_1.SigninSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(422).json({
            message: "Incorrect inputs"
        });
    }
    const userexist = yield db_1.prisma.user.findFirst({
        where: { email: parsedData.data.email }
    });
    if (!userexist) {
        return res.status(403).json({ message: "Invalid credentials" });
    }
    const isMatch = yield bcrypt_1.default.compare(parsedData.data.password, userexist.password);
    if (!isMatch) {
        return res.status(403).json({ message: "Invalid credentials" });
    }
    if (!userexist.emailVerified) {
        return res.status(403).json({
            message: "email not verified"
        });
    }
    const token = jsonwebtoken_1.default.sign({
        id: userexist.id
    }, config_1.JWT_PASSWORD);
    res.json({
        token: token
    });
}));
router.get("/", authmiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.id;
    const user = yield db_1.prisma.user.findFirst({
        where: {
            id
        },
        select: {
            name: true,
            email: true
        }
    });
    return res.json({
        user
    });
}));
router.get("/verify-email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ message: "Missing token." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_PASSWORD);
        const user = yield db_1.prisma.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.emailVerified) {
            return res.status(200).json({ message: "Email already verified." });
        }
        yield db_1.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true }
        });
        return res.status(200).json({ message: "Email verified successfully." });
    }
    catch (err) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
}));
router.post("/request-password-reset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const parsedData = types_1.ResetPasswordRequestSchema.safeParse(data);
    if (!parsedData.success) {
        console.log(parsedData.error);
        return res.status(422).json({
            message: "incorrect inputs"
        });
    }
    const { email } = parsedData.data;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const user = yield db_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.emailVerified) {
        return res.status(404).json({ message: "User not found or email not verified" });
    }
    const resetToken = jsonwebtoken_1.default.sign({ id: user.id }, config_1.JWT_PASSWORD, { expiresIn: "15m" });
    const resetLink = `https://affoda.com/reset-password?token=${resetToken}`;
    try {
        yield (0, email_1.sendResetPasswordEmail)(user.email, resetLink);
        return res.status(200).json({ message: "Password reset email sent" });
    }
    catch (error) {
        console.error("Reset email error:", error);
        return res.status(500).json({ message: "Failed to send reset email" });
    }
}));
router.post("/reset-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const parsedData = types_1.ResetPasswordSchema.safeParse(data);
    if (!parsedData.success) {
        console.log(parsedData.error);
        return res.status(422).json({
            message: "Incorrect Inputs"
        });
    }
    const { token, newPassword } = parsedData.data;
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Missing token or password" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_PASSWORD);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield db_1.prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword },
        });
        return res.status(200).json({ message: "Password reset successfully" });
    }
    catch (err) {
        console.error("Reset error:", err);
        return res.status(400).json({ message: "Invalid or expired token" });
    }
}));
exports.userRouter = router;

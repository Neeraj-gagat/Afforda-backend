"use strict";
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authmiddleware_1 = require("../authmiddleware");
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ses = new aws_sdk_1.SES({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
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
        return res.status(403).json({
            message: "User with this email already exist"
        });
    }
    const newUser = yield db_1.prisma.user.create({
        data: {
            email: email,
            name: name,
            password: password
        }
    });
    // Create verification token
    const verificationToken = jsonwebtoken_1.default.sign({ id: newUser.id }, config_1.JWT_PASSWORD, { expiresIn: "1h" });
    // Send verification email
    const verificationLink = `http://localhost:3001/verify-email?token=${verificationToken}`;
    try {
        const result = yield ses.sendEmail({
            Source: "no-reply@affoda.com",
            Destination: { ToAddresses: [email] },
            Message: {
                Subject: { Data: "Verify your email" },
                Body: {
                    Html: {
                        Data: `Click <a href="${verificationLink}">here</a> to verify your email. This link will expire in 1 hour.`
                    }
                }
            }
        }).promise();
        console.log("✅ Email sent:", result);
    }
    catch (err) {
        console.error("❌ SES Email Send Error:", err);
        return res.status(500).json({ message: "Error sending verification email." });
    }
    return res.json({ message: "User created. Please check your email to verify your account." });
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
        where: {
            email: parsedData.data.email,
            password: parsedData.data.password,
        }
    });
    if (!userexist || !userexist.emailVerified) {
        return res.status(403).json({
            message: "Invalid credentials or email not verified"
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
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_PASSWORD);
        const userId = decoded.id;
        yield db_1.prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true }
        });
        return res.json({ message: "Email verified successfully." });
    }
    catch (err) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
}));
exports.userRouter = router;

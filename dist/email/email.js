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
exports.sendResetPasswordEmail = sendResetPasswordEmail;
exports.sendVerificationEmail = sendVerificationEmail;
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ses = new aws_sdk_1.SES({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
function sendResetPasswordEmail(email, resetLink) {
    return __awaiter(this, void 0, void 0, function* () {
        return ses.sendEmail({
            Source: "no-reply@affoda.com",
            Destination: { ToAddresses: [email] },
            Message: {
                Subject: { Data: "Reset Your Password" },
                Body: {
                    Html: {
                        Data: `Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.`
                    }
                }
            }
        }).promise();
    });
}
function sendVerificationEmail(email, verificationLink) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return result;
    });
}

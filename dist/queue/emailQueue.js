"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
exports.emailQueue = new bullmq_1.Queue("emailQueue", {
    connection: {
        host: "127.0.0.1",
        port: 6379,
    },
});

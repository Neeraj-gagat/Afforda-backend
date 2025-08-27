"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("./jobs/exchangeRatesJob");
const user_1 = require("./routes/user");
const search_1 = require("./routes/search");
const exchangerates_1 = require("./routes/exchangerates");
const port = 3001;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running ✅" });
});
app.use("/api/v1/user", user_1.userRouter);
app.use("/api/v1/search", search_1.searchRouter);
app.use("/api/v1/exchange-rates", exchangerates_1.exchangeRates);
app.listen(port, () => (console.log(`server is running on port ${port}`)));

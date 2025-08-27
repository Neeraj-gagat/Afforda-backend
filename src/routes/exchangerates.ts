import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const ratesFilePath = path.join(__dirname, "../../exchangeRates.json");

router.get("/", (req, res) => {
  try {
    const data = fs.readFileSync(ratesFilePath, "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: "Rates not available" });
  }
});

export const exchangeRates = router;

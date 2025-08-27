import fs from "fs";
import path from "path";
import axios from "axios";
import cron from "node-cron";

const API_URL = "https://open.er-api.com/v6/latest/USD";

// Define expected response type
interface ExchangeRateResponse {
  result: string;
  provider: string;
  base_code: string;
  time_last_update_utc: string;
  time_next_update_utc: string;
  rates: {
    [currency: string]: number;
  };
}

const filePath = path.join(__dirname, "../../exchangeRates.json");


async function fetchExchangeRates() {
  try {
    const { data } = await axios.get<ExchangeRateResponse>(API_URL);

    if (data.result !== "success") {
      console.error("❌ API error:", data);
      return;
    }

    fs.writeFileSync(filePath, JSON.stringify(data.rates, null, 2));
    console.log(`✅ Exchange rates updated at ${new Date().toISOString()} → saved to ${filePath}`);
  } catch (err: any) {
    console.error("❌ Failed to fetch rates:", err.message || err);
  }
}

fetchExchangeRates();

// schedule job to run daily at midnight
cron.schedule("0 0 * * *", () => {
  console.log("⏰ Running scheduled exchange rate update...");
  fetchExchangeRates();
});

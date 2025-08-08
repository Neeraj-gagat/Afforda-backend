import dotenv from "dotenv";
dotenv.config();

import {Router } from "express";
import { HotelSearchSchema } from "../types/types";
import axios from "axios";

const router = Router();

router.post("/hotel-result",async(req, res ):Promise <any> => {
    const body  = req.body;
    const parsedData = HotelSearchSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid request body"})
    }

    const {
        checkInDate,
        checkOutDate,
        cityId,
        additional: {
          language,
          currency,
          occupancy: { numberOfAdult, numberOfChildren },
          maxResult,
          sortBy,
        },
      } = parsedData.data;

      try {
        const agodaResponse = await axios.post(
          "http://affiliateapi7643.agoda.com/affiliateservice/lt_v1", // real Agoda Long Search URL
          {
            criteria: {
              checkInDate,
              checkOutDate,
              cityId,
              additional: {
                currency,
                language,
                maxResult,
                sortBy,
                discountOnly: false,
                minimumStarRating:0,
                minimumReviewScore:0,
                dailyRate: {
                  minimum:0,
                  maximum: 10000,
                },
                occupancy: {
                  numberOfAdult,
                  numberOfChildren,
                },
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.AGODA_API_KEY}`,
            },
          }
        );
        console.log("i am here")
    
        return res.json(agodaResponse.data);
      } catch (error: any) {
        console.error("Agoda API error:", error?.response?.data || error.message);
        return res.status(500).json({ error: "Agoda Search Failed" });
      }

})

export const searchRouter = router;
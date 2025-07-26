import express from "express"
import cors from "cors"
import { userRouter } from "./routes/user";
import { searchRouter } from "./routes/search";


const port = 3001
const app = express();
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running ✅" });
  });

app.use("/api/v1/user", userRouter);
app.use("/api/v1/search", searchRouter);

app.listen(port, () => (
    console.log(`server is running on port ${port}`)
))
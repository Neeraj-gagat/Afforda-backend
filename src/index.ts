import express from "express"

const port = 3001
const app = express();

app.use(express.json())

// app.use("/api/v1/user", userRouter);

app.listen(port, () => (
    console.log(`server is running on port ${port}`)
))
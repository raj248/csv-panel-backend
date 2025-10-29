import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";

const app: Express = express();

// app.use(
//   cors({
//     origin: "*", // your frontend origin
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

import authRoute from "./routes/auth.routes";

app.use(
  cors({
    origin: true, // or your frontend IP/domain
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api/auth", authRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default app;

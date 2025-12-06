import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

const app: Express = express();

app.use(
  cors({
    origin: "*", // your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

import authRoute from "./routes/auth.routes";
import fileRoute from "./routes/file.routes";
import userRoute from "./routes/user.routes";

// app.use(
//   cors({
//     origin: true, // or your frontend IP/domain
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api/auth", authRoute);
app.use("/api/files", fileRoute);
app.use("/api/user", userRoute);

app.use(express.static(path.join(process.cwd(), "public")));

app.use((req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/healthz", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default app;

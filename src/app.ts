import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

import authRoutes from "./routes/auth";
import cityRoutes from "./routes/city";
import userRoutes from "./routes/user";
import issueRoutes from "./routes/issue";

const app: Express = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});
app.get("/ping", (_req: Request, res: Response) => res.send("pong 🏓"));

app.use("/auth", authRoutes);
app.use("/city", cityRoutes);
app.use("/users", userRoutes);
app.use("/issue", issueRoutes);

// Export the Express API
export default app;

import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";

import authRoutes from "./routes/auth";
import cityRoutes from "./routes/city";
import userRoutes from "./routes/user";
import issueRoutes from "./routes/issue";
import featureFlagRoutes from "./routes/feature-flag";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 8000;

const EXPORTS_DIR = "./exports";

if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR);
}

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});
app.get("/ping", (_req: Request, res: Response) => res.send("pong 🏓"));

app.use("/auth", authRoutes);
app.use("/city", cityRoutes);
app.use("/users", userRoutes);
app.use("/issue", issueRoutes);
app.use("/features", featureFlagRoutes);

app.listen(port, () => {
  console.log(`App rodando na porta ${port}`);
});

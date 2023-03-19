import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

import authRoutes from "./routes/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World From the Typescript Server!");
});

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

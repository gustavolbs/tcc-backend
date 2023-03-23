import { Router, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { body, param } from "express-validator";

import {
  exclude,
  findUserByEmail,
  findUserById,
  updateUserRole,
  getAllUsersByCity,
} from "../models/User";

const router = Router();

router.put(
  "/role",
  [body("email").notEmpty(), body("role").notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token not found" });
      }

      const decodedToken = jwt.verify(
        token,
        String(process.env.JWT_SECRET)
      ) as JwtPayload;

      if (
        decodedToken.user.role !== "owner" &&
        decodedToken.user.role !== "admin"
      ) {
        return res.status(403).json({ error: "User not authorized" });
      }

      const { email, role } = req.body;

      if (!["resident", "manager", "owner", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const user = await findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role === role) {
        return res.status(400).json({ error: "User already have this role" });
      }

      if (decodedToken.user.role !== "admin" && role === "admin") {
        return res
          .status(403)
          .json({ error: "Admin role can only be assigned by admins" });
      }

      if (decodedToken.user.role === "owner" && user.role === "admin") {
        return res.status(403).json({ error: "Admin role cannot be removed" });
      }

      const updatedUser = await updateUserRole(email, role);

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token not found" });
    }

    const decodedToken = jwt.verify(
      token,
      String(process.env.JWT_SECRET)
    ) as JwtPayload;
    const user = await findUserById(decodedToken.user.id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const userWithoutPassword = exclude(user, ["password"]);

    return res.send(userWithoutPassword);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.get(
  "/all/:cityId",
  [param("cityId").isInt()],
  async (req: Request, res: Response) => {
    const cityId = parseInt(req.params.cityId);

    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token not found" });
      }

      const users = await getAllUsersByCity(cityId);

      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;

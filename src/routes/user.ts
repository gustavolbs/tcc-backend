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
        return res.status(401).json({ message: "Token não encontrado" });
      }

      const decodedToken = jwt.verify(
        token,
        String(process.env.JWT_SECRET)
      ) as JwtPayload;

      if (
        decodedToken.user.role !== "owner" &&
        decodedToken.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Usuário não autorizado" });
      }

      const { email, role } = req.body;

      if (!["resident", "manager", "owner", "admin"].includes(role)) {
        return res.status(400).json({ message: "Cargo inválido" });
      }

      const user = await findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      if (user.role === role) {
        return res
          .status(400)
          .json({ message: "Usuário já possui este cargo" });
      }

      if (decodedToken.user.role !== "admin" && role === "admin") {
        return res
          .status(403)
          .json({ message: "O cargo ADMIN só pode ser atribuído por admins" });
      }

      if (decodedToken.user.role === "owner" && user.role === "admin") {
        return res
          .status(403)
          .json({ message: "Cargo ADMIN não pode ser removido" });
      }

      const updatedUser = await updateUserRole(email, role);

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token não encontrado" });
    }

    const decodedToken = jwt.verify(
      token,
      String(process.env.JWT_SECRET)
    ) as JwtPayload;
    const user = await findUserById(decodedToken.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const userWithoutPassword = exclude(user, ["password"]);

    return res.send(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Ops... Ocorreu um erro" });
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
        return res.status(401).json({ message: "Token não encontrado" });
      }

      const users = await getAllUsersByCity(cityId);
      const usersWithoutPassword = users.map((user) =>
        exclude(user, ["password"])
      );

      res.json(usersWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

export default router;

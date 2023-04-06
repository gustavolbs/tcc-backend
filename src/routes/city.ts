import { Router, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { body, param, validationResult } from "express-validator";

import { createCity, findCityById, getCities } from "../models/City";

const router = Router();

router.post(
  "/create",
  [
    body("name").isString().trim().notEmpty(),
    body("latitude").notEmpty(),
    body("longitude").notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      return res
        .status(400)
        .json({ message: "Verifique os campos e preencha corretamente" });
    }

    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token não encontrado" });
      }

      const decodedToken = jwt.verify(
        token,
        String(process.env.JWT_SECRET)
      ) as JwtPayload;
      if (decodedToken.user.role !== "admin") {
        return res.status(403).json({ message: "Usuário não autorizado" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() });
        return res.status(422).json({
          message: "Campos inválidos. Preencha corretamente e tente novamente",
        });
      }

      const { name, latitude, longitude } = req.body;

      const city = await createCity({ name: name.trim(), latitude, longitude });

      res.json(city);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.get("/all", async (req: Request, res: Response) => {
  try {
    const cities = await getCities();

    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Ops... Ocorreu um erro" });
  }
});

router.get(
  "/:id",
  [param("id").isInt()],
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token não encontrado" });
      }

      const city = await findCityById(id);

      if (!city) {
        return res.status(404).json({ message: "Cidade não cadastrada" });
      }

      res.json(city);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

export default router;

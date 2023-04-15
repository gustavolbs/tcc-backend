import { Router, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { body, param, validationResult } from "express-validator";

import authMiddleware from "../middleware/auth";

import {
  createFeatureFlag,
  deleteFeatureFlag,
  getAllFeatureFlags,
  getFeatureFlagById,
  updateFeatureFlag,
} from "../models/FeatureFlag";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  [
    body("slug").isString().trim().notEmpty(),
    body("description").isString().trim().notEmpty(),
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

      const { slug, description } = req.body;

      const featureFlag = await createFeatureFlag(slug, description);

      res.json(featureFlag);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.get("/all", authMiddleware, async (req: Request, res: Response) => {
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

    const featureFlags = await getAllFeatureFlags();

    res.json(featureFlags);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Ops... Ocorreu um erro" });
  }
});

router.get(
  "/:featureId",
  authMiddleware,
  [param("featureId").isInt()],
  async (req: Request, res: Response) => {
    const featureId = parseInt(req.params.featureId);

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

      const featureFlag = await getFeatureFlagById(featureId);

      if (!featureFlag) {
        return res.status(404).json({ message: "Feature Flag não cadastrada" });
      }

      res.json(featureFlag);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.put(
  "/edit",
  authMiddleware,
  [
    body("id").isInt().notEmpty(),
    body("slug").isString().trim().notEmpty(),
    body("description").isString().trim().notEmpty(),
    body("status").isBoolean().notEmpty(),
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

      const { id, slug, description, status } = req.body;

      // Verificar se a feature é válida
      const feature = await getFeatureFlagById(parseInt(id));

      if (!feature) {
        return res
          .status(404)
          .send({ message: "Feature Flag não encontrada." });
      }

      const featureFlag = await updateFeatureFlag({
        id,
        slug: slug.trim(),
        description: description.trim(),
        status,
      });

      res.json(featureFlag);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.delete(
  "/delete/:featureId",
  authMiddleware,
  [param("featureId").isInt().notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      return res
        .status(400)
        .json({ message: "Verifique os campos e preencha corretamente" });
    }

    const { featureId } = req.params;

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

      // Verificar se a feature é válida
      const feature = await getFeatureFlagById(parseInt(featureId));

      if (!feature) {
        return res
          .status(404)
          .send({ message: "Feature Flag não encontrada." });
      }

      await deleteFeatureFlag(Number(featureId));

      return res
        .status(200)
        .send({ message: "Feature Flag excluída com sucesso" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

export default router;

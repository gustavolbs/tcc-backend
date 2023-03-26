import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

import authMiddleware from "../middleware/auth";

import {
  createIssue,
  findIssueById,
  findAllByCityId,
  updateIssueField,
} from "../models/Issue";
import { findUserById } from "../models/User";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  body("cityId").isInt(),
  body("latitude").isFloat(),
  body("longitude").isFloat(),
  body("category").isString(),
  body("description").isString(),
  body("date").isString(),
  body("reporterId").isInt(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      return res
        .status(400)
        .json({ message: "Verifique os campos e preencha corretamente" });
    }

    const {
      cityId,
      latitude,
      longitude,
      category,
      description,
      date,
      reporterId,
    } = req.body;

    try {
      const issue = await createIssue({
        cityId,
        latitude,
        longitude,
        category,
        description,
        date: new Date(date),
        reporterId,
      });

      res.json(issue);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.get(
  "/:issueId",
  authMiddleware,
  [param("issueId").isInt()],
  async (req: Request, res: Response) => {
    const issueId = parseInt(req.params.issueId);

    try {
      const issue = await findIssueById(issueId);

      if (!issue) {
        return res.status(404).json({ message: "Problema não cadastrado" });
      }

      res.json(issue);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.get(
  "/all/:cityId",
  authMiddleware,
  [param("cityId").isInt()],
  async (req: Request, res: Response) => {
    const cityId = parseInt(req.params.cityId);

    try {
      const issues = await findAllByCityId(cityId);

      res.json(issues);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

interface UpdateIssueRequestBody {
  field: "fiscalId" | "managerId";
  userId: string;
}

router.put(
  "/:issueId/assign/update",
  authMiddleware,
  [param("issueId").isInt()],
  async (req: Request<any, any, UpdateIssueRequestBody>, res: Response) => {
    const { issueId } = req.params;
    const { field, userId } = req.body;

    try {
      // Verificar se o usuário é válido
      const user = await findUserById(parseInt(userId));

      if (!user) {
        return res.status(404).send({ message: "Usuário não encontrado." });
      }

      // Verificar se a issue é válida
      const issue = await findIssueById(parseInt(issueId));

      if (!issue) {
        return res.status(404).send({ message: "Issue não encontrada." });
      }

      // Verificar se o campo a ser atualizado é válido
      if (field !== "fiscalId" && field !== "managerId") {
        return res.status(400).send({ message: "Campo inválido." });
      }

      const isAssignedToField =
        (issue as { [key: string]: any })[field] === parseInt(userId);

      // Verificar se o usuário tem permissão para fazer a atualização
      if (issue[field] && !isAssignedToField) {
        return res.status(403).send({ message: "Usuário não autorizado." });
      }

      if (issue[field] && isAssignedToField) {
        // Campo já está preenchido com o id do usuário atual
        // Permite que o usuário se desatribua
        const updatedIssue = await updateIssueField(parseInt(issueId), field);

        return res.status(200).send(updatedIssue);
      }

      // Atualizar o campo
      const updatedIssue = await updateIssueField(
        parseInt(issueId),
        field,
        parseInt(userId)
      );

      return res.status(200).send(updatedIssue);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

export default router;

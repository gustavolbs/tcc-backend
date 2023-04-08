import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

import authMiddleware from "../middleware/auth";

import { STATUS } from "../interfaces/status";

import {
  createIssue,
  findIssueById,
  findAllByCityId,
  updateIssueField,
  findAllFromOneUser,
  updateIssueStatus,
} from "../models/Issue";
import { findUserById } from "../models/User";
import {
  createComment,
  deleteCommentById,
  findCommentById,
  getAllCommentsByIssueId,
} from "../models/Comment";

import { getUserId } from "../utils/auth";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  body("cityId").isInt(),
  body("latitude").isFloat(),
  body("longitude").isFloat(),
  body("category").isString().notEmpty(),
  body("description").isString().notEmpty(),
  body("date").isString().notEmpty(),
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
        return res.status(404).send({ message: "Problema não encontrado." });
      }

      // Verificar se o campo a ser atualizado é válido
      if (field !== "fiscalId" && field !== "managerId") {
        return res.status(400).send({ message: "Campo inválido." });
      }

      if (issue.reporterId === Number(userId)) {
        return res.status(400).send({
          message: "Você não pode se atribuir como Relator e Fiscal/Gestor",
        });
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

router.get(
  "/all/:cityId/mine",
  authMiddleware,
  [param("cityId").isInt()],
  async (req: Request, res: Response) => {
    const cityId = parseInt(req.params.cityId);

    try {
      const userId = getUserId(req);

      const issues = await findAllFromOneUser(cityId, userId);

      res.json(issues);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.put(
  "/:issueId/solve",
  authMiddleware,
  [param("issueId").isInt()],
  async (req: Request, res: Response) => {
    const { issueId } = req.params;

    try {
      // Verificar se o usuário é válido
      const userId = getUserId(req);

      if (!userId) {
        return res.status(404).send({ message: "Usuário não encontrado." });
      }

      // Verificar se a issue é válida
      const issue = await findIssueById(parseInt(issueId));

      if (!issue) {
        return res.status(404).send({ message: "Problema não encontrado." });
      }

      // Verificar se o campo a ser atualizado é válido
      if (issue.status === STATUS.Solved) {
        return res
          .status(400)
          .send({ message: "O problema já foi marcado como resolvido" });
      }

      if (issue.reporterId !== Number(userId)) {
        return res.status(403).send({
          message:
            "Você não tem permissão para marcar como resolvido o problema de outro usuário",
        });
      }

      // Atualizar o campo
      const updatedIssue = await updateIssueStatus(
        parseInt(issueId),
        STATUS.Solved
      );

      return res.status(200).send(updatedIssue);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.post(
  "/:issueId/comment/create",
  authMiddleware,
  [body("text").isString().trim().notEmpty()],
  [param("issueId").isInt()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      return res
        .status(400)
        .json({ message: "Verifique os campos e preencha corretamente" });
    }

    const { issueId } = req.params;
    const { text, commentId } = req.body;

    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(404).send({ message: "Usuário não encontrado." });
      }

      // Verificar se a issue é válida
      const issue = await findIssueById(parseInt(issueId));

      if (!issue) {
        return res.status(404).send({ message: "Problema não encontrado." });
      }

      const comment = await createComment({
        authorId: userId,
        issueId: Number(issueId),
        text,
        ...(commentId && { parentId: commentId }),
      });

      return res.status(200).send(comment);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.post(
  "/:issueId/comment/delete",
  authMiddleware,
  [body("commentId").isInt()],
  [param("issueId").isInt()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      return res
        .status(400)
        .json({ message: "Verifique os campos e preencha corretamente" });
    }

    const { issueId } = req.params;
    const { commentId } = req.body;

    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(404).send({ message: "Usuário não encontrado." });
      }

      // Verificar se a issue é válida
      const issue = await findIssueById(parseInt(issueId));

      if (!issue) {
        return res.status(404).send({ message: "Problema não encontrado." });
      }

      const comment = await findCommentById(commentId);

      if (!comment) {
        return res.status(404).send({ message: "Comentário não encontrada." });
      }

      await deleteCommentById(commentId);

      return res
        .status(200)
        .send({ message: "Comentário excluído com sucesso" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

router.get(
  "/:issueId/comment/all",
  authMiddleware,
  [param("issueId").isInt()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      return res
        .status(400)
        .json({ message: "Verifique os campos e preencha corretamente" });
    }

    const { issueId } = req.params;

    try {
      // Verificar se a issue é válida
      const issue = await findIssueById(parseInt(issueId));

      if (!issue) {
        return res.status(404).send({ message: "Problema não encontrado." });
      }

      const comments = await getAllCommentsByIssueId(Number(issueId));

      res.json(comments);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ops... Ocorreu um erro" });
    }
  }
);

export default router;

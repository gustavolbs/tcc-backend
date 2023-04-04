import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const getUserId = (req: Request): number => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("Token não fornecido.");
  }

  const token = authHeader.replace("Bearer ", "");
  const decoded = jwt.verify(
    token,
    String(process.env.JWT_SECRET)
  ) as JwtPayload;

  return decoded.user.id;
};

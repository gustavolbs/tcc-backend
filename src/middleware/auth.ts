import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface Payload {
  user: {
    id: number;
  };
}

export default function (req: Request<any>, res: Response, next: NextFunction) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decodedToken = jwt.verify(
      token,
      String(process.env.JWT_SECRET)
    ) as Payload;
    (req as any).user = decodedToken.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
}

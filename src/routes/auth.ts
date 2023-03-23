import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import authMiddleware from "../middleware/auth";

import { findUserByEmail, createUser } from "../models/User";

const router = Router();

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await findUserByEmail(email);

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        String(process.env.JWT_SECRET),
        { expiresIn: "8h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send("Server error");
      } else {
        console.error("Unexpected error", err);
      }
    }
  }
);

router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("surname").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("city").notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const {
      name,
      surname,
      email,
      password,
      city,
      role = "resident",
    } = req.body;

    try {
      const userExists = await findUserByEmail(email);

      if (userExists) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      const newUser = await createUser({
        name,
        surname,
        email,
        password,
        city: Number(city),
        role,
      });

      const payload = {
        user: {
          id: newUser.id,
          role: newUser.role,
        },
      };

      jwt.sign(
        payload,
        String(process.env.JWT_SECRET),
        { expiresIn: "8h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send("Server error");
      } else {
        console.error("Unexpected error", err);
      }
    }
  }
);

router.get("/check", authMiddleware, async (req: Request, res: Response) => {
  res.json({ msg: "Token is valid" });
});

export default router;

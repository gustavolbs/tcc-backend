import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";

import { findUserByEmail, createUser } from "../models/User";

const router = express.Router();

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
        },
      };

      jwt.sign(payload, "secret", { expiresIn: "1h" }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
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
        city,
        role,
      });

      const payload = {
        user: {
          id: newUser.id,
        },
      };

      jwt.sign(payload, "secret", { expiresIn: "1h" }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
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

export default router;

import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

export async function createUser(user: Omit<User, "id">): Promise<User> {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  const newUser = await prisma.user.create({
    data: {
      ...user,
      password: hashedPassword,
    },
  });

  return newUser;
}

import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

export async function findUserById(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return user;
}

export async function getAllUsersByCity(city: number): Promise<User[]> {
  const users: User[] = await prisma.user.findMany({
    where: {
      city,
    },
  });

  return users;
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

export const updateUserRole = async (
  email: string,
  role: string
): Promise<User> => {
  const updatedUser = await prisma.user.update({
    where: {
      email,
    },
    data: {
      role,
    },
  });

  return updatedUser;
};

import { PrismaClient, Issue } from "@prisma/client";

const prisma = new PrismaClient();

type IssueInput = {
  cityId: number;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  date: Date;
  reporterId: number;
};

export async function createIssue(issueInput: IssueInput): Promise<Issue> {
  const issue: Issue = await prisma.issue.create({
    data: {
      ...issueInput,
    },
  });

  return issue;
}

export async function findIssueById(issueId: number): Promise<Issue | null> {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
      fiscal: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
    },
  });

  return issue;
}

export async function findAllByCityId(cityId: number): Promise<Issue[]> {
  const issues: Issue[] = await prisma.issue.findMany({
    where: {
      cityId,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
    ],
    include: {
      reporter: {
        select: {
          name: true,
          surname: true,
        },
      },
    },
  });

  return issues;
}

export async function findAllFromOneUser(
  cityId: number,
  userId: number
): Promise<Issue[]> {
  const issues: Issue[] = await prisma.issue.findMany({
    where: {
      cityId,
      reporterId: userId,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
    ],
    include: {
      reporter: {
        select: {
          name: true,
          surname: true,
        },
      },
    },
  });

  return issues;
}

export const updateIssueField = async (
  issueId: number,
  field: keyof Issue,
  value: number | null = null
): Promise<Issue> => {
  const data = value === null ? { [field]: null } : { [field]: value };

  const updatedIssue = await prisma.issue.update({
    where: {
      id: issueId,
    },
    data,
  });

  return updatedIssue;
};

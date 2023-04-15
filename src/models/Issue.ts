import { PrismaClient, Issue } from "@prisma/client";

import { STATUS } from "../interfaces/status";

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
      status: STATUS.WaitingForFiscal,
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

export interface CityFilter {
  cityId: number;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

export async function findAllByCityId(filter: CityFilter): Promise<Issue[]> {
  const orderBy: { createdAt?: "desc" | undefined; updatedAt?: "desc" }[] = [
    {},
  ];

  if (filter.createdAt !== undefined) {
    orderBy[0].createdAt = "desc";
  } else {
    orderBy[0].updatedAt = "desc";
  }

  const issues: Issue[] = await prisma.issue.findMany({
    where: filter,
    orderBy,
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
  field: keyof Issue, // fiscalId ou managerId
  value: number | null = null
): Promise<Issue> => {
  // A PARTE DE STATUS VAI DAR BUG
  const data =
    value === null
      ? {
          [field]: null,
          status:
            field === "fiscalId"
              ? STATUS.WaitingForFiscal
              : STATUS.WaitingForManager,
        }
      : {
          [field]: value,
          status:
            field === "fiscalId"
              ? STATUS.WaitingForManager
              : STATUS.WaitingForManagerAction,
        };

  const updatedIssue = await prisma.issue.update({
    where: {
      id: issueId,
    },
    data,
  });

  return updatedIssue;
};

export const updateIssueStatus = async (
  issueId: number,
  value: string
): Promise<Issue> => {
  const updatedIssue = await prisma.issue.update({
    where: {
      id: issueId,
    },
    data: {
      status: value,
    },
  });

  return updatedIssue;
};

import { PrismaClient, Comment } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllCommentsByIssueId(
  issueId: number
): Promise<Comment[]> {
  const comments: Comment[] = await prisma.comment.findMany({
    where: {
      issueId,
    },
  });

  return comments;
}

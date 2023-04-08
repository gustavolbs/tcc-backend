import { PrismaClient, Comment } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllCommentsByIssueId(
  issueId: number
): Promise<Comment[]> {
  const comments: Comment[] = await prisma.comment.findMany({
    where: {
      issueId,
    },
    include: {
      author: true,
    },
  });

  return comments;
}

interface CommentInput {
  text: string;
  issueId: number;
  authorId: number;
  parentId?: number;
}

export async function createComment(
  commentInput: CommentInput
): Promise<Comment> {
  const comment: Comment = await prisma.comment.create({
    data: {
      ...commentInput,
    },
  });

  return comment;
}

export async function findCommentById(
  commentId: number
): Promise<Comment | null> {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  return comment;
}

export async function deleteCommentById(commentId: number): Promise<void> {
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
}

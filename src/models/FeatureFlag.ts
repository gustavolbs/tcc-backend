import { PrismaClient, FeatureFlag } from "@prisma/client";

const prisma = new PrismaClient();

export async function createFeatureFlag(
  slug: string,
  description: string
): Promise<FeatureFlag> {
  const cities = await prisma.city.findMany();

  const newFeatureFlag = await prisma.featureFlag.create({
    data: {
      slug,
      description,
      status: false,
      cities: {
        connect: cities.map((city) => ({ id: city.id })),
      },
    },
  });

  return newFeatureFlag;
}

export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const featureFlags = await prisma.featureFlag.findMany();

  return featureFlags;
}

export async function getFeatureFlagById(
  id: number
): Promise<FeatureFlag | null> {
  const featureFlag = await prisma.featureFlag.findUnique({
    where: {
      id,
    },
  });

  return featureFlag;
}

interface UpdateFeatureFlagInput {
  id: number;
  slug?: string;
  description?: string;
  status?: boolean;
}

export async function updateFeatureFlag(
  input: UpdateFeatureFlagInput
): Promise<FeatureFlag | null> {
  const featureFlag = await prisma.featureFlag.update({
    where: {
      id: input.id,
    },
    data: {
      slug: input.slug,
      description: input.description,
      status: input.status,
    },
  });

  return featureFlag;
}

export async function deleteFeatureFlag(
  id: number
): Promise<FeatureFlag | null> {
  const featureFlag = await prisma.featureFlag.delete({
    where: {
      id,
    },
  });

  return featureFlag;
}

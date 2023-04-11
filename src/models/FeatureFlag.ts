import { PrismaClient, FeatureFlag } from "@prisma/client";

const prisma = new PrismaClient();

export async function createFeatureFlag(name: string): Promise<FeatureFlag> {
  const cities = await prisma.city.findMany();

  const newFeatureFlag = await prisma.featureFlag.create({
    data: {
      name,
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
  name?: string;
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
      name: input.name,
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

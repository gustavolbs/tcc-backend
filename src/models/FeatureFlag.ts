import { PrismaClient, FeatureFlag } from "@prisma/client";

const prisma = new PrismaClient();

export async function createFeatureFlag(
  slug: string,
  description: string
): Promise<FeatureFlag> {
  const cities = await prisma.city.findMany();
  const cityFeatureFlagData = cities.map((city) => ({
    cityId: city.id,
    status: false,
  }));

  const newFeatureFlag = await prisma.featureFlag.create({
    data: {
      slug,
      description,
      cities: {
        createMany: {
          data: cityFeatureFlagData,
        },
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

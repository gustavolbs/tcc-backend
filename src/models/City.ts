import { PrismaClient, City } from "@prisma/client";

const prisma = new PrismaClient();

export async function createCity(data: {
  name: string;
  latitude: number;
  longitude: number;
}): Promise<City> {
  const ffs = await prisma.featureFlag.findMany();

  const city: City = await prisma.city.create({
    data: {
      ...data,
      featureFlags: {
        create: ffs.map((ff) => ({
          featureFlag: { connect: { id: ff.id } },
          status: false,
        })),
      },
    },
  });

  return city;
}

export async function updateCity(
  id: number,
  data: {
    name?: string;
    latitude?: number;
    longitude?: number;
    featureFlags?: Array<{
      featureFlagId: number;
      status: boolean;
    }>;
  }
): Promise<City> {
  const city: City = await prisma.city.update({
    where: { id },
    data: {
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });

  // Atualiza o status da feature flag somente se estiver presente no objeto de atualização
  if (data.featureFlags) {
    for (const ff of data.featureFlags) {
      // Verifica se a feature flag pertence à cidade atual
      const cityFeature = await prisma.cityFeature.findUnique({
        where: {
          cityId_featureFlagId: {
            cityId: id,
            featureFlagId: ff.featureFlagId,
          },
        },
      });

      if (cityFeature) {
        await prisma.cityFeature.update({
          where: { id: cityFeature.id },
          data: {
            status: ff.status,
          },
        });
      }
    }
  }

  return city;
}

export async function deleteCity(id: number): Promise<void> {
  await prisma.city.delete({
    where: { id },
  });
}

export async function getCities(): Promise<City[]> {
  const cities: City[] = await prisma.city.findMany();

  return cities;
}

export async function findCityById(id: number): Promise<City | null> {
  const city = await prisma.city.findUnique({
    where: {
      id,
    },
    include: { featureFlags: { include: { featureFlag: true } } },
  });

  return city;
}

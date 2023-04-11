import {
  PrismaClient,
  City,
  FeatureFlagWhereUniqueInput,
} from "@prisma/client";

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
        connect: ffs.map((ff) => ({ id: ff.id })),
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
      id: number;
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
      featureFlags: {
        update: data.featureFlags?.map((ff) => ({
          where: { id: ff.id },
          data: { status: ff.status },
        })),
      },
    },
    include: { featureFlags: true },
  });

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
    include: { featureFlags: true },
  });

  return city;
}

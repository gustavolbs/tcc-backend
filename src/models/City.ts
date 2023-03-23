import { PrismaClient, City } from "@prisma/client";

const prisma = new PrismaClient();

export async function createCity(data: {
  name: string;
  latitude: number;
  longitude: number;
}): Promise<City> {
  const city: City = await prisma.city.create({
    data,
  });

  return city;
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
  });

  return city;
}

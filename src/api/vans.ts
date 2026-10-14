import { api } from "./client";

export type Van = {
  id: string;
  model: string;
  year: number;
  period: string;
  destiny: string;
  capacity: number;
  emTrajeto: boolean;
};

export async function listDriverVans(
  driverId: string,
): Promise<{ vans: Van[] }> {
  const { data } = await api.get(`/vans/driver/${driverId}`);
  return data;
}

export async function createVan(input: {
  model: string;
  year: number;
  period: string;
  destiny: string;
  capacity: number;
  driverId: string;
}) {
  const { data } = await api.post("/vans", input);
  return data;
}

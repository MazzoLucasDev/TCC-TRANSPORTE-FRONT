import { api } from "./client";

export type RouteStop = {
  studentId: string;
  name: string;
  lat: number;
  long: number;
};

export type RouteResult = {
  studentOrder: string[];
  stops: RouteStop[];
  distanceKm: number;
  durationMin: number;
  geometry: { lat: number; long: number }[];
  approximate: boolean;
};

export type RouteComparison = {
  simpleRoute: RouteResult;
  optimizedRoute: RouteResult;
};

export async function generateRouteComparison(input: {
  vanId: string;
  date: string;
  driverLocation: { lat: number; long: number };
  visitedStudentIds?: string[];
  persist?: boolean;
}): Promise<RouteComparison> {
  const { data } = await api.post<RouteComparison>("/routes/generate", input);
  return data;
}

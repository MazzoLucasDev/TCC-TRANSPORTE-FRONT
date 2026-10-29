import { api } from "./client";

export type AttendanceResult = {
  studentId: string;
  date: string;
  status: "PRESENT" | "ABSENT";
};

// date no formato AAAA-MM-DD
export async function registerAbsence(studentId: string, date: string) {
  const { data } = await api.post("/attendance/absence", { studentId, date });
  return data;
}

// desfaz uma ausência registrada
export async function registerPresence(
  studentId: string,
  date: string,
): Promise<AttendanceResult> {
  const { data } = await api.post("/attendance/presence", { studentId, date });
  return data;
}

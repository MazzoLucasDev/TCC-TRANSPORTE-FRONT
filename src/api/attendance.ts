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

export type ConfirmedStudent = {
  studentId: string;
  collectionPoint: { lat: number; long: number };
};

// Alunos que vão embarcar na data (AAAA-MM-DD). Só o motorista dono da van.
export async function listConfirmedAttendance(
  vanId: string,
  date: string,
): Promise<{ confirmedStudents: ConfirmedStudent[] }> {
  const { data } = await api.get("/attendance/confirmed", {
    params: { vanId, date },
  });
  return data;
}

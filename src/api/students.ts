import { api } from "./client";

export type VanStudent = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  collectionPoint: { lat: number; long: number };
};

export type StudentSummary = {
  studentId: string;
  name: string;
  phone: string;
  isLinkedToVan: boolean;
};

export async function listVanStudents(
  vanId: string,
): Promise<{ students: VanStudent[] }> {
  const { data } = await api.get(`/students/van/${vanId}`);
  return data;
}

export async function getStudentSummary(
  studentId: string,
): Promise<StudentSummary> {
  const { data } = await api.get(`/students/${studentId}`);
  return data;
}

export async function linkStudentToVan(studentId: string, vanId: string) {
  const { data } = await api.post("/students/link", { studentId, vanId });
  return data;
}

export async function unlinkStudentFromVan(studentId: string) {
  const { data } = await api.post("/students/unlink", { studentId });
  return data;
}

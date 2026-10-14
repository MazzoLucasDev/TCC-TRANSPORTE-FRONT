import { api } from "./client";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    userType: "MOTORISTA" | "ALUNO";
    roleId: string;
  };
};

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/login", { email, password });
  return data;
}

type registerDriverInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  license: string;
  dateOfBirth: string;
};

export async function registerDriver(input: registerDriverInput) {
  const { data } = await api.post("users", { ...input, userType: "MOTORISTA" });
  return data;
}

type registerStudentInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  collectionPoint: { lat: number; long: number };
};

export async function registerStudent(input: registerStudentInput) {
  const { data } = await api.post("/users", { ...input, userType: "ALUNO" });
  return data;
}

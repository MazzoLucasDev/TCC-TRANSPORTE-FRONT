//Serve pra guardar quem tá logado

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

type User = {
  id: string;
  name: string;
  userType: "MOTORISTA" | "ALUNO";
  roleId: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ao abrir o app, tenta recuperar sessão salva
  useEffect(() => {
    async function loadStoredUser() {
      const storedUser = await AsyncStorage.getItem("@rotavan:user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
    loadStoredUser();
  }, []);
  async function signIn(email: string, password: string) {
    const response = await authApi.login(email, password);
    await AsyncStorage.setItem("@rotavan:token", response.token);
    await AsyncStorage.setItem("@rotavan:user", JSON.stringify(response.user));
    setUser(response.user);
  }

  async function signOut() {
    await AsyncStorage.multiRemove(["@rotavan:token", "@rotavan:user"]);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}{" "}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.18.99:3000/api";

// Use o IP da sua máquina na rede local, ou a URL do Render depois do deploy.
const BASE_URL_CEL = "";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// injeta o token em toda requisição autenticada, automaticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@rotavan:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Screen } from "../components/Screen";
import { useAuth } from "../contexts/AuthContext";
import { colors, fontSize, spacing } from "../theme";

export function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha e-mail e senha!");
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error: any) {
      const message =
        error.response?.data?.error ?? "Não foi possível conectar ao servidor";
      Alert.alert("Erro ao entrar", message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Screen centered>
      <Text style={styles.title}>RotaVan</Text>

      <Input
        label="E-mail"
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        label="Senha"
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Entrar" loading={loading} onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </Screen>
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.title,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: spacing.xxl,
    color: colors.primary,
  },
  link: { color: colors.primary, textAlign: "center", marginTop: spacing.lg },
});

// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import { Text, StyleSheet, Alert, View } from "react-native";
import * as Location from "expo-location";
import { Screen } from "../components/Screen";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { registerDriver, registerStudent } from "../api/auth";
import { formatDateInput, brDateToIso } from "../utils/date";
import { colors, spacing, fontSize } from "../theme";

type UserType = "MOTORISTA" | "ALUNO";
type Coords = { lat: number; long: number };

export function RegisterScreen() {
  const { signIn } = useAuth();

  const [userType, setUserType] = useState<UserType>("ALUNO");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [license, setLicense] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  async function handleUseLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Precisamos da localização para definir seu ponto de coleta.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      setCoords({
        lat: position.coords.latitude,
        long: position.coords.longitude,
      });
    } catch {
      Alert.alert("Erro", "Não foi possível obter sua localização.");
    } finally {
      setLocating(false);
    }
  }

  async function handleRegister() {
    const isoDate = brDateToIso(dateOfBirth);

    if (!name || !email || !password || !phone || !isoDate) {
      Alert.alert(
        "Atenção",
        "Preencha todos os campos, com a data no formato DD/MM/AAAA",
      );
      return;
    }
    if (userType === "MOTORISTA" && !license) {
      Alert.alert("Atenção", "Informe o número da CNH");
      return;
    }
    if (userType === "ALUNO" && !coords) {
      Alert.alert("Atenção", "Defina seu ponto de coleta");
      return;
    }

    setLoading(true);
    try {
      const base = {
        name: name.trim(),
        email: email.trim(),
        password,
        phone,
        dateOfBirth: isoDate,
      };

      if (userType === "MOTORISTA") {
        await registerDriver({ ...base, license });
      } else if (coords) {
        await registerStudent({ ...base, collectionPoint: coords });
      }

      // já entra logado: a navegação troca de telas sozinha
      await signIn(base.email, password);
    } catch (error: any) {
      const message =
        error.response?.data?.error ?? "Não foi possível conectar ao servidor";
      Alert.alert("Erro no cadastro", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.sectionTitle}>Eu sou</Text>
      <View style={styles.row}>
        <Button
          title="Aluno"
          variant={userType === "ALUNO" ? "primary" : "outline"}
          onPress={() => setUserType("ALUNO")}
          style={styles.flex}
        />
        <Button
          title="Motorista"
          variant={userType === "MOTORISTA" ? "primary" : "outline"}
          onPress={() => setUserType("MOTORISTA")}
          style={styles.flex}
        />
      </View>

      <Input label="Nome completo" value={name} onChangeText={setName} />
      <Input
        label="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.hint}>
        Mínimo de 8 caracteres, com maiúscula, minúscula e número
      </Text>

      <Input
        label="Telefone (com DDD)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Input
        label="Data de nascimento"
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
        value={dateOfBirth}
        onChangeText={(text) => setDateOfBirth(formatDateInput(text))}
      />

      {userType === "MOTORISTA" ? (
        <Input
          label="CNH (11 dígitos)"
          keyboardType="number-pad"
          value={license}
          onChangeText={setLicense}
        />
      ) : (
        <View>
          <Text style={styles.sectionTitle}>Ponto de coleta</Text>
          <Button
            title={
              coords ? "Atualizar localização" : "Usar minha localização atual"
            }
            variant="outline"
            loading={locating}
            onPress={handleUseLocation}
          />
          {coords && (
            <Text style={styles.hint}>
              Localização definida: {coords.lat.toFixed(5)},{" "}
              {coords.long.toFixed(5)}
            </Text>
          )}
        </View>
      )}

      <Button title="Criar conta" loading={loading} onPress={handleRegister} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  row: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  flex: { flex: 1 },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
});

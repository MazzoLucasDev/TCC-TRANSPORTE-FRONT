import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { registerAbsence, registerPresence } from "../../api/attendance";
import { Screen } from "../../components/Screen";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { colors, fontSize, spacing } from "../../theme";
import {
  addDaysIso,
  brDateToIso,
  formatDateInput,
  isRealIsoDate,
  isoToBr,
  todayIso,
} from "../../utils/date";

export function AbsenceScreen({ navigation }: any) {
  const { user } = useAuth();
  const [date, setDate] = useState(isoToBr(addDaysIso(1))); // padrão: amanhã
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<"absence" | "presence" | null>(null);

  // devolve a data em AAAA-MM-DD ou mostra o erro no campo
  function validate(): string | null {
    const iso = brDateToIso(date);
    if (!iso || !isRealIsoDate(iso)) {
      setError("Informe uma data válida (dd/mm/aaaa)");
      return null;
    }
    if (iso < todayIso()) {
      setError("A data não pode estar no passado");
      return null;
    }
    setError(undefined);
    return iso;
  }

  async function submit(kind: "absence" | "presence") {
    const iso = validate();
    if (!iso || !user) return;

    setLoading(kind);
    try {
      if (kind === "absence") {
        await registerAbsence(user.roleId, iso);
      } else {
        await registerPresence(user.roleId, iso);
      }
      Alert.alert(
        "Pronto",
        kind === "absence"
          ? `Ausência registrada para ${isoToBr(iso)}.`
          : `Ausência cancelada em ${isoToBr(iso)}.`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e.response?.data?.error ?? "Não foi possível concluir",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <Screen>
      <Text style={styles.hint}>
        Escolha o dia em que você não vai usar a van. O motorista deixa de
        incluir você na rota desse dia.
      </Text>

      <Input
        label="Data"
        value={date}
        onChangeText={(value) => setDate(formatDateInput(value))}
        placeholder="dd/mm/aaaa"
        keyboardType="number-pad"
        maxLength={10}
        error={error}
      />

      <Button
        title="Hoje"
        variant="outline"
        onPress={() => setDate(isoToBr(todayIso()))}
      />
      <Button
        title="Amanhã"
        variant="outline"
        onPress={() => setDate(isoToBr(addDaysIso(1)))}
      />

      <Button
        title="Registrar ausência"
        variant="danger"
        loading={loading === "absence"}
        disabled={loading !== null}
        onPress={() => submit("absence")}
      />
      <Button
        title="Cancelar ausência nesta data"
        variant="outline"
        loading={loading === "presence"}
        disabled={loading !== null}
        onPress={() => submit("presence")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
});

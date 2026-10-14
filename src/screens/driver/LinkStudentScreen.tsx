import React, { useState } from "react";
import { Text, StyleSheet, Alert } from "react-native";
import { Screen } from "../../components/Screen";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import {
  getStudentSummary,
  linkStudentToVan,
  type StudentSummary,
} from "../../api/students";
import { colors, spacing, fontSize } from "../../theme";

export function LinkStudentScreen({ route, navigation }: any) {
  const { vanId } = route.params as { vanId: string };

  const [code, setCode] = useState("");
  const [student, setStudent] = useState<StudentSummary | null>(null);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);

  async function handleSearch() {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert("Atenção", "Cole o código do aluno");
      return;
    }

    setSearching(true);
    setStudent(null);
    try {
      setStudent(await getStudentSummary(trimmed));
    } catch (error: any) {
      Alert.alert(
        "Aluno não encontrado",
        error.response?.data?.error ?? "Confira o código e tente de novo",
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleLink() {
    if (!student) return;

    setLinking(true);
    try {
      await linkStudentToVan(student.studentId, vanId);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Erro ao vincular",
        error.response?.data?.error ?? "Não foi possível vincular",
      );
    } finally {
      setLinking(false);
    }
  }

  return (
    <Screen>
      <Input
        label="Código do aluno"
        placeholder="Cole aqui o código enviado pelo aluno"
        autoCapitalize="none"
        autoCorrect={false}
        value={code}
        onChangeText={(text) => {
          setCode(text);
          setStudent(null); // evita mostrar um aluno que não corresponde ao código atual
        }}
      />

      <Button
        title="Buscar aluno"
        variant="outline"
        loading={searching}
        onPress={handleSearch}
      />

      {student && (
        <Card style={styles.result}>
          <Text style={styles.label}>Confirme os dados do aluno</Text>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.phone}>{student.phone}</Text>

          {student.isLinkedToVan ? (
            <Text style={styles.warning}>
              Este aluno já está vinculado a uma van.
            </Text>
          ) : (
            <Button
              title="Confirmar vínculo"
              loading={linking}
              onPress={handleLink}
            />
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  result: { marginTop: spacing.lg },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  name: { fontSize: fontSize.lg, fontWeight: "bold", color: colors.text },
  phone: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  warning: { color: colors.danger, fontWeight: "bold", marginTop: spacing.sm },
});

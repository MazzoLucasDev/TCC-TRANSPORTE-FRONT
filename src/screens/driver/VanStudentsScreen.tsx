import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  listVanStudents,
  unlinkStudentFromVan,
  type VanStudent,
} from "../../api/students";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { colors, spacing, fontSize } from "../../theme";

export function VanStudentsScreen({ route, navigation }: any) {
  const { vanId } = route.params as { vanId: string };
  const [students, setStudents] = useState<VanStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    try {
      const result = await listVanStudents(vanId);
      setStudents(result.students);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.error ?? "Não foi possível carregar os alunos",
      );
    } finally {
      setLoading(false);
    }
  }, [vanId]);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents]),
  );

  function confirmUnlink(student: VanStudent) {
    Alert.alert("Remover aluno", `Remover ${student.name} desta van?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await unlinkStudentFromVan(student.id);
            await loadStudents();
          } catch (error: any) {
            Alert.alert(
              "Erro",
              error.response?.data?.error ?? "Não foi possível remover o aluno",
            );
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(student) => student.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum aluno vinculado a esta van ainda.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
            <Button
              title="Remover da van"
              variant="danger"
              onPress={() => confirmUnlink(item)}
            />
          </Card>
        )}
      />

      <View style={styles.footer}>
        <Button
          title="Vincular aluno"
          onPress={() => navigation.navigate("LinkStudent", { vanId })}
        />
        <Button
          title="Gerar rota de hoje"
          variant="outline"
          onPress={() => navigation.navigate("Route", { vanId })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.xxl,
  },
  name: { fontSize: fontSize.lg, fontWeight: "bold", color: colors.text },
  phone: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

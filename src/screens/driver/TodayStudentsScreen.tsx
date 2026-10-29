import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { listVanStudents, type VanStudent } from "../../api/students";
import { listConfirmedAttendance } from "../../api/attendance";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { colors, spacing, fontSize } from "../../theme";
import { isoToBr, todayIso, weekdayPt } from "../../utils/date";

export function TodayStudentsScreen({ route, navigation }: any) {
  const { vanId } = route.params as { vanId: string };
  const [students, setStudents] = useState<VanStudent[]>([]);
  const [totalLinked, setTotalLinked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [today, setToday] = useState(todayIso());

  const load = useCallback(async () => {
    const date = todayIso();
    setToday(date);
    try {
      const [all, confirmed] = await Promise.all([
        listVanStudents(vanId),
        listConfirmedAttendance(vanId, date),
      ]);
      const confirmedIds = new Set(
        confirmed.confirmedStudents.map((c) => c.studentId),
      );
      setTotalLinked(all.students.length);
      setStudents(all.students.filter((s) => confirmedIds.has(s.id)));
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.error ?? "Não foi possível carregar os alunos",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vanId]);

  // recarrega sempre que a tela volta ao foco (aluno pode ter avisado ausência)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const absent = totalLinked - students.length;
  const noStudents = students.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>
          {weekdayPt(today)}, {isoToBr(today)}
        </Text>
        <Text style={styles.summary}>
          {students.length} {students.length === 1 ? "aluno" : "alunos"} hoje
          {absent > 0 ? ` · ${absent} ausente${absent > 1 ? "s" : ""}` : ""}
        </Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {totalLinked === 0
              ? "Nenhum aluno vinculado a esta van."
              : "Todos os alunos avisaram que não vão hoje."}
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
          </Card>
        )}
      />

      <View style={styles.footer}>
        <Button
          title="Gerar rota de hoje"
          disabled={noStudents}
          onPress={() => navigation.navigate("Route", { vanId })}
        />
        {noStudents && (
          <Text style={styles.hint}>
            Sem alunos confirmados, não há rota para gerar.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { justifyContent: "center", alignItems: "center" },
  header: { padding: spacing.lg, paddingBottom: 0, gap: spacing.xs },
  date: { fontSize: fontSize.md, color: colors.textMuted },
  summary: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  name: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  phone: { fontSize: fontSize.sm, color: colors.textMuted },
  footer: { padding: spacing.lg, gap: spacing.sm },
  hint: {
    textAlign: "center",
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

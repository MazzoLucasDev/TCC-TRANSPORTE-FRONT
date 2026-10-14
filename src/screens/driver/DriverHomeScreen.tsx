import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { listDriverVans, type Van } from "../../api/vans";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { colors, spacing, fontSize } from "../../theme";

const PERIOD_LABEL: Record<string, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
};

export function DriverHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVans = useCallback(async () => {
    if (!user) return;
    try {
      const result = await listDriverVans(user.id);
      setVans(result.vans);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.error ?? "Não foi possível carregar suas vans",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // recarrega toda vez que a tela volta a ficar em foco (ex: depois de criar uma van)
  useFocusEffect(
    useCallback(() => {
      loadVans();
    }, [loadVans]),
  );

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
        data={vans}
        keyExtractor={(van) => van.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadVans();
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Você ainda não tem vans cadastradas.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("VanStudents", { vanId: item.id })
            }
          >
            <Card>
              <Text style={styles.cardTitle}>
                {item.model} ({item.year})
              </Text>
              <Text style={styles.cardLine}>Destino: {item.destiny}</Text>
              <Text style={styles.cardLine}>
                Período: {PERIOD_LABEL[item.period] ?? item.period}
              </Text>
              <Text style={styles.cardLine}>
                Capacidade: {item.capacity} lugares
              </Text>
              <Text style={styles.cardHint}>Toque para ver os alunos</Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Button
          title="Cadastrar van"
          onPress={() => navigation.navigate("CreateVan")}
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
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardLine: { fontSize: fontSize.md, color: colors.textMuted },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardHint: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.sm,
  },
});
1;

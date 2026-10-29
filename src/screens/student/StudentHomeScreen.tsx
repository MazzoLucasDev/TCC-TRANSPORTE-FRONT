import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { getMyProfile, type MyProfile } from "../../api/students";
import { registerAbsence, registerPresence } from "../../api/attendance";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { colors, spacing, fontSize, radius } from "../../theme";
import { isoToBr, todayIso, weekdayPt } from "../../utils/date";

const PERIOD_LABEL: Record<string, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
};

export function StudentHomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [today, setToday] = useState(todayIso());

  const load = useCallback(async () => {
    const date = todayIso(); // recalcula: o app pode ficar aberto de um dia para o outro
    setToday(date);
    try {
      setProfile(await getMyProfile(date));
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.error ?? "Não foi possível carregar seus dados",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // recarrega sempre que a tela volta ao foco (ex: depois de avisar uma ausência)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function changeTodayStatus(absent: boolean) {
    if (!profile) return;
    setSaving(true);
    try {
      if (absent) {
        await registerAbsence(profile.studentId, today);
      } else {
        await registerPresence(profile.studentId, today);
      }
      await load();
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.error ?? "Não foi possível atualizar sua presença",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmAbsence() {
    Alert.alert(
      "Avisar ausência",
      "O motorista não vai buscar você hoje. Confirmar?",
      [
        { text: "Voltar", style: "cancel" },
        { text: "Confirmar", onPress: () => changeTodayStatus(true) },
      ],
    );
  }

  async function handleShare() {
    if (!user) return;
    await Share.share({
      message: `Meu código de aluno no OptiVan: ${user.roleId}`,
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const van = profile?.van ?? null;
  const absent = profile?.attendance.status === "ABSENT";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
    >
      <Text style={styles.greeting}>Olá, {user?.name}!</Text>

      {van ? (
        <>
          <Card>
            <Text style={styles.cardLabel}>
              Hoje · {weekdayPt(today)}, {isoToBr(today)}
            </Text>
            <View
              style={[styles.pill, absent ? styles.pillAbsent : styles.pillOk]}
            >
              <Text
                style={[
                  styles.pillText,
                  absent ? styles.pillTextAbsent : styles.pillTextOk,
                ]}
              >
                {absent ? "Ausente hoje" : "Vai embarcar hoje"}
              </Text>
            </View>

            {absent ? (
              <Button
                title="Cancelar ausência"
                variant="outline"
                loading={saving}
                onPress={() => changeTodayStatus(false)}
              />
            ) : (
              <Button
                title="Não vou hoje"
                variant="danger"
                loading={saving}
                onPress={confirmAbsence}
              />
            )}
            <Button
              title="Avisar ausência em outra data"
              variant="outline"
              onPress={() => navigation.navigate("Absence")}
            />
          </Card>

          <Card>
            <Text style={styles.cardLabel}>Minha van</Text>
            <Text style={styles.vanModel}>{van.model}</Text>
            {van.emTrajeto && (
              <Text style={styles.onTheWay}>Van em trajeto</Text>
            )}
            <Text style={styles.line}>
              Período: {PERIOD_LABEL[van.period] ?? van.period}
            </Text>
            <Text style={styles.line}>Destino: {van.destiny}</Text>

            {van.driver && (
              <View style={styles.driver}>
                <Text style={styles.line}>Motorista: {van.driver.name}</Text>
                <Button
                  title={`Ligar para ${van.driver.phone}`}
                  variant="outline"
                  onPress={() => Linking.openURL(`tel:${van.driver!.phone}`)}
                />
              </View>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <Text style={styles.cardLabel}>Você ainda não está em uma van</Text>
          <Text style={styles.hint}>
            Envie seu código ao motorista para ele vincular você.
          </Text>
          <Text selectable style={styles.code}>
            {user?.roleId}
          </Text>
          <Button title="Compartilhar código" onPress={handleShare} />
        </Card>
      )}

      <Button title="Sair" variant="outline" onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  greeting: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  pill: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  pillOk: { backgroundColor: "#e8f5e9" },
  pillAbsent: { backgroundColor: "#fdecea" },
  pillText: { fontSize: fontSize.md, fontWeight: "bold" },
  pillTextOk: { color: colors.success },
  pillTextAbsent: { color: colors.danger },
  vanModel: { fontSize: fontSize.lg, fontWeight: "bold", color: colors.text },
  onTheWay: {
    color: colors.success,
    fontWeight: "bold",
    marginTop: spacing.xs,
  },
  line: { fontSize: fontSize.md, color: colors.text, marginTop: spacing.xs },
  driver: { marginTop: spacing.sm },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  code: {
    fontSize: fontSize.sm,
    color: colors.primary,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
});

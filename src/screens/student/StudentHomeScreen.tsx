import React from "react";
import { Text, StyleSheet, Share } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { colors, spacing, fontSize } from "../../theme";

export function StudentHomeScreen() {
  const { user, signOut } = useAuth();

  async function handleShare() {
    if (!user) return;
    await Share.share({
      message: `Meu código de aluno no RotaVan: ${user.roleId}`,
    });
  }

  return (
    <Screen>
      <Text style={styles.greeting}>Olá, {user?.name}!</Text>

      <Card>
        <Text style={styles.cardTitle}>Seu código de aluno</Text>
        <Text style={styles.hint}>
          Envie este código ao motorista para ele vincular você à van.
        </Text>
        <Text selectable style={styles.code}>
          {user?.roleId}
        </Text>
        <Button title="Compartilhar código" onPress={handleShare} />
      </Card>

      <Button title="Sair" variant="outline" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: "bold", color: colors.text },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginVertical: spacing.sm,
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

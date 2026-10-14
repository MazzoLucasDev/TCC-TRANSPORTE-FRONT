import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { colors, spacing } from "../theme";

type ScreenProps = {
  children: React.ReactNode;
  centered?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, centered = false, style }: ScreenProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          centered && styles.centered,
          style,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.xl },
  centered: { justifyContent: "center" },
});

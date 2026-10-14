// src/components/Button.tsx
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import { colors, fontSize, radius, spacing } from "../theme";

type ButtonProps = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
  variant?: "primary" | "danger" | "outline";
};

export function Button({
  title,
  loading = false,
  variant = "primary",
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isOutline = variant === "outline";

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, isOutline && styles.textOutline]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: { opacity: 0.6 },
  text: { color: colors.white, fontWeight: "bold", fontSize: fontSize.md },
  textOutline: { color: colors.primary },
});

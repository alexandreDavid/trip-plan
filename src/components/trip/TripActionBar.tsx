import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

type IconName = keyof typeof Ionicons.glyphMap;

export interface TripAction {
  icon: IconName;
  label: string;
  onPress: () => void;
}

export function TripActionBar({ actions }: { actions: TripAction[] }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.bar}>
      {actions.map((a) => (
        <Pressable
          key={a.label}
          onPress={a.onPress}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Ionicons name={a.icon} size={22} color={colors.primary} />
          <Text style={styles.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.xs },
  pressed: { opacity: 0.6 },
  label: { fontSize: fontSize.xs, color: colors.text, fontWeight: '600' },
});

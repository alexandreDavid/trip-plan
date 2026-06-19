import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  value?: string; // valeur sélectionnée (undefined = aucune)
  options: SelectOption[];
  placeholder?: string; // affiché si rien n'est sélectionné
  onChange: (value: string | undefined) => void;
  // Si fourni, une première ligne permet de revenir à "aucune sélection".
  noneLabel?: string;
  error?: string;
}

// Select cross-plateforme : un champ qui ouvre une modale avec la liste des
// options. Fonctionne sur iOS / Android / Web (pas de <select> natif RN).
export function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
  noneLabel,
  error,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  const pick = (v: string | undefined) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[styles.field, error ? styles.fieldError : null]}
        onPress={() => setOpen(true)}
      >
        <Text style={selected ? styles.value : styles.placeholder} numberOfLines={1}>
          {selected ? selected.label : placeholder ?? ''}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <ScrollView bounces={false} style={styles.list}>
              {noneLabel != null && (
                <Pressable style={styles.row} onPress={() => pick(undefined)}>
                  <Text
                    style={[styles.rowText, styles.rowMuted, value == null && styles.rowActive]}
                    numberOfLines={1}
                  >
                    {noneLabel}
                  </Text>
                  {value == null && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </Pressable>
              )}
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable key={o.value} style={styles.row} onPress={() => pick(o.value)}>
                    <Text style={[styles.rowText, active && styles.rowActive]} numberOfLines={1}>
                      {o.label}
                    </Text>
                    {active && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: { marginBottom: spacing.md },
    label: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      marginBottom: spacing.xs,
      color: colors.text,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      minHeight: 48,
      gap: spacing.sm,
    },
    fieldError: { borderColor: colors.danger },
    value: { flex: 1, fontSize: fontSize.md, color: colors.text },
    placeholder: { flex: 1, fontSize: fontSize.md, color: colors.textMuted },
    error: { color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      maxHeight: '70%',
      overflow: 'hidden',
    },
    list: { paddingVertical: spacing.xs },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
    },
    rowText: { flex: 1, fontSize: fontSize.md, color: colors.text },
    rowMuted: { color: colors.textMuted },
    rowActive: { color: colors.primary, fontWeight: '700' },
  });

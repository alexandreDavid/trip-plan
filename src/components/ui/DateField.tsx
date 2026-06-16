import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  getDay,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import { radius, spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDate } from '@/utils/dates';

interface Props {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
}

// Calendrier en JS pur (date-fns), localisé via formatDate. Fonctionne sur
// iOS / Android / Web sans module natif.
export function DateField({ label, value, onChange, placeholder, error }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(value ?? new Date()));

  // En-têtes de jours (lun..dim), localisés.
  const weekdays = useMemo(() => {
    const monday = new Date(2024, 0, 1); // un lundi
    return Array.from({ length: 7 }, (_, i) => formatDate(addDays(monday, i), 'EEEEEE'));
  }, []);

  const days = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    const leading = (getDay(start) + 6) % 7; // décalage lundi-premier
    return [...Array(leading).fill(null), ...eachDayOfInterval({ start, end })];
  }, [viewMonth]);

  const openPicker = () => {
    setViewMonth(startOfMonth(value ?? new Date()));
    setOpen(true);
  };

  const pick = (d: Date) => {
    onChange(d);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[styles.field, error ? styles.fieldError : null]}
        onPress={openPicker}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? formatDate(value, 'EEE d MMM yyyy') : placeholder ?? ''}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
              <Pressable onPress={() => setViewMonth((m) => addMonths(m, -1))} hitSlop={8}>
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
              <Text style={styles.month}>{formatDate(viewMonth, 'LLLL yyyy')}</Text>
              <Pressable onPress={() => setViewMonth((m) => addMonths(m, 1))} hitSlop={8}>
                <Ionicons name="chevron-forward" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.grid}>
              {weekdays.map((w, i) => (
                <View key={`w${i}`} style={styles.cell}>
                  <Text style={styles.weekday}>{w}</Text>
                </View>
              ))}
              {days.map((d, i) => {
                if (!d) return <View key={`e${i}`} style={styles.cell} />;
                const selected = value ? isSameDay(d, value) : false;
                return (
                  <Pressable key={d.toISOString()} style={styles.cell} onPress={() => pick(d)}>
                    <View style={[styles.dayWrap, selected && styles.daySelected]}>
                      <Text style={[styles.dayText, selected && styles.daySelectedText]}>
                        {d.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
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
    },
    fieldError: { borderColor: colors.danger },
    value: { fontSize: fontSize.md, color: colors.text },
    placeholder: { fontSize: fontSize.md, color: colors.textMuted },
    error: { color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    month: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
    weekday: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
    dayWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    daySelected: { backgroundColor: colors.primary },
    dayText: { fontSize: fontSize.sm, color: colors.text },
    daySelectedText: { color: '#fff', fontWeight: '700' },
  });

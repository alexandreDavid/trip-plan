import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventType } from '@/types';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { eventMeta } from './eventMeta';

const EVENT_TYPES: EventType[] = [
  EventType.ACCOMMODATION,
  EventType.TRANSPORT,
  EventType.ACTIVITY,
  EventType.RESTAURANT,
];

interface Props {
  visible: boolean;
  onSelect: (type: EventType) => void;
  onClose: () => void;
}

// Feuille du bas pour choisir le type d'un nouvel événement.
export function EventTypePicker({ visible, onSelect, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.title}>{t('trip.eventTypeTitle')}</Text>
        {EVENT_TYPES.map((type) => {
          const meta = eventMeta[type];
          return (
            <Pressable key={type} style={styles.item} onPress={() => onSelect(type)}>
              <View style={[styles.icon, { backgroundColor: meta.color + '22' }]}>
                <Ionicons name={meta.icon} size={20} color={meta.color} />
              </View>
              <Text style={styles.label}>{t(meta.labelKey)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
    },
    title: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md, color: colors.text },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
    icon: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: { fontSize: fontSize.md, color: colors.text, fontWeight: '500' },
  });

import React, { useLayoutEffect, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, EventType, TripEvent } from '@/types';
import { DEFAULT_CURRENCY } from '@/config/constants';
import { useTrip } from '@/hooks/useTrip';
import { useEvents } from '@/hooks/useEvents';
import { deleteEvent } from '@/services/eventService';
import { eventMeta } from '@/components/event/eventMeta';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT, TranslateFn } from '@/i18n/I18nContext';
import { formatTime, formatDate } from '@/utils/dates';
import { formatMoney } from '@/utils/expenses';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

interface Row {
  label: string;
  value: string;
}

function buildRows(event: TripEvent, t: TranslateFn): Row[] {
  const rows: Row[] = [];
  switch (event.type) {
    case EventType.ACCOMMODATION:
      if (event.address) rows.push({ label: t('event.address'), value: event.address });
      if (event.checkInTime)
        rows.push({ label: t('event.checkIn'), value: formatTime(event.checkInTime) });
      if (event.checkOutTime)
        rows.push({
          label: t('event.checkOut'),
          value: `${formatDate(event.checkOutTime, 'd MMM')} · ${formatTime(event.checkOutTime)}`,
        });
      break;
    case EventType.TRANSPORT:
      rows.push({ label: t('event.mode'), value: t(`event.transport.${event.transportMode}`) });
      rows.push({
        label: t('event.departure'),
        value:
          event.departureLocation +
          (event.departureTime ? ` · ${formatTime(event.departureTime)}` : ''),
      });
      rows.push({
        label: t('event.arrival'),
        value:
          event.arrivalLocation + (event.arrivalTime ? ` · ${formatTime(event.arrivalTime)}` : ''),
      });
      break;
    case EventType.ACTIVITY:
      if (event.location) rows.push({ label: t('event.place'), value: event.location });
      if (event.startTime) rows.push({ label: t('event.start'), value: formatTime(event.startTime) });
      if (event.endTime) rows.push({ label: t('event.end'), value: formatTime(event.endTime) });
      break;
    case EventType.RESTAURANT:
      if (event.address) rows.push({ label: t('event.address'), value: event.address });
      if (event.time) rows.push({ label: t('event.time'), value: formatTime(event.time) });
      break;
  }
  return rows;
}

export function EventDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { tripId, dayId, eventId } = route.params;
  const { trip, canEdit } = useTrip(tripId);
  const { events, loading } = useEvents(tripId, dayId);

  const event = events.find((e) => e.id === eventId);
  const currency = trip?.baseCurrency ?? DEFAULT_CURRENCY;

  const handleDelete = () => {
    Alert.alert(t('trip.deleteEventTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteEvent(tripId, dayId, eventId);
          navigation.goBack();
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: event?.name ?? '',
      headerRight: () =>
        canEdit && event ? (
          <View style={styles.headerActions}>
            <Pressable
              onPress={() =>
                navigation.navigate('AddEditEvent', { tripId, dayId, eventId, eventType: event.type })
              }
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8} style={{ marginLeft: spacing.md }}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          </View>
        ) : null,
    });
  }, [navigation, event, canEdit, tripId, dayId, eventId, colors, styles, t]);

  if (loading) return <LoadingScreen />;
  if (!event) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.container}>
          <Text style={styles.muted}>{t('common.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const meta = eventMeta[event.type];
  const rows = buildRows(event, t);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: meta.color + '22' }]}>
            <Ionicons name={meta.icon} size={26} color={meta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{event.name}</Text>
            <Text style={[styles.type, { color: meta.color }]}>{t(meta.labelKey)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          {rows.map((row, i) => (
            <View key={i} style={[styles.row, i > 0 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
          {event.budget != null && (
            <View style={[styles.row, rows.length > 0 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{t('event.budgetLabel')}</Text>
              <Text style={styles.rowValue}>{formatMoney(event.budget, currency)}</Text>
            </View>
          )}
        </View>

        {event.notes ? (
          <View style={styles.card}>
            <Text style={styles.notesLabel}>{t('event.notes')}</Text>
            <Text style={styles.notes}>{event.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { padding: spacing.md },
    headerActions: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
    type: { fontSize: fontSize.sm, fontWeight: '600', marginTop: 2 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    rowLabel: { fontSize: fontSize.sm, color: colors.textMuted },
    rowValue: { flex: 1, fontSize: fontSize.md, color: colors.text, textAlign: 'right', fontWeight: '500' },
    notesLabel: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    notes: { fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md, lineHeight: 22 },
    muted: { fontSize: fontSize.md, color: colors.textMuted },
  });

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { createTrip, getTrip, updateTrip } from '@/services/tripService';
import { uploadTripCoverImage } from '@/services/storageService';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/config/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { spacing, fontSize, radius, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { validateTripForm } from '@/utils/validation';
import { DateField } from '@/components/ui/DateField';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditTrip'>;

export function AddEditTripScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const tripId = route.params?.tripId;
  const isEditing = !!tripId;

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [baseCurrency, setBaseCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [coverLocalUri, setCoverLocalUri] = useState<string | undefined>();
  const [coverRemoteUrl, setCoverRemoteUrl] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    (async () => {
      const trip = await getTrip(tripId);
      if (!trip) return;
      setName(trip.name);
      setDestination(trip.destination);
      setStartDate(trip.startDate.toDate());
      setEndDate(trip.endDate.toDate());
      setBaseCurrency(trip.baseCurrency ?? DEFAULT_CURRENCY);
      setCoverRemoteUrl(trip.coverImageURL);
    })();
  }, [tripId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverLocalUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    const errs = validateTripForm({ name, destination, startDate, endDate });
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !startDate || !endDate) return;

    setSubmitting(true);
    try {
      let id = tripId;
      if (isEditing && id) {
        await updateTrip(id, { name, destination, startDate, endDate, baseCurrency });
      } else {
        id = await createTrip(
          user.uid,
          { name, destination, startDate, endDate, baseCurrency },
          user.displayName ?? user.email?.split('@')[0] ?? undefined,
        );
      }
      if (coverLocalUri && id) {
        // Upload non bloquant : Cloud Storage peut être indisponible (plan
        // gratuit). On n'échoue pas la création/édition du voyage pour autant.
        try {
          const url = await uploadTripCoverImage(id, coverLocalUri);
          await updateTrip(id, { coverImageURL: url });
        } catch {
          Alert.alert(t('common.error'), t('common.imageUploadFailed'));
        }
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.error'), (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const coverUri = coverLocalUri ?? coverRemoteUrl;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={pickImage} style={styles.coverWrap}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
              <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              <Text style={styles.coverLabel}>{t('trip.coverAdd')}</Text>
            </View>
          )}
        </Pressable>

        <Input label={t('trip.name')} value={name} onChangeText={setName} error={errors.name} />
        <Input
          label={t('trip.destination')}
          value={destination}
          onChangeText={setDestination}
          error={errors.destination}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <DateField
              label={t('trip.startDate')}
              value={startDate}
              onChange={setStartDate}
              placeholder={t('trip.datePlaceholder')}
              error={errors.startDate}
            />
          </View>
          <View style={styles.half}>
            <DateField
              label={t('trip.endDate')}
              value={endDate}
              onChange={setEndDate}
              placeholder={t('trip.datePlaceholder')}
              error={errors.endDate}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>{t('trip.currency')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
          {CURRENCIES.map((c) => {
            const active = c === baseCurrency;
            return (
              <Pressable
                key={c}
                onPress={() => setBaseCurrency(c)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Button
          title={isEditing ? t('common.save') : t('trip.create')}
          onPress={handleSubmit}
          loading={submitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md },
  coverWrap: { marginBottom: spacing.md },
  cover: { width: '100%', height: 160, borderRadius: radius.md, backgroundColor: colors.border },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  coverLabel: { marginTop: spacing.xs, color: colors.textMuted, fontSize: fontSize.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  currencyScroll: { marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipInactive: { borderColor: colors.border, backgroundColor: colors.surface },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});

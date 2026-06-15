import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { createTrip, getTrip, updateTrip } from '@/services/tripService';
import { uploadTripCoverImage } from '@/services/storageService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, radius } from '@/theme';
import { validateTripForm } from '@/utils/validation';
import { formatDate } from '@/utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditTrip'>;

export function AddEditTripScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const tripId = route.params?.tripId;
  const isEditing = !!tripId;

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
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
      setStartDateInput(formatDate(trip.startDate, 'yyyy-MM-dd'));
      setEndDateInput(formatDate(trip.endDate, 'yyyy-MM-dd'));
      setCoverRemoteUrl(trip.coverImageURL);
    })();
  }, [tripId]);

  const parseDate = (s: string): Date | undefined => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
    const d = new Date(s + 'T00:00:00');
    return isNaN(d.getTime()) ? undefined : d;
  };

  const handleStartChange = (s: string) => {
    setStartDateInput(s);
    setStartDate(parseDate(s));
  };

  const handleEndChange = (s: string) => {
    setEndDateInput(s);
    setEndDate(parseDate(s));
  };

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
        await updateTrip(id, { name, destination, startDate, endDate });
      } else {
        id = await createTrip(user.uid, {
          name,
          destination,
          startDate,
          endDate,
        });
      }
      if (coverLocalUri && id) {
        const url = await uploadTripCoverImage(id, coverLocalUri);
        await updateTrip(id, { coverImageURL: url });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', (err as Error).message);
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
              <Text style={styles.coverLabel}>Ajouter une image</Text>
            </View>
          )}
        </Pressable>

        <Input label="Nom du voyage *" value={name} onChangeText={setName} error={errors.name} />
        <Input
          label="Destination *"
          value={destination}
          onChangeText={setDestination}
          error={errors.destination}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="Debut (YYYY-MM-DD) *"
              value={startDateInput}
              onChangeText={handleStartChange}
              placeholder="2026-06-01"
              error={errors.startDate}
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Fin (YYYY-MM-DD) *"
              value={endDateInput}
              onChangeText={handleEndChange}
              placeholder="2026-06-10"
              error={errors.endDate}
            />
          </View>
        </View>

        <Button
          title={isEditing ? 'Enregistrer' : 'Creer le voyage'}
          onPress={handleSubmit}
          loading={submitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md },
  coverWrap: { marginBottom: spacing.md },
  cover: { width: '100%', height: 160, borderRadius: radius.md, backgroundColor: colors.border },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  coverLabel: { marginTop: spacing.xs, color: colors.textMuted, fontSize: fontSize.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
});

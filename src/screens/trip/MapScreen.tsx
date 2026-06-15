import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';
import { useTrip } from '@/hooks/useTrip';
import { useAllEvents } from '@/hooks/useEvents';
import { updateEventCoords } from '@/services/eventService';
import { getEventCoords, getEventGeocodeQuery } from '@/utils/events';
import { geocodeAddress, delay } from '@/utils/geocode';
import { eventMeta } from '@/components/event/eventMeta';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, radius, spacing, fontSize } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

// Chargement différé : react-native-maps est un module natif absent d'Expo Go.
// Le require ici (et non en import de tête) évite de casser le démarrage de
// l'app dans Expo Go ; il ne s'exécute qu'à l'ouverture de cet écran.
function loadMaps(): any | null {
  try {
    return require('react-native-maps');
  } catch {
    return null;
  }
}

export function MapScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const { trip, loading, canEdit } = useTrip(tripId);
  const { events } = useAllEvents(tripId);
  const [geocoding, setGeocoding] = useState(false);

  const maps = useMemo(loadMaps, []);

  const markers = useMemo(
    () =>
      events
        .map((e) => ({ event: e, coords: getEventCoords(e) }))
        .filter((m): m is { event: typeof m.event; coords: NonNullable<typeof m.coords> } =>
          m.coords != null,
        ),
    [events],
  );

  const missing = useMemo(
    () => events.filter((e) => getEventGeocodeQuery(e) && !getEventCoords(e)),
    [events],
  );

  const initialRegion = useMemo(() => {
    if (markers.length === 0) return undefined;
    const lats = markers.map((m) => m.coords.latitude);
    const lngs = markers.map((m) => m.coords.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.6),
      longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.6),
    };
  }, [markers]);

  const handleGeocode = async () => {
    setGeocoding(true);
    let done = 0;
    let failed = 0;
    try {
      for (const e of missing) {
        const q = getEventGeocodeQuery(e);
        if (!q) continue;
        let coords = await geocodeAddress(trip ? `${q}, ${trip.destination}` : q);
        if (!coords) coords = await geocodeAddress(q);
        if (coords) {
          await updateEventCoords(e.tripId, e.dayId, e.id, coords.latitude, coords.longitude);
          done += 1;
        } else {
          failed += 1;
        }
        await delay(1100); // respect de la limite de débit Nominatim
      }
      Alert.alert(
        'Localisation terminée',
        `${done} lieu(x) localisé(s)${failed ? `, ${failed} introuvable(s)` : ''}.`,
      );
    } catch (err) {
      Alert.alert('Erreur', (err as Error).message);
    } finally {
      setGeocoding(false);
    }
  };

  if (loading || !trip) return <LoadingScreen />;

  // Expo Go : module natif indisponible.
  if (!maps?.default) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.fallback}>
          <EmptyState
            icon="map-outline"
            title="Carte indisponible ici"
            subtitle="La carte nécessite un build de développement (react-native-maps ne fonctionne pas dans Expo Go)."
          />
        </View>
      </SafeAreaView>
    );
  }

  const MapView = maps.default;
  const Marker = maps.Marker;
  const Callout = maps.Callout;
  const PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;

  if (markers.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.fallback}>
          <EmptyState
            icon="location-outline"
            title="Aucun lieu localisé"
            subtitle={
              missing.length > 0
                ? `${missing.length} lieu(x) ont une adresse. Lancez la localisation pour les placer sur la carte.`
                : 'Ajoutez une adresse aux hébergements, activités ou restaurants.'
            }
            actionLabel={canEdit && missing.length > 0 ? 'Localiser les lieux' : undefined}
            onAction={canEdit && missing.length > 0 ? handleGeocode : undefined}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.flex}>
      <MapView style={styles.flex} provider={PROVIDER_DEFAULT} initialRegion={initialRegion}>
        {markers.map(({ event, coords }) => {
          const meta = eventMeta[event.type];
          return (
            <Marker
              key={event.id}
              coordinate={coords}
              title={event.name}
              description={meta.label}
              pinColor={meta.color}
            >
              {Callout && (
                <Callout
                  onPress={
                    canEdit
                      ? () =>
                          navigation.navigate('AddEditEvent', {
                            tripId,
                            dayId: event.dayId,
                            eventId: event.id,
                            eventType: event.type,
                          })
                      : undefined
                  }
                >
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{event.name}</Text>
                    <Text style={styles.calloutMeta}>{meta.label}</Text>
                  </View>
                </Callout>
              )}
            </Marker>
          );
        })}
      </MapView>

      {canEdit && missing.length > 0 && (
        <Pressable style={styles.geocodeBtn} onPress={handleGeocode} disabled={geocoding}>
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={styles.geocodeText}>
            {geocoding ? 'Localisation…' : `Localiser ${missing.length} lieu(x)`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.background },
  fallback: { flex: 1, padding: spacing.md },
  callout: { padding: spacing.xs, minWidth: 120 },
  calloutTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  calloutMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  geocodeBtn: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  geocodeText: { color: '#fff', fontWeight: '700', fontSize: fontSize.sm },
});

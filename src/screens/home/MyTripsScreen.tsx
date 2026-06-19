import React, { useLayoutEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@/types';
import { useAllTrips } from '@/hooks/useTrips';
import { useAuth } from '@/contexts/AuthContext';
import { TripCard } from '@/components/trip/TripCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { spacing, radius, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'MyTrips'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MyTripsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const { trips, loading } = useAllTrips();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('JoinTrip')}
          hitSlop={8}
          style={{ marginRight: spacing.md }}
        >
          <Ionicons name="enter-outline" size={22} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, colors]);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {trips.length === 0 ? (
        <EmptyState
          icon="airplane-outline"
          title={t('home.empty.title')}
          subtitle={t('home.empty.subtitle')}
          actionLabel={t('home.empty.action')}
          onAction={() => navigation.navigate('AddEditTrip', {})}
        />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              sharedBadge={item.ownerId !== user?.uid}
              onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
            />
          )}
        />
      )}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTrip', {})}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
});

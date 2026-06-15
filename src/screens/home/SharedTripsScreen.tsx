import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '@/types';
import { useSharedTrips } from '@/hooks/useTrips';
import { TripCard } from '@/components/trip/TripCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { spacing, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'SharedTrips'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SharedTripsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { trips, loading } = useSharedTrips();

  if (loading) return <LoadingScreen />;

  if (trips.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          icon="people-outline"
          title={t('home.sharedEmpty.title')}
          subtitle={t('home.sharedEmpty.subtitle')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={trips}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            sharedBadge
            onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
});

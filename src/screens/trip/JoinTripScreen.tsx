import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { joinTripViaInvite } from '@/services/tripService';
import { parseInvite, buildInviteCode } from '@/utils/invite';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinTrip'>;

export function JoinTripScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();

  const deepLinked =
    route.params?.tripId && route.params?.token
      ? buildInviteCode(route.params.tripId, route.params.token)
      : '';
  const [code, setCode] = useState(deepLinked);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTried = useRef(false);

  const join = async (raw: string) => {
    const parsed = parseInvite(raw);
    if (!parsed || !user) {
      setError(t('trip.joinInvalid'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await joinTripViaInvite(parsed.tripId, parsed.token, user.uid);
      navigation.replace('TripDetail', { tripId: parsed.tripId });
    } catch {
      setError(t('trip.joinFailed'));
    } finally {
      setBusy(false);
    }
  };

  // Auto-rejoindre si l'écran est ouvert via un lien profond.
  useEffect(() => {
    if (deepLinked && !autoTried.current) {
      autoTried.current = true;
      join(deepLinked);
    }
  }, [deepLinked]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('trip.joinTitle')}</Text>
        <Text style={styles.subtitle}>{t('trip.joinHint')}</Text>
        <Input
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t('trip.joinPlaceholder')}
          error={error ?? undefined}
        />
        <Button title={t('trip.joinAction')} onPress={() => join(code)} loading={busy} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, padding: spacing.md },
    title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
    subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
  });

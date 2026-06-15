import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { useShareTrip } from '@/hooks/useShare';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SharedUserItem } from '@/components/share/SharedUserItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { validateEmail } from '@/utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ShareTrip'>;

export function ShareTripScreen({ route }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { tripId } = route.params;
  const { members, shareWithEmail, changeRole, removeShare } = useShareTrip(tripId);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async () => {
    if (!validateEmail(email)) {
      setError(t('trip.invalidEmail'));
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await shareWithEmail(email);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? t('trip.unknownError'));
    } else {
      setEmail('');
    }
  };

  const handleRemove = (userId: string, name: string) => {
    Alert.alert(
      t('trip.removeAccessTitle'),
      t('trip.removeAccessMsg', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.remove'), style: 'destructive', onPress: () => removeShare(userId) },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('trip.inviteByEmail')}</Text>
        <Text style={styles.subtitle}>{t('trip.shareExplanation')}</Text>
        <Input
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="email@exemple.com"
          error={error ?? undefined}
        />
        <Button title={t('trip.invite')} onPress={handleInvite} loading={submitting} />

        <Text style={[styles.title, { marginTop: spacing.xl }]}>{t('trip.sharedAccess')}</Text>
        {members.length === 0 ? (
          <EmptyState icon="people-outline" title={t('trip.noOne')} subtitle={t('trip.noShare')} />
        ) : (
          <FlatList
            data={members}
            keyExtractor={(m) => m.user.uid}
            renderItem={({ item }) => (
              <SharedUserItem
                user={item.user}
                role={item.role}
                onToggleRole={() =>
                  changeRole(item.user.uid, item.role === 'editor' ? 'viewer' : 'editor')
                }
                onRemove={() => handleRemove(item.user.uid, item.user.displayName)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
});

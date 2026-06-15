import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { useShareTrip } from '@/hooks/useShare';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SharedUserItem } from '@/components/share/SharedUserItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, spacing, fontSize } from '@/theme';
import { validateEmail } from '@/utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ShareTrip'>;

export function ShareTripScreen({ route }: Props) {
  const { tripId } = route.params;
  const { members, shareWithEmail, changeRole, removeShare } = useShareTrip(tripId);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async () => {
    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await shareWithEmail(email);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'Erreur inconnue');
    } else {
      setEmail('');
    }
  };

  const handleRemove = (userId: string, name: string) => {
    Alert.alert(
      'Retirer l\'acces ?',
      `${name} ne pourra plus consulter ce voyage.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Retirer', style: 'destructive', onPress: () => removeShare(userId) },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Inviter par email</Text>
        <Text style={styles.subtitle}>
          Les personnes invitees peuvent modifier le voyage (editeur) par defaut. Touchez le badge
          de role pour passer un membre en lecteur.
        </Text>
        <Input
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="email@exemple.com"
          error={error ?? undefined}
        />
        <Button title="Inviter" onPress={handleInvite} loading={submitting} />

        <Text style={[styles.title, { marginTop: spacing.xl }]}>Acces partages</Text>
        {members.length === 0 ? (
          <EmptyState icon="people-outline" title="Personne" subtitle="Aucun partage pour le moment" />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
});

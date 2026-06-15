import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { useShareTrip } from '@/hooks/useShare';
import { useTrip } from '@/hooks/useTrip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SharedUserItem } from '@/components/share/SharedUserItem';
import { ParticipantsManager } from '@/components/expense/ParticipantsManager';
import { spacing, radius, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { validateEmail } from '@/utils/validation';
import { buildInviteLink, buildInviteCode } from '@/utils/invite';

type Props = NativeStackScreenProps<RootStackParamList, 'ShareTrip'>;

export function ShareTripScreen({ route }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { tripId } = route.params;
  const { trip, isOwner } = useTrip(tripId);
  const { members, inviteToken, shareWithEmail, changeRole, removeShare, enableInvite, disableInvite } =
    useShareTrip(tripId);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);

  const handleInvite = async () => {
    if (!validateEmail(email)) {
      setError(t('trip.invalidEmail'));
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await shareWithEmail(email);
    setSubmitting(false);
    if (!result.ok) setError(result.error ?? t('trip.unknownError'));
    else setEmail('');
  };

  const handleRemove = (userId: string, name: string) => {
    Alert.alert(t('trip.removeAccessTitle'), t('trip.removeAccessMsg', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => removeShare(userId) },
    ]);
  };

  const handleShareLink = async () => {
    if (!inviteToken) return;
    await Share.share({
      message: t('trip.inviteShareMessage', {
        trip: trip?.name ?? '',
        link: buildInviteLink(tripId, inviteToken),
        code: buildInviteCode(tripId, inviteToken),
      }),
    });
  };

  const handleCreateLink = async () => {
    setLinkBusy(true);
    try {
      await enableInvite();
    } finally {
      setLinkBusy(false);
    }
  };

  const handleRevokeLink = () => {
    Alert.alert(t('trip.revokeLinkTitle'), t('trip.revokeLinkMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('trip.revokeLink'), style: 'destructive', onPress: () => disableInvite() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {isOwner && (
          <>
            <Text style={styles.title}>{t('trip.inviteLinkTitle')}</Text>
            <Text style={styles.subtitle}>{t('trip.inviteLinkHint')}</Text>
            {inviteToken ? (
              <View style={styles.linkBox}>
                <Text style={styles.code} selectable numberOfLines={1}>
                  {buildInviteCode(tripId, inviteToken)}
                </Text>
                <View style={styles.linkActions}>
                  <Button title={t('trip.shareLink')} onPress={handleShareLink} style={styles.flexBtn} />
                  <Button title={t('trip.revokeLink')} onPress={handleRevokeLink} variant="ghost" style={styles.flexBtn} />
                </View>
              </View>
            ) : (
              <Button title={t('trip.createInviteLink')} onPress={handleCreateLink} loading={linkBusy} />
            )}

            <Text style={[styles.title, styles.sectionGap]}>{t('trip.inviteByEmail')}</Text>
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
          </>
        )}

        <Text style={[styles.title, isOwner ? styles.sectionGap : undefined]}>{t('trip.sharedAccess')}</Text>
        {!isOwner && <Text style={styles.subtitle}>{t('trip.membersReadonly')}</Text>}
        {members.length === 0 ? (
          <Text style={styles.muted}>{t('trip.noShare')}</Text>
        ) : (
          members.map((m) => (
            <SharedUserItem
              key={m.user.uid}
              user={m.user}
              role={m.role}
              onToggleRole={
                isOwner ? () => changeRole(m.user.uid, m.role === 'editor' ? 'viewer' : 'editor') : undefined
              }
              onRemove={isOwner ? () => handleRemove(m.user.uid, m.user.displayName) : undefined}
            />
          ))
        )}

        <Text style={[styles.title, styles.sectionGap]}>{t('nav.expenseParticipants')}</Text>
        <Text style={styles.subtitle}>{t('trip.manualParticipantHint')}</Text>
        <ParticipantsManager tripId={tripId} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { padding: spacing.md, paddingBottom: spacing.xl },
    title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
    sectionGap: { marginTop: spacing.xl },
    subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
    muted: { fontSize: fontSize.sm, color: colors.textMuted, fontStyle: 'italic', paddingVertical: spacing.sm },
    linkBox: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    code: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600', marginBottom: spacing.sm },
    linkActions: { flexDirection: 'row', gap: spacing.sm },
    flexBtn: { flex: 1 },
  });

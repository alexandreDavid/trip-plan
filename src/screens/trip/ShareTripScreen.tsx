import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
import { confirmDialog } from '@/utils/dialog';

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
  // Les invitations (lien + email) sont volontairement repliées : la page met
  // d'abord les participants en avant. Un point vert signale un lien déjà actif.
  const [inviteOpen, setInviteOpen] = useState(false);

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

  const handleRemove = async (userId: string, name: string) => {
    const ok = await confirmDialog({
      title: t('trip.removeAccessTitle'),
      message: t('trip.removeAccessMsg', { name }),
      confirmLabel: t('common.remove'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (ok) removeShare(userId);
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

  const handleRevokeLink = async () => {
    const ok = await confirmDialog({
      title: t('trip.revokeLinkTitle'),
      message: t('trip.revokeLinkMsg'),
      confirmLabel: t('trip.revokeLink'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (ok) disableInvite();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* En avant : les participants au partage des dépenses. */}
        <ParticipantsManager tripId={tripId} />

        {/* En retrait : accès des collaborateurs (comptes) et invitations. */}
        <View style={styles.shareBlock}>
          <Text style={styles.shareLabel}>{t('trip.sharedAccess')}</Text>
          {!isOwner && <Text style={styles.muted}>{t('trip.membersReadonly')}</Text>}
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

          {isOwner && (
            <>
              <Pressable style={styles.discloseRow} onPress={() => setInviteOpen((o) => !o)}>
                <View style={styles.discloseLeft}>
                  <Ionicons name="person-add-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.discloseText}>{t('trip.inviteCollaborators')}</Text>
                  {inviteToken && !inviteOpen && <View style={styles.activeDot} />}
                </View>
                <Ionicons
                  name={inviteOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>

              {inviteOpen && (
                <View style={styles.inviteBody}>
                  <Text style={styles.subLabel}>{t('trip.inviteLinkTitle')}</Text>
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

                  <Text style={[styles.subLabel, styles.inviteGap]}>{t('trip.inviteByEmail')}</Text>
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
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { padding: spacing.md, paddingBottom: spacing.xl },
    subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
    muted: { fontSize: fontSize.sm, color: colors.textMuted, fontStyle: 'italic', paddingVertical: spacing.sm },

    // Bloc "en retrait" : accès partagé + invitations.
    shareBlock: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    shareLabel: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },

    discloseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    discloseLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
    discloseText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginLeft: spacing.xs },

    inviteBody: { marginTop: spacing.sm },
    inviteGap: { marginTop: spacing.lg },
    subLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },

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

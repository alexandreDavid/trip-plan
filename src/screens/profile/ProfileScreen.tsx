import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useI18n, LanguageMode } from '@/i18n/I18nContext';
import { Button } from '@/components/ui/Button';
import { spacing, fontSize, radius, Palette } from '@/theme';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, mode: themeMode, setMode: setThemeMode } = useTheme();
  const { mode: langMode, setMode: setLangMode, t } = useI18n();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: t('profile.theme.light') },
    { value: 'dark', label: t('profile.theme.dark') },
    { value: 'system', label: t('profile.theme.system') },
  ];
  const langOptions: { value: LanguageMode; label: string }[] = [
    { value: 'fr', label: t('profile.lang.fr') },
    { value: 'en', label: t('profile.lang.en') },
    { value: 'system', label: t('profile.lang.system') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName?.charAt(0).toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName ?? t('profile.user')}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <Text style={styles.section}>{t('profile.appearance')}</Text>
        <Segmented options={themeOptions} value={themeMode} onChange={setThemeMode} styles={styles} />

        <Text style={styles.section}>{t('profile.language')}</Text>
        <Segmented options={langOptions} value={langMode} onChange={setLangMode} styles={styles} />

        <Button
          title={t('profile.signOut')}
          variant="danger"
          onPress={signOut}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </SafeAreaView>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  styles,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.segment}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          onPress={() => onChange(o.value)}
          style={[styles.segmentItem, value === o.value && styles.segmentItemActive]}
        >
          <Text style={[styles.segmentText, value === o.value && styles.segmentTextActive]}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { padding: spacing.lg, alignItems: 'center' },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    avatarText: { fontSize: 40, color: '#fff', fontWeight: '700' },
    name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing.md },
    email: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
    section: {
      alignSelf: 'flex-start',
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.border,
      borderRadius: radius.md,
      padding: 2,
      alignSelf: 'stretch',
    },
    segmentItem: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
    segmentItemActive: { backgroundColor: colors.surface },
    segmentText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
    segmentTextActive: { color: colors.primary },
  });

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize } from '@/theme';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName ?? 'Utilisateur'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <Button title="Se deconnecter" variant="danger" onPress={signOut} style={{ marginTop: spacing.xl }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});

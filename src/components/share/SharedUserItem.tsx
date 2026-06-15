import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, TripRole } from '@/types';
import { colors, spacing, radius, fontSize } from '@/theme';
import { roleLabel } from '@/utils/permissions';

interface Props {
  user: UserProfile;
  role?: TripRole;
  onToggleRole?: () => void;
  onRemove?: () => void;
}

export function SharedUserItem({ user, role, onToggleRole, onRemove }: Props) {
  return (
    <View style={styles.row}>
      {user.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{user.displayName.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      {role && onToggleRole && (
        <Pressable
          onPress={onToggleRole}
          hitSlop={8}
          style={[styles.rolePill, role === 'editor' ? styles.rolePillEditor : styles.rolePillViewer]}
        >
          <Ionicons
            name={role === 'editor' ? 'create-outline' : 'eye-outline'}
            size={14}
            color={role === 'editor' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.roleText, role === 'editor' && styles.roleTextEditor]}>
            {roleLabel(role)}
          </Text>
        </Pressable>
      )}
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close-circle" size={24} color={colors.danger} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  body: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  email: { fontSize: fontSize.sm, color: colors.textMuted },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  rolePillEditor: { borderColor: colors.primary, backgroundColor: colors.primary + '11' },
  rolePillViewer: { borderColor: colors.border, backgroundColor: colors.background },
  roleText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  roleTextEditor: { color: colors.primary },
});

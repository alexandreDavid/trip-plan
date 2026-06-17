import { Alert, Platform } from 'react-native';

// Dialogues cross-plateforme. react-native-web n'implémente PAS Alert.alert avec
// boutons : le onPress ne se déclenche jamais (d'où les boutons "Supprimer" qui
// "ne marchent pas" sur le web). On bascule donc sur window.confirm / window.alert.

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
}

// Demande une confirmation. Résout `true` si l'utilisateur confirme.
export function confirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    const ok = typeof window !== 'undefined' ? window.confirm(text) : false;
    return Promise.resolve(ok);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message || undefined,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

// Message simple (info / erreur), sans choix.
export function alertDialog(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/i18n/I18nContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { WEB_URL } from '@/utils/invite';

// Liens d'invitation : https://<web>/join/<tripId>/<token> (ouvrable dans un
// navigateur) ou cardume://join/... (schéma natif). Les deux -> écran Rejoindre.
const linking = {
  prefixes: ['cardume://', WEB_URL, 'https://trip-plan-4a18a.firebaseapp.com'],
  config: {
    screens: {
      JoinTrip: 'join/:tripId/:token',
    },
  },
};

function ThemedApp() {
  const { scheme, colors } = useTheme();
  // Précharge la police d'icônes (indispensable sur le web, sinon aucune icône).
  const [fontsLoaded] = useFonts(Ionicons.font);
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  if (!fontsLoaded) return <LoadingScreen />;

  // Web : à chaque changement d'écran, on retire le focus de l'élément actif.
  // Sinon le bouton qui a déclenché la navigation garde le focus alors que son
  // écran reçoit aria-hidden (avertissement d'accessibilité dans le navigateur).
  const handleStateChange = () => {
    if (Platform.OS !== 'web') return;
    const doc = (globalThis as { document?: { activeElement?: { blur?: () => void } } }).document;
    doc?.activeElement?.blur?.();
  };

  return (
    <NavigationContainer theme={navTheme} linking={linking} onStateChange={handleStateChange}>
      <RootNavigator />
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <ThemedApp />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

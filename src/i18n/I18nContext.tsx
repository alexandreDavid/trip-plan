import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from './translations';

export type Language = 'fr' | 'en' | 'pt';
export type LanguageMode = Language | 'system';

const STORAGE_KEY = 'i18n.mode';
const SUPPORTED: Language[] = ['fr', 'en', 'pt'];

function deviceLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode ?? 'en';
  return SUPPORTED.includes(code as Language) ? (code as Language) : 'en';
}

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

interface I18nContextValue {
  lang: Language;
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => void;
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'fr' || v === 'en' || v === 'pt' || v === 'system') setModeState(v);
    });
  }, []);

  const setMode = (m: LanguageMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  const lang: Language = mode === 'system' ? deviceLanguage() : mode;

  const t = useMemo<TranslateFn>(
    () => (key, params) => {
      let s = translations[lang]?.[key] ?? translations.en?.[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v));
      }
      return s;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, mode, setMode, t }), [lang, mode, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé dans un I18nProvider');
  return ctx;
}

export function useT(): TranslateFn {
  return useI18n().t;
}

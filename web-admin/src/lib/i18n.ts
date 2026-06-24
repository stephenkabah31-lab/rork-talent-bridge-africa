import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/translations/en.json';
import fr from '@/translations/fr.json';
import pt from '@/translations/pt.json';
import ar from '@/translations/ar.json';
import sw from '@/translations/sw.json';
import ha from '@/translations/ha.json';
import yo from '@/translations/yo.json';
import zu from '@/translations/zu.json';
import am from '@/translations/am.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      pt: { translation: pt },
      ar: { translation: ar },
      sw: { translation: sw },
      ha: { translation: ha },
      yo: { translation: yo },
      zu: { translation: zu },
      am: { translation: am },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app_language',
    },
    compatibilityJSON: 'v4',
  });

export { i18next };
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
  { code: 'ha', label: 'Hausa', native: 'Hausa' },
  { code: 'yo', label: 'Yoruba', native: 'Yorùbá' },
  { code: 'zu', label: 'Zulu', native: 'isiZulu' },
  { code: 'am', label: 'Amharic', native: 'አማርኛ' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import XHR from 'i18next-xhr-backend';
import translationPt from './language/translation.pt.json';
import translationAr from './language/translation.ar.json';
import translationCn from './language/translation.cn.json';
import translationEs from './language/translation.es.json';
import secureStorage from './utils/secureStorage';

i18n
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: {
        translations: translationPt, // Portuguese translation
      },
      ar: {
        translations: translationAr, // Arabic translation
      },
      cn: {
        translations: translationCn, // Chinese translation
      },
      es: {
        translations: translationEs, // Spanish translation
      },
    },
    /* default language when load the website in browser */
    lng: secureStorage.getItem('selectedLanguage') !== '' ? secureStorage.getItem('selectedLanguage') : 'en',
    /* When react i18next not finding any language to as default in borwser */
    fallbackLng: 'en',
    /* debugger For Development environment */
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: ':',
    // interpolation: {
    //     escapeValue: false,
    //     formatSeparator: ","
    // },
    react: {
      wait: true,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      useSuspense: false,
      nsMode: 'default',
    },
  });

export default i18n;

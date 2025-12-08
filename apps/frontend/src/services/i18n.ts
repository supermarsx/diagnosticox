import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from '../locales/en-US.json';
import enUK from '../locales/en-UK.json';
import ptPT from '../locales/pt-PT.json';
import esES from '../locales/es-ES.json';

i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'en-UK': { translation: enUK },
    'pt-PT': { translation: ptPT },
    'es-ES': { translation: esES },
  },
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false },
  react: { useSuspense: true },
});

export default i18n;

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ja from './locales/ja.json'
import en from './locales/en.json'
import ko from './locales/ko.json'
import zhTW from './locales/zh-TW.json'

const STORAGE_KEY = 'lang'

function detectLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && ['ja', 'en', 'ko', 'zh-TW'].includes(stored)) return stored

  const nav = navigator.language ?? ''
  if (nav.startsWith('ja')) return 'ja'
  if (nav.startsWith('ko')) return 'ko'
  if (nav.startsWith('zh')) return 'zh-TW'
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja:     { translation: ja },
      en:     { translation: en },
      ko:     { translation: ko },
      'zh-TW': { translation: zhTW },
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export function setLanguage(lang: string) {
  localStorage.setItem(STORAGE_KEY, lang)
  i18n.changeLanguage(lang)
}

export default i18n

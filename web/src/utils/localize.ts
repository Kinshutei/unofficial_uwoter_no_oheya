/**
 * 言語に応じてフィールドの表示値を返す。
 * 翻訳が空の場合: ko/zh-TW → en → ja の順でフォールバック
 */
export function localizeField(
  ja: string,
  en?: string,
  ko?: string,
  zh?: string,
  lang = 'ja',
): string {
  if (lang === 'ja') return ja || ''
  if (lang === 'en') return en || ja || ''
  if (lang === 'ko') return ko || en || ja || ''
  if (lang === 'zh-TW') return zh || en || ja || ''
  return ja || ''
}

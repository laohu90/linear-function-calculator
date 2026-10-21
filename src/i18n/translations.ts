export type SupportedLang = 'en' | 'es' | 'fr' | 'pt' | 'zh';

export const translations: Record<SupportedLang, Record<string, string>> = {
  en: {
    title: 'Calculator',
    subtitle: 'Advanced calculation tool',
    calculate: 'Calculate',
    reset: 'Reset',
    result: 'Result',
    settings: 'Settings',
    language: 'Language'
  },
  es: {
    title: 'Calculadora',
    subtitle: 'Herramienta de cálculo avanzada',
    calculate: 'Calcular',
    reset: 'Reiniciar',
    result: 'Resultado',
    settings: 'Ajustes',
    language: 'Idioma'
  },
  fr: {
    title: 'Calculateur',
    subtitle: 'Outil de calcul avancé',
    calculate: 'Calculer',
    reset: 'Réinitialiser',
    result: 'Résultat',
    settings: 'Paramètres',
    language: 'Langue'
  },
  pt: {
    title: 'Calculadora',
    subtitle: 'Ferramenta de cálculo avançada',
    calculate: 'Calcular',
    reset: 'Redefinir',
    result: 'Resultado',
    settings: 'Configurações',
    language: 'Idioma'
  },
  zh: {
    title: '计算器',
    subtitle: '高级计算工具',
    calculate: '计算',
    reset: '重置',
    result: '结果',
    settings: '设置',
    language: '语言'
  }
};

export interface BrowserDetectionResult {
  detected: SupportedLang;
  rawLocale: string;
  source: 'browser' | 'default';
}

export function getBrowserLanguageInfo(): BrowserDetectionResult {
  if (typeof window === 'undefined') {
    return { detected: 'en', rawLocale: 'en', source: 'default' };
  }
  const rawList: string[] = [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    rawList.push(...navigator.languages);
  }
  if (navigator.language) {
    rawList.push(navigator.language);
  }
  const primaryRaw = rawList[0] || 'en';
  for (const raw of rawList) {
    const l = raw.toLowerCase().trim();
    if (l.startsWith('zh')) return { detected: 'zh', rawLocale: primaryRaw, source: 'browser' };
    if (l.startsWith('es')) return { detected: 'es', rawLocale: primaryRaw, source: 'browser' };
    if (l.startsWith('fr')) return { detected: 'fr', rawLocale: primaryRaw, source: 'browser' };
    if (l.startsWith('pt')) return { detected: 'pt', rawLocale: primaryRaw, source: 'browser' };
    if (l.startsWith('en')) return { detected: 'en', rawLocale: primaryRaw, source: 'browser' };
  }
  return { detected: 'en', rawLocale: primaryRaw, source: 'default' };
}

export function resolveInitialLanguage(): {
  lang: SupportedLang;
  isAuto: boolean;
  detectedLang: SupportedLang;
  rawLocale: string;
} {
  const browserInfo = getBrowserLanguageInfo();
  if (typeof window === 'undefined') {
    return { lang: 'en', isAuto: true, detectedLang: 'en', rawLocale: 'en' };
  }
  try {
    localStorage.removeItem('linear_func_lang');
    localStorage.removeItem('linear_func_pref_lang');
    localStorage.removeItem('linear_func_manual_lang');
  } catch {}

  try {
    const params = new URLSearchParams(window.location.search);
    const pLang = params.get('lang') as SupportedLang;
    if (pLang && ['en', 'es', 'fr', 'pt', 'zh'].includes(pLang)) {
      return { lang: pLang, isAuto: false, detectedLang: browserInfo.detected, rawLocale: browserInfo.rawLocale };
    }
  } catch {}

  try {
    const manual = localStorage.getItem('linear_func_user_chosen_lang_v3') as SupportedLang;
    if (manual && ['en', 'es', 'fr', 'pt', 'zh'].includes(manual)) {
      return { lang: manual, isAuto: false, detectedLang: browserInfo.detected, rawLocale: browserInfo.rawLocale };
    }
  } catch {}

  // Strict default is English ('en') for Google SEO & global accessibility
  return { lang: 'en', isAuto: true, detectedLang: browserInfo.detected, rawLocale: browserInfo.rawLocale };
}

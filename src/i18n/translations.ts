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

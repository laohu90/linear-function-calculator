/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  calculateFromTwoPoints,
  Point,
  formatNum,
  CalculationResult
} from './utils/linearMath';
import { CoordinatePlane, CoordinatePlaneHandle } from './components/CoordinatePlane';
import { InfoModal, InfoModalTab } from './components/InfoModal';
import { exportCalculationPDF } from './utils/pdfExport';
import {
  Calculator,
  Copy,
  Check,
  Shuffle,
  ArrowRightLeft,
  BookOpen,
  HelpCircle,
  Sparkles,
  Github,
  Globe,
  Sliders,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Share2,
  FileDown,
  Download,
  AlertTriangle,
  Info,
  ShieldCheck,
  FileText,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { SupportedLang, resolveInitialLanguage } from './i18n/translations';

const PRESET_EXAMPLES = [
  {
    id: 0,
    labelZh: '经典例题1: (1, 3) 与 (3, 7) [增函数]',
    labelEn: 'Example 1: (1, 3) and (3, 7) [Increasing]',
    p1: { x: 1, y: 3 },
    p2: { x: 3, y: 7 }
  },
  {
    id: 1,
    labelZh: '经典例题2: (-2, 5) 与 (4, -1) [减函数]',
    labelEn: 'Example 2: (-2, 5) and (4, -1) [Decreasing]',
    p1: { x: -2, y: 5 },
    p2: { x: 4, y: -1 }
  },
  {
    id: 2,
    labelZh: '经典例题3: (0, 0) 与 (2, 6) [正比例函数]',
    labelEn: 'Example 3: (0, 0) and (2, 6) [Direct Proportion]',
    p1: { x: 0, y: 0 },
    p2: { x: 2, y: 6 }
  },
  {
    id: 3,
    labelZh: '经典例题4: (1, 2) 与 (4, 4) [分数斜率 2/3]',
    labelEn: 'Example 4: (1, 2) and (4, 4) [Fraction Slope 2/3]',
    p1: { x: 1, y: 2 },
    p2: { x: 4, y: 4 }
  },
  {
    id: 4,
    labelZh: '特殊线型5: (-3, 4) 与 (5, 4) [水平线 k=0]',
    labelEn: 'Example 5: (-3, 4) and (5, 4) [Horizontal Line k=0]',
    p1: { x: -3, y: 4 },
    p2: { x: 5, y: 4 }
  },
  {
    id: 5,
    labelZh: '特殊线型6: (3, -2) 与 (3, 5) [垂直线 k不存在]',
    labelEn: 'Example 6: (3, -2) and (3, 5) [Vertical Line Undefined]',
    p1: { x: 3, y: -2 },
    p2: { x: 3, y: 5 }
  }
];

export default function App() {
  const planeRef = useRef<CoordinatePlaneHandle | null>(null);

  // Read language
  const [langState, setLangState] = useState<{ currentLang: SupportedLang; isAuto: boolean }>(() => {
    const init = resolveInitialLanguage();
    return { currentLang: init.lang, isAuto: init.isAuto };
  });
  const lang = (langState.currentLang === 'zh' ? 'zh' : 'en') as 'en' | 'zh';

  const setLang = (newLang: 'en' | 'zh') => {
    setLangState({ currentLang: newLang, isAuto: false });
    try {
      localStorage.setItem('linear_func_user_chosen_lang_v3', newLang);
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);
    window.history.replaceState({}, '', url.toString());
  };

  // Precision settings: 0 to 8 decimals (default: 3)
  const [precision, setPrecision] = useState<number>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pParam = params.get('p');
      if (pParam !== null) {
        const parsed = parseInt(pParam, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 8) return parsed;
      }
      const saved = localStorage.getItem('linear_func_precision');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 8) return parsed;
      }
    } catch {}
    return 3;
  });

  const handleSetPrecision = (newP: number) => {
    const clamped = Math.max(0, Math.min(8, newP));
    setPrecision(clamped);
    try {
      localStorage.setItem('linear_func_precision', clamped.toString());
    } catch {}
  };

  // Raw string buffers for inputs (allows typing '-', '.', decimals smoothly)
  const [strX1, setStrX1] = useState<string>('1');
  const [strY1, setStrY1] = useState<string>('2');
  const [strX2, setStrX2] = useState<string>('4');
  const [strY2, setStrY2] = useState<string>('8');

  // Selected preset tracking (-1 means custom)
  const [selectedPresetId, setSelectedPresetId] = useState<number>(-1);

  // Initialize from URL query parameters (?x1=1&y1=2&x2=4&y2=8&p=3)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qx1 = params.get('x1');
      const qy1 = params.get('y1');
      const qx2 = params.get('x2');
      const qy2 = params.get('y2');

      if (qx1 !== null) setStrX1(qx1);
      if (qy1 !== null) setStrY1(qy1);
      if (qx2 !== null) setStrX2(qx2);
      if (qy2 !== null) setStrY2(qy2);
    } catch {}
  }, []);

  // Sync inputs from coordinate updates (e.g., presets or canvas drag)
  const syncInputsFromPoints = (pt1: Point, pt2: Point, presetId = -1) => {
    setStrX1(pt1.x.toString());
    setStrY1(pt1.y.toString());
    setStrX2(pt2.x.toString());
    setStrY2(pt2.y.toString());
    setSelectedPresetId(presetId);
  };

  // Input Validation Logic
  // Real numbers regex: allows integers, signed numbers (-3), decimals (-2.5, .5), and scientific notation
  const validateField = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      return { isEmpty: true, isInvalid: false, value: undefined };
    }
    const isNum = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(trimmed);
    const parsed = Number(trimmed);
    if (!isNum || isNaN(parsed) || !isFinite(parsed)) {
      return { isEmpty: false, isInvalid: true, value: undefined };
    }
    return { isEmpty: false, isInvalid: false, value: parsed };
  };

  const vX1 = useMemo(() => validateField(strX1), [strX1]);
  const vY1 = useMemo(() => validateField(strY1), [strY1]);
  const vX2 = useMemo(() => validateField(strX2), [strX2]);
  const vY2 = useMemo(() => validateField(strY2), [strY2]);

  // Overall computation status
  const computationStatus = useMemo<'ready' | 'empty' | 'invalid'>(() => {
    if (vX1.isInvalid || vY1.isInvalid || vX2.isInvalid || vY2.isInvalid) {
      return 'invalid';
    }
    if (vX1.isEmpty || vY1.isEmpty || vX2.isEmpty || vY2.isEmpty) {
      return 'empty';
    }
    return 'ready';
  }, [vX1, vY1, vX2, vY2]);

  // Reactive Calculation Result (stops immediately when inputs are empty or invalid)
  const result: CalculationResult | null = useMemo(() => {
    if (computationStatus !== 'ready') {
      return null;
    }
    const p1: Point = { x: vX1.value!, y: vY1.value! };
    const p2: Point = { x: vX2.value!, y: vY2.value! };
    return calculateFromTwoPoints(p1, p2, lang, precision);
  }, [computationStatus, vX1.value, vY1.value, vX2.value, vY2.value, lang, precision]);

  // Sync URL with current parameters
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (computationStatus === 'ready' && result) {
        url.searchParams.set('x1', strX1.trim());
        url.searchParams.set('y1', strY1.trim());
        url.searchParams.set('x2', strX2.trim());
        url.searchParams.set('y2', strY2.trim());
      } else {
        url.searchParams.delete('x1');
        url.searchParams.delete('y1');
        url.searchParams.delete('x2');
        url.searchParams.delete('y2');
      }
      url.searchParams.set('p', precision.toString());
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [strX1, strY1, strX2, strY2, precision, lang, computationStatus, result]);

  // Evaluator inputs
  const [evalX, setEvalX] = useState<string>('5');
  const [evalY, setEvalY] = useState<string>('10');

  // UI state & Toasts
  const [copiedEq, setCopiedEq] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Subview tabs
  const [subView, setSubView] = useState<'steps' | 'evaluator' | 'guide' | 'faq'>('steps');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Modal state
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoModalTab>('about');

  const openInfoModal = (tab: InfoModalTab) => {
    setInfoModalTab(tab);
    setInfoModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEq(true);
    showToast(lang === 'zh' ? '已复制解析式至剪贴板！' : 'Equation copied to clipboard!');
    setTimeout(() => setCopiedEq(false), 2000);
  };

  const handleSwap = () => {
    if (computationStatus === 'ready' && result) {
      syncInputsFromPoints({ ...result.p2 }, { ...result.p1 }, -1);
    } else {
      // Swap raw strings
      const oldX1 = strX1;
      const oldY1 = strY1;
      setStrX1(strX2);
      setStrY1(strY2);
      setStrX2(oldX1);
      setStrY2(oldY1);
      setSelectedPresetId(-1);
    }
  };

  const handleRandom = () => {
    const rand = () => Math.floor(Math.random() * 15) - 7;
    let rx1 = rand();
    let ry1 = rand();
    let rx2 = rand();
    let ry2 = rand();
    if (rx1 === rx2 && ry1 === ry2) rx2 += 2;
    syncInputsFromPoints({ x: rx1, y: ry1 }, { x: rx2, y: ry2 }, -1);
  };

  // Copy full results formatted text
  const handleCopyAllResults = () => {
    if (!result || !result.isValid) return;

    const isZh = lang === 'zh';
    const lines = isZh
      ? [
          '========================================',
          '【一次函数解析式计算与几何特征报告】',
          '========================================',
          `已知两点坐标：`,
          `  点 A (x₁, y₁): (${result.p1.x}, ${result.p1.y})`,
          `  点 B (x₂, y₂): (${result.p2.x}, ${result.p2.y})`,
          '',
          `一、直线方程：`,
          `  • 斜截式方程: ${result.slopeInterceptEq}`,
          `  • 一般式方程: ${result.generalEq}`,
          `  • 点斜式方程: ${result.pointSlopeEq}`,
          '',
          `二、几何特征参数 (精度: ${precision} 位小数)：`,
          `  • 斜率 k (m): ${result.hasSlope ? `${result.kText} (≈ ${result.k?.toFixed(precision)})` : '不存在'}`,
          `  • 倾斜角 α: ${result.inclinationAngleDeg.toFixed(1)}°`,
          `  • y 轴截距 b: ${result.hasYIntercept ? `${result.bText} (≈ ${result.b?.toFixed(precision)})` : '无'}`,
          `  • y 轴交点: ${result.yInterceptPoint ? `(0, ${result.bText})` : '无'}`,
          `  • x 轴交点: ${result.xInterceptPoint ? `(${result.xInterceptText}, 0)` : '无'}`,
          `  • 两点间距离 d: ${result.distanceExactText}`,
          `  • 线段中点 M: (${formatNum(result.midpoint.x, precision)}, ${formatNum(result.midpoint.y, precision)})`,
          `  • 函数增减性: ${result.monotonicity === 'increasing' ? '递增 (k > 0)' : result.monotonicity === 'decreasing' ? '递减 (k < 0)' : '常数水平线'}`,
          `  • 经过象限: ${result.quadrants.length > 0 ? `第 ${result.quadrants.join('、')} 象限` : '过原点'}`,
          `  • 与两坐标轴围成面积 S: ${result.triangleAreaWithAxes ? formatNum(result.triangleAreaWithAxes, precision) : '无'}`,
          '',
          `三、分步解题演算：`,
          ...result.stepsZh,
          '',
          `【题目在线复现链接】：`,
          window.location.href,
          '========================================'
        ]
      : [
          '========================================',
          '[Linear Function Calculation & Properties Report]',
          '========================================',
          `Given Points:`,
          `  Point A (x₁, y₁): (${result.p1.x}, ${result.p1.y})`,
          `  Point B (x₂, y₂): (${result.p2.x}, ${result.p2.y})`,
          '',
          `1. Line Equations:`,
          `  • Slope-Intercept Form: ${result.slopeInterceptEq}`,
          `  • Standard Form: ${result.generalEq}`,
          `  • Point-Slope Form: ${result.pointSlopeEq}`,
          '',
          `2. Geometric Properties (Precision: ${precision} decimals):`,
          `  • Slope k (m): ${result.hasSlope ? `${result.kText} (≈ ${result.k?.toFixed(precision)})` : 'Undefined'}`,
          `  • Inclination Angle α: ${result.inclinationAngleDeg.toFixed(1)}°`,
          `  • Y-Intercept b: ${result.hasYIntercept ? `${result.bText} (≈ ${result.b?.toFixed(precision)})` : 'None'}`,
          `  • Y-Intercept Point: ${result.yInterceptPoint ? `(0, ${result.bText})` : 'None'}`,
          `  • X-Intercept Point: ${result.xInterceptPoint ? `(${result.xInterceptText}, 0)` : 'None'}`,
          `  • Distance d: ${result.distanceExactText}`,
          `  • Midpoint M: (${formatNum(result.midpoint.x, precision)}, ${formatNum(result.midpoint.y, precision)})`,
          `  • Monotonicity: ${result.monotonicity}`,
          `  • Quadrants: ${result.quadrants.join(', ')}`,
          `  • Axes Triangle Area: ${result.triangleAreaWithAxes ? formatNum(result.triangleAreaWithAxes, precision) : 'None'}`,
          '',
          `3. Step-by-Step Derivation:`,
          ...result.stepsEn,
          '',
          `[Online Replay Link]:`,
          window.location.href,
          '========================================'
        ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAll(true);
    showToast(lang === 'zh' ? '已复制全部解析与演算步骤！' : 'Full results copied to clipboard!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Copy share URL with current parameters
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast(lang === 'zh' ? '已复制题目分享链接！打开即可直接复现本题。' : 'Share link copied! Open to reproduce problem.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!result || !result.isValid) return;
    try {
      setIsExportingPdf(true);
      const canvas = planeRef.current?.getCanvas() || null;
      await exportCalculationPDF({
        result,
        precision,
        lang,
        canvasElement: canvas,
        shareUrl: window.location.href
      });
      showToast(lang === 'zh' ? 'PDF 解答卡已生成并下载！' : 'PDF solution worksheet downloaded!');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      // Fallback: window.print()
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Quick feed into evaluator
  const feedIntoEvaluator = (val: number, type: 'x' | 'y') => {
    if (type === 'x') {
      setEvalX(formatNum(val, precision));
    } else {
      setEvalY(formatNum(val, precision));
    }
    setSubView('evaluator');
  };

  const evaluatedY = useMemo(() => {
    const xNum = parseFloat(evalX);
    if (isNaN(xNum) || !result || !result.isValid) return '—';
    if (result.specialType === 'vertical') {
      return xNum === result.p1.x
        ? (lang === 'zh' ? '任意实数' : 'Any real number')
        : (lang === 'zh' ? '无对应点' : 'No corresponding point');
    }
    if (result.k !== undefined && result.b !== undefined) {
      return formatNum(result.k * xNum + result.b, precision);
    }
    return '—';
  }, [evalX, result, lang, precision]);

  const evaluatedX = useMemo(() => {
    const yNum = parseFloat(evalY);
    if (isNaN(yNum) || !result || !result.isValid) return '—';
    if (result.specialType === 'vertical') {
      return formatNum(result.p1.x, precision);
    }
    if (result.specialType === 'horizontal') {
      return yNum === result.p1.y
        ? (lang === 'zh' ? '任意实数' : 'Any real number')
        : (lang === 'zh' ? '无对应点' : 'No corresponding point');
    }
    if (result.k !== undefined && result.b !== undefined && Math.abs(result.k) > 1e-9) {
      return formatNum((yNum - result.b) / result.k, precision);
    }
    return '—';
  }, [evalY, result, lang, precision]);

  const t = {
    zh: {
      siteTitle: '一次函数解析式生成器',
      badge: 'y = kx + b',
      subTitle: '输入两点坐标，秒求一次函数解析式、斜率、截距与坐标轴交点',
      pointCardTitle: '输入两点坐标',
      pointA: '点 A',
      pointB: '点 B',
      swapBtn: '交换 A/B',
      randomBtn: '随机生成',
      presets: '例题预设',
      customPreset: '自定义输入',
      primaryEq: '一次函数解析式 (斜截式)',
      copyBtn: '复制解析式',
      copyAllBtn: '复制全部结果',
      shareBtn: '分享题目',
      exportPdfBtn: '导出 PDF',
      copied: '已复制！',
      precisionTitle: '精度控制',
      decimalPlaces: '位小数',
      slope: '斜率 k',
      intercept: 'y 轴截距 b',
      xInt: '与 x 轴交点',
      yInt: '与 y 轴交点',
      stdEq: '一般式方程',
      pointSlopeEq: '点斜式方程',
      distance: '两点距离 d',
      midpoint: '中点坐标 M',
      angle: '倾斜角 α',
      triangleArea: '两轴围成三角形面积',
      monotonicity: '增减性',
      quadrants: '经过象限',
      tabSteps: '解题步骤推导',
      tabEvaluator: '函数求值器',
      tabGuide: '公式与考点归纳',
      tabFaq: '常见问题答疑',
      graphTitle: '交互式直角坐标系图像',
      graphTip: '支持直接在画布拖拽点 A、点 B 实时更新 (含手机触摸支持)',
      evalXLabel: '已知 x 求 y：',
      evalYLabel: '已知 y 求 x：',
      evalPrompt: '在当前求得的直线方程下快速求值：',
      evalResultBadge: '计算结果',
      feedEvaluatorTip: '点击可快速带入求值器验证',
      footerText: '专业数学教育与一次函数计算工具 · 纯本地运算',
      sourceCode: 'GitHub 源码',
      privacy: '隐私政策',
      terms: '服务条款',
      about: '关于工具',
      monoInc: '递增 (k > 0)',
      monoDec: '递减 (k < 0)',
      monoConst: '常数水平线',
      monoVert: '垂直线',
      quadrantPrefix: '第 ',
      quadrantSuffix: ' 象限',
      originThrough: '过原点',
      auxParallelTitle: '过原点平行线 L∥',
      auxPerpBisectorTitle: '线段垂直平分线 L⊥',
      promptEmpty: '请填写完整：任一输入框为空时停止计算，请填写四个坐标数值。',
      promptInvalid: '输入格式无效：存在非数字字符，请检查标红的输入框。'
    },
    en: {
      siteTitle: 'Linear Function Calculator',
      badge: 'y = mx + b',
      subTitle: 'Calculate line equation from two coordinates with slope, intercepts and graph',
      pointCardTitle: 'Enter Coordinates',
      pointA: 'Point A',
      pointB: 'Point B',
      swapBtn: 'Swap',
      randomBtn: 'Random',
      presets: 'Presets',
      customPreset: 'Custom Input',
      primaryEq: 'Slope-Intercept Form (y = mx + b)',
      copyBtn: 'Copy Equation',
      copyAllBtn: 'Copy All Results',
      shareBtn: 'Share Problem',
      exportPdfBtn: 'Export PDF',
      copied: 'Copied!',
      precisionTitle: 'Precision Control',
      decimalPlaces: 'decimals',
      slope: 'Slope k (m)',
      intercept: 'Y-Intercept b',
      xInt: 'X-Intercept',
      yInt: 'Y-Intercept',
      stdEq: 'Standard Form',
      pointSlopeEq: 'Point-Slope Form',
      distance: 'Distance d',
      midpoint: 'Midpoint M',
      angle: 'Angle α',
      triangleArea: 'Axes Triangle Area',
      monotonicity: 'Monotonicity',
      quadrants: 'Quadrants',
      tabSteps: 'Step-by-Step Solution',
      tabEvaluator: 'Point Evaluator',
      tabGuide: 'Properties & Guide',
      tabFaq: 'FAQ',
      graphTitle: 'Interactive Coordinate Graph',
      graphTip: 'Drag Point A / Point B directly on canvas (Touch supported on mobile)',
      evalXLabel: 'Given x, calculate y:',
      evalYLabel: 'Given y, calculate x:',
      evalPrompt: 'Quickly evaluate points on the current line equation:',
      evalResultBadge: 'Result',
      feedEvaluatorTip: 'Click to test in evaluator',
      footerText: 'Linear Function & Line Equation Generator from Two Points · Local-First',
      sourceCode: 'GitHub Source',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      about: 'About',
      monoInc: 'Increasing (k > 0)',
      monoDec: 'Decreasing (k < 0)',
      monoConst: 'Constant (Horizontal)',
      monoVert: 'Vertical Line',
      quadrantPrefix: 'Quadrants ',
      quadrantSuffix: '',
      originThrough: 'Passes origin',
      auxParallelTitle: 'Parallel line through origin L∥',
      auxPerpBisectorTitle: 'Perpendicular Bisector L⊥',
      promptEmpty: 'Please fill in all 4 coordinates to compute equation and graph.',
      promptInvalid: 'Invalid input: non-numeric values detected. Please fix highlighted fields.'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Clean Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  {t.siteTitle}
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {t.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t.subTitle}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Preset Selector */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                {t.presets}:
              </span>
              <select
                value={selectedPresetId}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (idx >= 0 && PRESET_EXAMPLES[idx]) {
                    syncInputsFromPoints(
                      { ...PRESET_EXAMPLES[idx].p1 },
                      { ...PRESET_EXAMPLES[idx].p2 },
                      idx
                    );
                  }
                }}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value={-1}>{t.customPreset}</option>
                {PRESET_EXAMPLES.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {lang === 'zh' ? ex.labelZh : ex.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Share Problem Link Button */}
            <button
              onClick={handleCopyShareLink}
              title={t.shareBtn}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{t.shareBtn}</span>
            </button>

            {/* PDF Export Button */}
            {result && result.isValid && (
              <button
                onClick={handleExportPDF}
                disabled={isExportingPdf}
                title={t.exportPdfBtn}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isExportingPdf ? (lang === 'zh' ? '导出中...' : 'Exporting...') : t.exportPdfBtn}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              title={lang === 'zh' ? 'Switch to English' : '切换为简体中文'}
            >
              <Globe className="h-3.5 w-3.5 text-indigo-600" />
              <span>{lang === 'zh' ? 'EN' : '中文'}</span>
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/laohu90/linear-function-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="GitHub Repository"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top 2-Column Grid: Inputs & Result (Left) + Interactive Graph (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 Cols): Inputs + Primary Outputs */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 1: Point Inputs with Strict Validation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  {t.pointCardTitle}
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSwap}
                    title={t.swapBtn}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>{t.swapBtn}</span>
                  </button>
                  <button
                    onClick={handleRandom}
                    title={t.randomBtn}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    <span>{t.randomBtn}</span>
                  </button>
                </div>
              </div>

              {/* Point A and Point B side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Point A */}
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      {t.pointA} (x₁, y₁)
                    </span>
                    {!vX1.isInvalid && !vY1.isInvalid && !vX1.isEmpty && !vY1.isEmpty && (
                      <span className="text-[11px] font-mono text-blue-600/80">
                        ({vX1.value}, {vY1.value})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">x₁</span>
                      <input
                        type="text"
                        value={strX1}
                        onChange={(e) => {
                          setSelectedPresetId(-1);
                          setStrX1(e.target.value);
                        }}
                        placeholder="例: 1"
                        className={`w-full px-2.5 py-1.5 rounded-lg font-mono text-sm focus:outline-none transition-colors ${
                          vX1.isInvalid
                            ? 'bg-red-50 border-2 border-red-500 text-red-900 focus:ring-2 focus:ring-red-200'
                            : vX1.isEmpty
                            ? 'bg-amber-50/40 border border-amber-300 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                            : 'bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      />
                      {vX1.isInvalid && (
                        <span className="text-[10px] text-red-600 block mt-1 font-medium">
                          {lang === 'zh' ? '不是数字' : 'Not a number'}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">y₁</span>
                      <input
                        type="text"
                        value={strY1}
                        onChange={(e) => {
                          setSelectedPresetId(-1);
                          setStrY1(e.target.value);
                        }}
                        placeholder="例: 3"
                        className={`w-full px-2.5 py-1.5 rounded-lg font-mono text-sm focus:outline-none transition-colors ${
                          vY1.isInvalid
                            ? 'bg-red-50 border-2 border-red-500 text-red-900 focus:ring-2 focus:ring-red-200'
                            : vY1.isEmpty
                            ? 'bg-amber-50/40 border border-amber-300 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                            : 'bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      />
                      {vY1.isInvalid && (
                        <span className="text-[10px] text-red-600 block mt-1 font-medium">
                          {lang === 'zh' ? '不是数字' : 'Not a number'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Point B */}
                <div className="p-3.5 rounded-xl bg-pink-50/50 border border-pink-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-pink-700 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-pink-600" />
                      {t.pointB} (x₂, y₂)
                    </span>
                    {!vX2.isInvalid && !vY2.isInvalid && !vX2.isEmpty && !vY2.isEmpty && (
                      <span className="text-[11px] font-mono text-pink-600/80">
                        ({vX2.value}, {vY2.value})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">x₂</span>
                      <input
                        type="text"
                        value={strX2}
                        onChange={(e) => {
                          setSelectedPresetId(-1);
                          setStrX2(e.target.value);
                        }}
                        placeholder="例: 3"
                        className={`w-full px-2.5 py-1.5 rounded-lg font-mono text-sm focus:outline-none transition-colors ${
                          vX2.isInvalid
                            ? 'bg-red-50 border-2 border-red-500 text-red-900 focus:ring-2 focus:ring-red-200'
                            : vX2.isEmpty
                            ? 'bg-amber-50/40 border border-amber-300 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                            : 'bg-white border border-slate-300 text-slate-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500'
                        }`}
                      />
                      {vX2.isInvalid && (
                        <span className="text-[10px] text-red-600 block mt-1 font-medium">
                          {lang === 'zh' ? '不是数字' : 'Not a number'}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">y₂</span>
                      <input
                        type="text"
                        value={strY2}
                        onChange={(e) => {
                          setSelectedPresetId(-1);
                          setStrY2(e.target.value);
                        }}
                        placeholder="例: 7"
                        className={`w-full px-2.5 py-1.5 rounded-lg font-mono text-sm focus:outline-none transition-colors ${
                          vY2.isInvalid
                            ? 'bg-red-50 border-2 border-red-500 text-red-900 focus:ring-2 focus:ring-red-200'
                            : vY2.isEmpty
                            ? 'bg-amber-50/40 border border-amber-300 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                            : 'bg-white border border-slate-300 text-slate-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500'
                        }`}
                      />
                      {vY2.isInvalid && (
                        <span className="text-[10px] text-red-600 block mt-1 font-medium">
                          {lang === 'zh' ? '不是数字' : 'Not a number'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Precision Control Section (Feature 3) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{t.precisionTitle}:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {precision} {t.decimalPlaces}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[0, 2, 3, 4, 6].map((pVal) => (
                    <button
                      key={pVal}
                      onClick={() => handleSetPrecision(pVal)}
                      className={`px-2 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                        precision === pVal
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pVal}位
                    </button>
                  ))}
                  {/* Stepper buttons */}
                  <div className="flex items-center border border-slate-200 rounded-md overflow-hidden ml-1">
                    <button
                      onClick={() => handleSetPrecision(precision - 1)}
                      disabled={precision <= 0}
                      className="px-1.5 py-0.5 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleSetPrecision(precision + 1)}
                      disabled={precision >= 8}
                      className="px-1.5 py-0.5 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Main Calculation Result / Empty / Error State */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              {computationStatus === 'invalid' ? (
                /* Requirement 1: Non-numeric error prompt */
                <div className="p-5 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                    <h3 className="font-bold text-sm sm:text-base">
                      {lang === 'zh' ? '输入格式无效' : 'Invalid Input Detected'}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                    {lang === 'zh'
                      ? '检测到输入框包含非数字字符（如字母、多重小数点等）。为保证数学结果真实准确，结果区已清空，请更正标红的输入框。'
                      : 'Non-numeric input detected. Result area cleared to prevent false calculations. Please fix the highlighted fields above.'}
                  </p>
                </div>
              ) : computationStatus === 'empty' ? (
                /* Requirement 2: Empty input prompt */
                <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-amber-600 shrink-0" />
                    <h3 className="font-bold text-sm sm:text-base">
                      {lang === 'zh' ? '请填写完整坐标' : 'Please Fill In All Coordinates'}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    {lang === 'zh'
                      ? '任一输入框为空时已自动停止计算。请输入点 A(x₁, y₁) 与 点 B(x₂, y₂) 的完整坐标数值以开始求解。'
                      : 'Calculation stopped because one or more coordinates are empty. Please fill in all 4 coordinates to compute.'}
                  </p>
                </div>
              ) : result && !result.isValid ? (
                /* Degenerate coincident points */
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <h3 className="font-bold text-sm sm:text-base">
                      {lang === 'zh' ? '两点坐标完全重合' : 'Points are Identical'}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {result.errorMessage}
                  </p>
                </div>
              ) : result ? (
                /* Normal valid calculation result */
                <>
                  {/* Big Equation Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/80 border border-indigo-100 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">
                        {t.primaryEq}
                      </span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight truncate">
                        {result.slopeInterceptEq}
                      </div>
                      {result.specialType === 'general' && (
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {t.stdEq}: {result.generalEq}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(result.slopeInterceptEq)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        title={t.copyBtn}
                      >
                        {copiedEq ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span className="hidden sm:inline">{copiedEq ? t.copied : t.copyBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Core Parameter Badges with click-to-evaluate linkage */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Slope k */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] text-slate-500 block mb-0.5">{t.slope}</span>
                      <div className="text-base font-bold text-indigo-700 font-mono">
                        {result.hasSlope ? result.kText : (lang === 'zh' ? '不存在' : 'Undefined')}
                      </div>
                      {result.k !== undefined && !result.kFraction?.isInteger && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          ≈ {result.k.toFixed(precision)}
                        </div>
                      )}
                    </div>

                    {/* Y-Intercept b */}
                    <div
                      onClick={() => result.b !== undefined && feedIntoEvaluator(result.b, 'y')}
                      title={t.feedEvaluatorTip}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-colors"
                    >
                      <span className="text-[11px] text-slate-500 block mb-0.5">{t.intercept}</span>
                      <div className="text-base font-bold text-amber-700 font-mono">
                        {result.hasYIntercept ? result.bText : (lang === 'zh' ? '无' : 'None')}
                      </div>
                      {result.b !== undefined && !result.bFraction?.isInteger && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          ≈ {result.b.toFixed(precision)}
                        </div>
                      )}
                    </div>

                    {/* X-Intercept */}
                    <div
                      onClick={() => result.xIntercept !== undefined && feedIntoEvaluator(result.xIntercept, 'x')}
                      title={t.feedEvaluatorTip}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
                    >
                      <span className="text-[11px] text-slate-500 block mb-0.5">{t.xInt}</span>
                      <div className="text-xs font-bold text-emerald-700 font-mono truncate">
                        {result.xInterceptPoint
                          ? `(${result.xInterceptText}, 0)`
                          : result.xInterceptText || (lang === 'zh' ? '无' : 'None')}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{lang === 'zh' ? '令 y = 0' : 'Set y = 0'}</span>
                        <span className="text-emerald-600 text-[10px] font-semibold">代入 ➔</span>
                      </div>
                    </div>

                    {/* Y-Intercept Point */}
                    <div
                      onClick={() => result.b !== undefined && feedIntoEvaluator(0, 'x')}
                      title={t.feedEvaluatorTip}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-colors"
                    >
                      <span className="text-[11px] text-slate-500 block mb-0.5">{t.yInt}</span>
                      <div className="text-xs font-bold text-amber-700 font-mono truncate">
                        {result.yInterceptPoint
                          ? `(0, ${result.bText})`
                          : result.bText || (lang === 'zh' ? '无' : 'None')}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{lang === 'zh' ? '令 x = 0' : 'Set x = 0'}</span>
                        <span className="text-amber-600 text-[10px] font-semibold">代入 ➔</span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Details Compact Bar */}
                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.distance}</span>
                      <span className="font-mono font-semibold text-slate-800">{result.distanceExactText}</span>
                    </div>

                    <div
                      onClick={() => feedIntoEvaluator(result.midpoint.x, 'x')}
                      title={t.feedEvaluatorTip}
                      className="cursor-pointer hover:text-indigo-600"
                    >
                      <span className="text-slate-400 text-[11px] block">{t.midpoint}</span>
                      <span className="font-mono font-semibold text-slate-800">
                        M({formatNum(result.midpoint.x, precision)}, {formatNum(result.midpoint.y, precision)})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.angle}</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {result.inclinationAngleDeg.toFixed(1)}°
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.monotonicity}</span>
                      <span className="font-medium text-indigo-700 flex items-center gap-1">
                        {result.monotonicity === 'increasing' && <TrendingUp className="h-3 w-3 text-emerald-600" />}
                        {result.monotonicity === 'decreasing' && <TrendingDown className="h-3 w-3 text-rose-600" />}
                        {result.monotonicity === 'constant' && <Minus className="h-3 w-3 text-slate-500" />}
                        <span>
                          {result.monotonicity === 'increasing'
                            ? t.monoInc
                            : result.monotonicity === 'decreasing'
                            ? t.monoDec
                            : result.monotonicity === 'constant'
                            ? t.monoConst
                            : t.monoVert}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.quadrants}</span>
                      <span className="font-medium text-slate-800">
                        {result.quadrants.length > 0
                          ? `${t.quadrantPrefix}${result.quadrants.join(lang === 'zh' ? '、' : ', ')}${t.quadrantSuffix}`
                          : t.originThrough}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.triangleArea}</span>
                      <span className="font-mono font-semibold text-amber-700">
                        {result.triangleAreaWithAxes ? formatNum(result.triangleAreaWithAxes, precision) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Auxiliary Linear Equations Card (Linkage with Geometry) */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400">{t.pointSlopeEq}:</span>
                      <span className="text-slate-700 font-medium">{result.pointSlopeEq}</span>
                    </div>
                    {result.perpendicularThroughMidpoint && (
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-purple-600 font-semibold">{t.auxPerpBisectorTitle}:</span>
                        <span className="text-purple-800 font-bold">{result.perpendicularThroughMidpoint}</span>
                      </div>
                    )}
                  </div>

                  {/* Copy All Results Action Bar (Requirement 4) */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={handleCopyAllResults}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                      title={t.copyAllBtn}
                    >
                      {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedAll ? t.copied : t.copyAllBtn}</span>
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={isExportingPdf}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>{t.exportPdfBtn}</span>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Right Column (7 Cols): Interactive White Canvas */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  {t.graphTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  {t.graphTip}
                </p>
              </div>
            </div>

            {/* Coordinate Plane Canvas with touch & snap linkage */}
            <CoordinatePlane
              ref={planeRef}
              result={result}
              status={computationStatus}
              errorMessage={lang === 'zh' ? '检测到非数字字符，计算已停止' : 'Invalid coordinate format'}
              onPointChange={(newP1, newP2) => {
                syncInputsFromPoints(newP1, newP2, -1);
              }}
              lang={lang}
              onExportPDF={result && result.isValid ? handleExportPDF : undefined}
            />
          </div>
        </div>

        {/* 3. Lower Organized Section: Clean Tabs for Deep Details */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Section Segment Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setSubView('steps')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                subView === 'steps'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 inline mr-1.5" />
              {t.tabSteps}
            </button>
            <button
              onClick={() => setSubView('evaluator')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                subView === 'evaluator'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 inline mr-1.5" />
              {t.tabEvaluator}
            </button>
            <button
              onClick={() => setSubView('guide')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                subView === 'guide'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 inline mr-1.5" />
              {t.tabGuide}
            </button>
            <button
              onClick={() => setSubView('faq')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                subView === 'faq'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5 inline mr-1.5" />
              {t.tabFaq}
            </button>
          </div>

          {/* Subview 1: Detailed Step-by-Step Derivation */}
          {subView === 'steps' && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {lang === 'zh'
                    ? '分步演算记录 · 待定系数法与斜率公式法'
                    : 'Step-by-Step Derivation · Substitution & Slope Formula'}
                </span>
                {result && result.isValid ? (
                  <span className="text-xs text-indigo-600 font-mono font-medium">
                    {lang === 'zh' ? '两点坐标' : 'Points'}: A({result.p1.x}, {result.p1.y}) {lang === 'zh' ? '与' : 'and'} B({result.p2.x}, {result.p2.y})
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    {lang === 'zh' ? '等待输入有效坐标' : 'Waiting for valid coordinates'}
                  </span>
                )}
              </div>

              {result && result.isValid ? (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 font-mono text-xs sm:text-sm text-slate-700 space-y-2 leading-relaxed">
                  {(lang === 'zh' ? result.stepsZh : result.stepsEn).map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith('【') || line.startsWith('[')
                          ? 'font-bold text-indigo-800 pt-3 text-sm border-t border-slate-200/60 first:border-0 first:pt-0'
                          : line.includes('👉')
                          ? 'font-bold text-emerald-700 py-1 text-base'
                          : ''
                      }
                    >
                      {line || <div className="h-1" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
                  {lang === 'zh' ? '请在上方输入有效坐标后查看分步推导。' : 'Please enter valid coordinates above to view steps.'}
                </div>
              )}
            </div>
          )}

          {/* Subview 2: Point Evaluator Tool with Instant Linked Verification */}
          {subView === 'evaluator' && (
            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <p className="text-xs text-slate-500">
                  {t.evalPrompt} <strong className="text-indigo-700 font-mono text-sm">{result?.slopeInterceptEq || '—'}</strong>
                </p>
                {result && result.isValid && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">快速带入核心特征点：</span>
                    {result.xIntercept !== undefined && (
                      <button
                        onClick={() => result.xIntercept !== undefined && setEvalX(formatNum(result.xIntercept, precision))}
                        className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        X轴交点 x={formatNum(result.xIntercept, precision)}
                      </button>
                    )}
                    {result.b !== undefined && (
                      <button
                        onClick={() => setEvalX('0')}
                        className="px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        Y轴截距 x=0
                      </button>
                    )}
                    <button
                      onClick={() => setEvalX(formatNum(result.midpoint.x, precision))}
                      className="px-2 py-0.5 rounded text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      中点 M
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Given x => solve y */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {t.evalXLabel}
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={evalX}
                      onChange={(e) => setEvalX(e.target.value)}
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">{t.evalResultBadge}</span>
                    <span className="text-base font-bold font-mono text-indigo-700">
                      y = {evaluatedY}
                    </span>
                  </div>
                </div>

                {/* Given y => solve x */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {t.evalYLabel}
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={evalY}
                      onChange={(e) => setEvalY(e.target.value)}
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">{t.evalResultBadge}</span>
                    <span className="text-base font-bold font-mono text-indigo-700">
                      x = {evaluatedX}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subview 3: Formula & Exam Point Guide */}
          {subView === 'guide' && (
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                  <h4 className="font-bold text-sm text-indigo-900">
                    {lang === 'zh' ? '1. 斜截式 (Slope-Intercept Form)' : '1. Slope-Intercept Form'}
                  </h4>
                  <div className="font-mono text-indigo-800 font-bold text-base py-1">y = kx + b</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'zh'
                      ? 'k 为直线斜率 (k = tan α)，反映直线的倾斜程度与增减性；b 为在 y 轴上的截距，交点为 (0, b)。'
                      : 'm is the slope, representing inclination and rate of change; b is the y-intercept with coordinate (0, b).'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                  <h4 className="font-bold text-sm text-emerald-900">
                    {lang === 'zh' ? '2. 一般式 (Standard Form)' : '2. Standard Form'}
                  </h4>
                  <div className="font-mono text-emerald-800 font-bold text-base py-1">Ax + By + C = 0</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'zh'
                      ? 'A、B 不能同时为 0。通常约去公因数并将 A 化为非负整数。能够完整统一表示包括垂直线 (B=0) 在内的所有直线。'
                      : 'A and B not both zero. Handles every line in Euclidean geometry including vertical lines (B=0).'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                  <h4 className="font-bold text-sm text-purple-900">
                    {lang === 'zh' ? '3. 待定系数法 (Substitution Method)' : '3. Substitution Method'}
                  </h4>
                  <div className="font-mono text-purple-800 font-bold text-base py-1">{lang === 'zh' ? '设 ➔ 代 ➔ 解 ➔ 写' : 'Set ➔ Plug ➔ Solve ➔ State'}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'zh'
                      ? '先设解析式为 y = kx + b，将两已知点坐标分别代入建立二元一次方程组，解得未知系数 k 与 b。'
                      : 'Assume y = mx + b, plug coordinates of both points to form a 2-variable linear system, and solve for m and b.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subview 4: FAQ (Fully Bilingual) */}
          {subView === 'faq' && (
            <div className="p-6 space-y-3">
              {(lang === 'zh'
                ? [
                    {
                      q: '两点横坐标相同 (x₁ = x₂) 时怎么算？',
                      a: '当两点的横坐标相同时，直线垂直于 x 轴（平行于 y 轴），分母 x₂ - x₁ = 0，斜率不存在。直线方程为垂直线形式 x = x₁。'
                    },
                    {
                      q: '两点纵坐标相同 (y₁ = y₂) 时是一次函数吗？',
                      a: '当纵坐标相同时，斜率 k = 0，方程为常数函数 y = y₁（平行于 x 轴的水平线）。'
                    },
                    {
                      q: '如何快速计算直线与两坐标轴围成的直角三角形面积？',
                      a: '设与两坐标轴交点为 (x₀, 0) 与 (0, y₀)，直角三角形面积为 S = 1/2 × |x₀| × |y₀| = 1/2 × |-b/k| × |b|。'
                    },
                    {
                      q: '两条直线平行和垂直的斜率关系是什么？',
                      a: '平行直线斜率相等 (k₁ = k₂) 且截距不等；垂直直线斜率互为负倒数 (k₁ × k₂ = -1，即 k₂ = -1/k₁)。'
                    }
                  ]
                : [
                    {
                      q: 'What happens when x₁ = x₂?',
                      a: 'When the two points have identical x-coordinates, the line is vertical (perpendicular to x-axis, parallel to y-axis). The denominator Δx = 0, so the slope is undefined. The equation is vertical line x = x₁.'
                    },
                    {
                      q: 'What happens when y₁ = y₂?',
                      a: 'When y-coordinates are equal, the slope is 0 (Δy = 0). The line is a horizontal constant line with equation y = y₁.'
                    },
                    {
                      q: 'How to calculate the triangle area formed with coordinate axes?',
                      a: 'With x-intercept (x₀, 0) and y-intercept (0, y₀), the right triangle area is Area = 1/2 × |x₀| × |y₀| = 1/2 × |-b/m| × |b|.'
                    },
                    {
                      q: 'What are the conditions for parallel and perpendicular lines?',
                      a: 'Parallel lines share identical slope (m₁ = m₂) with different intercepts. Perpendicular lines have negative reciprocal slopes (m₁ × m₂ = -1, meaning m₂ = -1/m₁).'
                    }
                  ]
              ).map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 4. Enhanced Pedagogical Footer (Requirement 6: Privacy, Terms, About, GitHub) */}
      <footer className="border-t border-slate-200 bg-white py-8 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                {lang === 'zh' ? '一次函数解析式生成器' : 'Linear Function Calculator'}
              </span>
              <span>· {t.footerText}</span>
            </div>

            {/* Links: Privacy, Terms, About, GitHub */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-600">
              <button
                onClick={() => openInfoModal('about')}
                className="hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Info className="h-3.5 w-3.5" />
                <span>{t.about}</span>
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => openInfoModal('privacy')}
                className="hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t.privacy}</span>
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => openInfoModal('terms')}
                className="hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{t.terms}</span>
              </button>
              <span className="text-slate-300">·</span>
              <a
                href="https://github.com/laohu90/linear-function-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium"
              >
                <Github className="h-3.5 w-3.5" />
                <span>{t.sourceCode}</span>
              </a>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-600">{t.badge}</span>
            </div>
          </div>

          {/* Bilingual Keywords Footer Bar for Google Crawling */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Search className="h-3 w-3 text-indigo-500" />
              <span>{lang === 'zh' ? '双语收录词 (Indexed Keywords):' : 'Bilingual Keywords:'}</span>
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">一次函数解析式生成器</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">一次函数计算器</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">两点求直线方程</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">y = kx + b</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Linear Function Calculator</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Line Equation from Two Points</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Slope-Intercept Form Calculator</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">y = mx + b</span>
          </div>
        </div>
      </footer>

      {/* Info Modal Dialog (Privacy, Terms, About) */}
      <InfoModal
        isOpen={infoModalOpen}
        activeTab={infoModalTab}
        onClose={() => setInfoModalOpen(false)}
        onTabChange={(tab) => setInfoModalTab(tab)}
        lang={lang}
      />
    </div>
  );
}

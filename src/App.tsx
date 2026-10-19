/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  calculateFromTwoPoints,
  Point,
  formatNum,
  CalculationResult
} from './utils/linearMath';
import { CoordinatePlane } from './components/CoordinatePlane';
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
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const PRESET_EXAMPLES = [
  { label: '经典例题1: (1, 3) 与 (3, 7) [增函数]', p1: { x: 1, y: 3 }, p2: { x: 3, y: 7 } },
  { label: '经典例题2: (-2, 5) 与 (4, -1) [减函数]', p1: { x: -2, y: 5 }, p2: { x: 4, y: -1 } },
  { label: '经典例题3: (0, 0) 与 (2, 6) [正比例函数]', p1: { x: 0, y: 0 }, p2: { x: 2, y: 6 } },
  { label: '经典例题4: (1, 2) 与 (4, 4) [分数斜率 2/3]', p1: { x: 1, y: 2 }, p2: { x: 4, y: 4 } },
  { label: '特殊线型5: (-3, 4) 与 (5, 4) [水平线 k=0]', p1: { x: -3, y: 4 }, p2: { x: 5, y: 4 } },
  { label: '特殊线型6: (3, -2) 与 (3, 5) [垂直线 k不存在]', p1: { x: 3, y: -2 }, p2: { x: 3, y: 5 } }
];

export default function App() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  // Input points
  const [p1, setP1] = useState<Point>({ x: 1, y: 2 });
  const [p2, setP2] = useState<Point>({ x: 4, y: 8 });

  // Evaluator inputs
  const [evalX, setEvalX] = useState<string>('5');
  const [evalY, setEvalY] = useState<string>('10');

  // UI state
  const [copiedEq, setCopiedEq] = useState(false);
  const [subView, setSubView] = useState<'steps' | 'evaluator' | 'guide' | 'faq'>('steps');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Reactive result
  const result: CalculationResult = useMemo(() => {
    return calculateFromTwoPoints(p1, p2);
  }, [p1, p2]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEq(true);
    setTimeout(() => setCopiedEq(false), 2000);
  };

  const handleSwap = () => {
    setP1({ ...p2 });
    setP2({ ...p1 });
  };

  const handleRandom = () => {
    const rand = () => Math.floor(Math.random() * 15) - 7;
    let rx1 = rand();
    let ry1 = rand();
    let rx2 = rand();
    let ry2 = rand();
    if (rx1 === rx2 && ry1 === ry2) rx2 += 2;
    setP1({ x: rx1, y: ry1 });
    setP2({ x: rx2, y: ry2 });
  };

  const evaluatedY = useMemo(() => {
    const xNum = parseFloat(evalX);
    if (isNaN(xNum) || !result.isValid) return '—';
    if (result.specialType === 'vertical') {
      return xNum === result.p1.x ? '任意实数' : '无对应点';
    }
    if (result.k !== undefined && result.b !== undefined) {
      return formatNum(result.k * xNum + result.b);
    }
    return '—';
  }, [evalX, result]);

  const evaluatedX = useMemo(() => {
    const yNum = parseFloat(evalY);
    if (isNaN(yNum) || !result.isValid) return '—';
    if (result.specialType === 'vertical') {
      return formatNum(result.p1.x);
    }
    if (result.specialType === 'horizontal') {
      return yNum === result.p1.y ? '任意实数' : '无对应点';
    }
    if (result.k !== undefined && result.b !== undefined && Math.abs(result.k) > 1e-9) {
      return formatNum((yNum - result.b) / result.k);
    }
    return '—';
  }, [evalY, result]);

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
      primaryEq: '一次函数解析式 (斜截式)',
      copyBtn: '复制解析式',
      copied: '已复制！',
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
      graphTip: '支持直接在画布拖拽点 A、点 B 实时更新',
      evalXLabel: '已知 x 求 y：',
      evalYLabel: '已知 y 求 x：',
      footerText: '一次函数解析式生成器 · 专业数学教育与计算工具'
    },
    en: {
      siteTitle: 'Linear Function Calculator',
      badge: 'y = mx + b',
      subTitle: 'Calculate line equation from two coordinates with steps and graph',
      pointCardTitle: 'Enter Coordinates',
      pointA: 'Point A',
      pointB: 'Point B',
      swapBtn: 'Swap',
      randomBtn: 'Random',
      presets: 'Presets',
      primaryEq: 'Slope-Intercept Form (y = mx + b)',
      copyBtn: 'Copy Equation',
      copied: 'Copied!',
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
      monotonicity: 'Behavior',
      quadrants: 'Quadrants',
      tabSteps: 'Step-by-Step Derivation',
      tabEvaluator: 'Point Evaluator',
      tabGuide: 'Properties & Guide',
      tabFaq: 'FAQ',
      graphTitle: 'Interactive Coordinate Graph',
      graphTip: 'Drag Point A / Point B directly to update in real time',
      evalXLabel: 'Given x, find y:',
      evalYLabel: 'Given y, find x:',
      footerText: 'Linear Function & Line Equation Generator from Two Points'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Clean Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
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
          <div className="flex items-center gap-2.5">
            {/* Preset Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                {t.presets}:
              </span>
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (!isNaN(idx) && PRESET_EXAMPLES[idx]) {
                    setP1({ ...PRESET_EXAMPLES[idx].p1 });
                    setP2({ ...PRESET_EXAMPLES[idx].p2 });
                  }
                }}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                {PRESET_EXAMPLES.map((ex, i) => (
                  <option key={i} value={i}>
                    {ex.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
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
            {/* Card 1: Point Inputs */}
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
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>{t.swapBtn}</span>
                  </button>
                  <button
                    onClick={handleRandom}
                    title={t.randomBtn}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
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
                    <span className="text-[11px] font-mono text-blue-600/80">
                      ({p1.x}, {p1.y})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">x₁</span>
                      <input
                        type="number"
                        step="any"
                        value={p1.x}
                        onChange={(e) => setP1({ ...p1, x: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">y₁</span>
                      <input
                        type="number"
                        step="any"
                        value={p1.y}
                        onChange={(e) => setP1({ ...p1, y: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
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
                    <span className="text-[11px] font-mono text-pink-600/80">
                      ({p2.x}, {p2.y})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">x₂</span>
                      <input
                        type="number"
                        step="any"
                        value={p2.x}
                        onChange={(e) => setP2({ ...p2, x: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">y₂</span>
                      <input
                        type="number"
                        step="any"
                        value={p2.y}
                        onChange={(e) => setP2({ ...p2, y: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Main Calculation Result */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
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

                <button
                  onClick={() => handleCopy(result.slopeInterceptEq)}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {copiedEq ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedEq ? t.copied : t.copyBtn}</span>
                </button>
              </div>

              {/* 4 Core Parameter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Slope k */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block mb-0.5">{t.slope}</span>
                  <div className="text-base font-bold text-indigo-700 font-mono">
                    {result.hasSlope ? result.kText : '不存在'}
                  </div>
                  {result.k !== undefined && !result.kFraction?.isInteger && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      ≈ {result.k.toFixed(3)}
                    </div>
                  )}
                </div>

                {/* Y-Intercept b */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block mb-0.5">{t.intercept}</span>
                  <div className="text-base font-bold text-amber-700 font-mono">
                    {result.hasYIntercept ? result.bText : '无'}
                  </div>
                  {result.b !== undefined && !result.bFraction?.isInteger && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      ≈ {result.b.toFixed(3)}
                    </div>
                  )}
                </div>

                {/* X-Intercept */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block mb-0.5">{t.xInt}</span>
                  <div className="text-xs font-bold text-emerald-700 font-mono truncate">
                    {result.xInterceptPoint
                      ? `(${result.xInterceptText}, 0)`
                      : result.xInterceptText || '无'}
                  </div>
                  <div className="text-[10px] text-slate-400">令 y = 0</div>
                </div>

                {/* Y-Intercept Point */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block mb-0.5">{t.yInt}</span>
                  <div className="text-xs font-bold text-amber-700 font-mono truncate">
                    {result.yInterceptPoint
                      ? `(0, ${result.bText})`
                      : result.bText || '无'}
                  </div>
                  <div className="text-[10px] text-slate-400">令 x = 0</div>
                </div>
              </div>

              {/* Secondary Details Compact Bar */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 text-[11px] block">{t.distance}</span>
                  <span className="font-mono font-semibold text-slate-800">{result.distanceExactText}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">{t.midpoint}</span>
                  <span className="font-mono font-semibold text-slate-800">
                    M({formatNum(result.midpoint.x)}, {formatNum(result.midpoint.y)})
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
                        ? '递增 (k > 0)'
                        : result.monotonicity === 'decreasing'
                        ? '递减 (k < 0)'
                        : result.monotonicity === 'constant'
                        ? '常数水平线'
                        : '垂直线'}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">{t.quadrants}</span>
                  <span className="font-medium text-slate-800">
                    {result.quadrants.length > 0 ? `第 ${result.quadrants.join('、')} 象限` : '过原点'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">{t.triangleArea}</span>
                  <span className="font-mono font-semibold text-amber-700">
                    {result.triangleAreaWithAxes ? formatNum(result.triangleAreaWithAxes) : '—'}
                  </span>
                </div>
              </div>
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

            {/* Coordinate Plane Canvas */}
            <CoordinatePlane
              result={result}
              onPointChange={(newP1, newP2) => {
                setP1(newP1);
                setP2(newP2);
              }}
              lang={lang}
            />
          </div>
        </div>

        {/* 3. Lower Organized Section: Clean Tabs for Deep Details */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Section Segment Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setSubView('steps')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
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
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
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
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
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
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  分步演算记录 · 待定系数法与斜率公式法
                </span>
                <span className="text-xs text-indigo-600 font-mono font-medium">
                  两点: A({p1.x}, {p1.y}) 与 B({p2.x}, {p2.y})
                </span>
              </div>

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
            </div>
          )}

          {/* Subview 2: Point Evaluator Tool */}
          {subView === 'evaluator' && (
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                在当前求得的一次函数 <strong className="text-slate-800 font-mono">{result.slopeInterceptEq}</strong> 下快速计算对应点坐标：
              </p>

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
                    <span className="text-[11px] text-slate-400 block">计算结果</span>
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
                    <span className="text-[11px] text-slate-400 block">计算结果</span>
                    <span className="text-base font-bold font-mono text-indigo-700">
                      x = {evaluatedX}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subview 3: Formula & Guide (Clean Table) */}
          {subView === 'guide' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                    1. 一次函数标准形式定义
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    一般地，形如 <strong>y = kx + b</strong>（k, b 为常数，且 <strong>k ≠ 0</strong>）叫做一次函数。
                    当 <strong>b = 0</strong> 时为<strong>正比例函数</strong>，图像必过原点 (0, 0)。
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                    2. 斜率 k 与截距 b 的几何意义
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    斜率 <strong>k = (y₂ - y₁) / (x₂ - x₁)</strong> 决定直线的倾斜方向与陡缓；
                    截距 <strong>b</strong> 为直线与 y 轴交点的纵坐标 (0, b)。
                  </p>
                </div>
              </div>

              {/* Clean Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2.5">
                  3. 象限分布规律速查表
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="bg-slate-100/80 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5 border-b border-slate-200">符号条件</th>
                        <th className="px-4 py-2.5 border-b border-slate-200">经过象限</th>
                        <th className="px-4 py-2.5 border-b border-slate-200">增减性</th>
                        <th className="px-4 py-2.5 border-b border-slate-200">与 y 轴交点</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td className="px-4 py-2.5 font-bold font-mono text-indigo-700">k &gt; 0, b &gt; 0</td>
                        <td className="px-4 py-2.5 text-emerald-700 font-medium">第一、二、三象限</td>
                        <td className="px-4 py-2.5">y 随 x 增大而增大</td>
                        <td className="px-4 py-2.5">正半轴 (0, b)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold font-mono text-indigo-700">k &gt; 0, b &lt; 0</td>
                        <td className="px-4 py-2.5 text-emerald-700 font-medium">第一、三、四象限</td>
                        <td className="px-4 py-2.5">y 随 x 增大而增大</td>
                        <td className="px-4 py-2.5">负半轴 (0, b)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold font-mono text-indigo-700">k &lt; 0, b &gt; 0</td>
                        <td className="px-4 py-2.5 text-emerald-700 font-medium">第一、二、四象限</td>
                        <td className="px-4 py-2.5">y 随 x 增大而减小</td>
                        <td className="px-4 py-2.5">正半轴 (0, b)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold font-mono text-indigo-700">k &lt; 0, b &lt; 0</td>
                        <td className="px-4 py-2.5 text-emerald-700 font-medium">第二、三、四象限</td>
                        <td className="px-4 py-2.5">y 随 x 增大而减小</td>
                        <td className="px-4 py-2.5">负半轴 (0, b)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Subview 4: FAQ */}
          {subView === 'faq' && (
            <div className="p-6 space-y-3">
              {[
                {
                  q: '两点横坐标相同 (x₁ = x₂) 时怎么算？',
                  a: '当两点的横坐标相同时，直线垂直于 x 轴（平行于 y 轴），分母 x₂ - x₁ = 0，斜率不存在。直线方程为垂直线方程 x = x₁。'
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
              ].map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
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

      {/* 4. Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">一次函数解析式生成器</span>
            <span>· {t.footerText}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="https://github.com/laohu90/linear-function-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub 源码</span>
            </a>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-600">y = kx + b</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

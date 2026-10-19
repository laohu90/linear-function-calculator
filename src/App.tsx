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
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Shuffle,
  ArrowRightLeft,
  BookOpen,
  HelpCircle,
  Calculator,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  Share2,
  Github,
  Globe,
  Sliders,
  Maximize2
} from 'lucide-react';

// Preset standard math textbook questions
const PRESET_EXAMPLES = [
  { label: '例题1: 经典初中例题 (1, 3) 与 (3, 7)', p1: { x: 1, y: 3 }, p2: { x: 3, y: 7 } },
  { label: '例题2: 负斜率经过不同象限 (-2, 5) 与 (4, -1)', p1: { x: -2, y: 5 }, p2: { x: 4, y: -1 } },
  { label: '例题3: 正比例函数过原点 (0, 0) 与 (2, 6)', p1: { x: 0, y: 0 }, p2: { x: 2, y: 6 } },
  { label: '例题4: 分数斜率与截距 (1, 2) 与 (4, 4)', p1: { x: 1, y: 2 }, p2: { x: 4, y: 4 } },
  { label: '例题5: 水平直线 (斜率 k = 0) (-3, 4) 与 (5, 4)', p1: { x: -3, y: 4 }, p2: { x: 5, y: 4 } },
  { label: '例题6: 垂直直线 (斜率不存在) (3, -2) 与 (3, 5)', p1: { x: 3, y: -2 }, p2: { x: 3, y: 5 } }
];

export default function App() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  // Input points
  const [p1, setP1] = useState<Point>({ x: 1, y: 2 });
  const [p2, setP2] = useState<Point>({ x: 4, y: 8 });

  // Additional evaluator tool state
  const [evalX, setEvalX] = useState<string>('5');
  const [evalY, setEvalY] = useState<string>('10');

  // UI status
  const [copiedEq, setCopiedEq] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'guide' | 'faq'>('calculator');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Compute result reactively
  const result: CalculationResult = useMemo(() => {
    return calculateFromTwoPoints(p1, p2);
  }, [p1, p2]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEq(true);
    setTimeout(() => setCopiedEq(false), 2000);
  };

  // Swap Points
  const handleSwap = () => {
    const temp = { ...p1 };
    setP1({ ...p2 });
    setP2(temp);
  };

  // Random generate integer coordinates (-8 to 8)
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

  // Point Evaluator values
  const evaluatedY = useMemo(() => {
    const xNum = parseFloat(evalX);
    if (isNaN(xNum) || !result.isValid) return 'N/A';
    if (result.specialType === 'vertical') {
      return xNum === result.p1.x ? '任意实数 (Any real number)' : '无对应点 (No point)';
    }
    if (result.k !== undefined && result.b !== undefined) {
      const yVal = result.k * xNum + result.b;
      return formatNum(yVal);
    }
    return 'N/A';
  }, [evalX, result]);

  const evaluatedX = useMemo(() => {
    const yNum = parseFloat(evalY);
    if (isNaN(yNum) || !result.isValid) return 'N/A';
    if (result.specialType === 'vertical') {
      return formatNum(result.p1.x);
    }
    if (result.specialType === 'horizontal') {
      return yNum === result.p1.y ? '任意实数 (Any real number)' : '无对应点 (No point)';
    }
    if (result.k !== undefined && result.b !== undefined && Math.abs(result.k) > 1e-9) {
      const xVal = (yNum - result.b) / result.k;
      return formatNum(xVal);
    }
    return 'N/A';
  }, [evalY, result]);

  const t = {
    zh: {
      siteTitle: '一次函数解析式生成器',
      subTitle: '两点求直线方程 · 秒出斜率k与截距b · 交互式动态函数图像',
      navCalc: '在线计算器与图像',
      navGuide: '公式与解题知识库',
      navFaq: '常见问题与中考重点',
      twoPointHeader: '输入两个坐标点 (x₁, y₁) 与 (x₂, y₂)',
      twoPointDesc: '即时响应计算，支持整数、小数与分数，拖拽画布动点亦可实时同步。',
      pointA: '坐标点 A',
      pointB: '坐标点 B',
      swapBtn: '交换 A / B',
      randomBtn: '随机生成点',
      presetLabel: '经典试题预设：',
      resultHeader: '一次函数计算结果',
      mainEquation: '函数解析式 (斜截式 y = kx + b)',
      copySuccess: '已复制解析式！',
      copyBtn: '复制解析式',
      slopeK: '斜率 k (Slope)',
      interceptB: 'y轴截距 b (Y-Intercept)',
      xIntercept: '与 x 轴交点',
      yIntercept: '与 y 轴交点',
      standardEq: '一般式方程 (Standard Form)',
      pointSlopeEq: '点斜式方程',
      distanceAB: '两点间距离 (Distance)',
      midpointAB: '中点坐标 M',
      angleAlpha: '倾斜角 α (Inclination)',
      triangleArea: '与坐标轴围成直角三角形面积',
      monotonicity: '增减性与函数性质',
      quadrants: '所经过的象限',
      stepsTitle: '待定系数法与斜率公式 · 详细解题推导步骤',
      evaluatorTitle: '一次函数快速求值器',
      evalXPrompt: '输入横坐标 x，计算纵坐标 y：',
      evalYPrompt: '输入纵坐标 y，计算横坐标 x：',
      graphTitle: '高保真直角坐标系 · 动态交互式图像',
      graphTip: '提示：可直接拖拽点 A 和点 B，或滚轮缩放、平移原点。',
      quadrantGuide: '象限规律总结',
      footerText: '一次函数解析式生成器 · 专业数学教育工具与两点求方程计算器'
    },
    en: {
      siteTitle: 'Linear Function & Equation Generator',
      subTitle: 'Line Equation from Two Points · Slope (m/k) & Intercept (b) · Interactive Graph',
      navCalc: 'Calculator & Graph',
      navGuide: 'Formula & Method Guide',
      navFaq: 'FAQ & Key Properties',
      twoPointHeader: 'Enter Two Points (x₁, y₁) and (x₂, y₂)',
      twoPointDesc: 'Calculates in real time. Supports integers, decimals, fractions and interactive dragging.',
      pointA: 'Point A',
      pointB: 'Point B',
      swapBtn: 'Swap A & B',
      randomBtn: 'Random Points',
      presetLabel: 'Example Presets:',
      resultHeader: 'Calculation Results',
      mainEquation: 'Slope-Intercept Form (y = mx + b / y = kx + b)',
      copySuccess: 'Copied Equation!',
      copyBtn: 'Copy Equation',
      slopeK: 'Slope k / m',
      interceptB: 'Y-Intercept b',
      xIntercept: 'X-Intercept Point',
      yIntercept: 'Y-Intercept Point',
      standardEq: 'Standard Form (Ax + By + C = 0)',
      pointSlopeEq: 'Point-Slope Form',
      distanceAB: 'Distance between Points',
      midpointAB: 'Midpoint M',
      angleAlpha: 'Angle of Inclination α',
      triangleArea: 'Triangle Area with Axes',
      monotonicity: 'Monotonicity & Behavior',
      quadrants: 'Quadrants Passed Through',
      stepsTitle: 'Step-by-Step Mathematical Derivation',
      evaluatorTitle: 'Quick Function Point Evaluator',
      evalXPrompt: 'Given x, calculate corresponding y:',
      evalYPrompt: 'Given y, calculate corresponding x:',
      graphTitle: 'Interactive Cartesian Coordinate Graph',
      graphTip: 'Tip: Click and drag Point A and B directly, or use controls to zoom.',
      quadrantGuide: 'Quadrant & Slope Rules',
      footerText: 'Linear Function Calculator · Slope-Intercept Form from Two Points'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  {t.siteTitle}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  y = kx + b
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                {t.subTitle}
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nav Tabs */}
            <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-medium">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.navCalc}
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-lg transition-all hidden sm:block ${
                  activeTab === 'guide'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.navGuide}
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'faq'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.navFaq}
              </button>
            </nav>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="切换中英文 (Toggle Language)"
            >
              <Globe className="h-3.5 w-3.5 text-indigo-400" />
              <span>{lang === 'zh' ? 'EN' : '中文'}</span>
            </button>

            {/* GitHub Repo Link */}
            <a
              href="https://github.com/laohu90/linear-function-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* SEO Breadcrumbs & Heading Banner */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 sm:p-7 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Google SEO 优化 · 包含两点求解析式、斜率、截距与交点计算</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {lang === 'zh' ? '一次函数解析式生成器 (y = kx + b)' : 'Linear Function & Line Equation Generator'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {lang === 'zh'
                  ? '两点求直线方程、求一次函数解析式、求斜率k与截距b、求与坐标轴交点。支持分数/小数双精度呈现、详细步骤推导、函数求值与交互式直角坐标系绘制。'
                  : 'Calculate line equations from two coordinates instantly. Outputs slope-intercept form (y = mx + b), standard form, slope, intercepts, step-by-step math derivation, and interactive graph.'}
              </p>
            </div>

            {/* Presets Selector */}
            <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                {t.presetLabel}
              </span>
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (!isNaN(idx) && PRESET_EXAMPLES[idx]) {
                    setP1({ ...PRESET_EXAMPLES[idx].p1 });
                    setP2({ ...PRESET_EXAMPLES[idx].p2 });
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-xs text-indigo-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                {PRESET_EXAMPLES.map((ex, i) => (
                  <option key={i} value={i}>
                    {ex.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab 1: Calculator & Graph */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            {/* Top Grid: Two Point Inputs + Primary Equation Highlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Coordinate Inputs */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Compass className="h-4 w-4 text-indigo-400" />
                      {t.twoPointHeader}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSwap}
                        title={t.swapBtn}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={handleRandom}
                        title={t.randomBtn}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-6">
                    {t.twoPointDesc}
                  </p>

                  {/* Point A Inputs */}
                  <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-blue-900/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        {t.pointA} (x₁, y₁)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        A({p1.x}, {p1.y})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                          x₁ (横坐标)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={p1.x}
                          onChange={(e) => setP1({ ...p1, x: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                          y₁ (纵坐标)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={p1.y}
                          onChange={(e) => setP1({ ...p1, y: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Point B Inputs */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-pink-900/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-pink-500" />
                        {t.pointB} (x₂, y₂)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        B({p2.x}, {p2.y})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                          x₂ (横坐标)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={p2.x}
                          onChange={(e) => setP2({ ...p2, x: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                          y₂ (纵坐标)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={p2.y}
                          onChange={(e) => setP2({ ...p2, y: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>支持键盘输入与负数</span>
                  <button
                    onClick={() => {
                      setP1({ x: 0, y: 0 });
                      setP2({ x: 1, y: 1 });
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    重置为基准点
                  </button>
                </div>
              </div>

              {/* Right Column (7 cols): Instant Results Highlight Card */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      {t.resultHeader}
                    </h3>
                    <button
                      onClick={() => handleCopy(result.slopeInterceptEq)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/40 transition-colors"
                    >
                      {copiedEq ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedEq ? t.copySuccess : t.copyBtn}</span>
                    </button>
                  </div>

                  {/* Big Equation Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-indigo-500/30 mb-6 text-center sm:text-left">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                      {t.mainEquation}
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-wide py-1 text-emerald-400">
                      {result.slopeInterceptEq}
                    </div>
                    {result.specialType === 'general' && (
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        一般式方程: {result.generalEq}
                      </p>
                    )}
                  </div>

                  {/* 4 Core Parameter Cards (Slope, Y-Int, X-Int, Standard Form) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {/* Slope k */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium mb-1">
                        {t.slopeK}
                      </div>
                      <div className="text-lg font-bold text-indigo-300 font-mono">
                        {result.hasSlope ? result.kText : '不存在 (Undefined)'}
                      </div>
                      {result.k !== undefined && !result.kFraction?.isInteger && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          ≈ {result.k.toFixed(4)}
                        </div>
                      )}
                    </div>

                    {/* Intercept b */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium mb-1">
                        {t.interceptB}
                      </div>
                      <div className="text-lg font-bold text-amber-300 font-mono">
                        {result.hasYIntercept ? result.bText : '无 (None)'}
                      </div>
                      {result.b !== undefined && !result.bFraction?.isInteger && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          ≈ {result.b.toFixed(4)}
                        </div>
                      )}
                    </div>

                    {/* X-Intercept */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium mb-1">
                        {t.xIntercept}
                      </div>
                      <div className="text-sm font-bold text-emerald-300 font-mono">
                        {result.xInterceptPoint
                          ? `(${result.xInterceptText}, 0)`
                          : result.xInterceptText || '无'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">令 y = 0</div>
                    </div>

                    {/* Y-Intercept */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium mb-1">
                        {t.yIntercept}
                      </div>
                      <div className="text-sm font-bold text-amber-300 font-mono">
                        {result.yInterceptPoint
                          ? `(0, ${result.bText})`
                          : result.bText || '无'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">令 x = 0</div>
                    </div>
                  </div>

                  {/* Additional Geometry & Physics info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">{t.distanceAB}</span>
                      <span className="font-mono font-bold text-slate-200">{result.distanceExactText}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">{t.midpointAB}</span>
                      <span className="font-mono font-bold text-slate-200">
                        M({formatNum(result.midpoint.x)}, {formatNum(result.midpoint.y)})
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">{t.angleAlpha}</span>
                      <span className="font-mono font-bold text-slate-200">
                        {result.inclinationAngleDeg.toFixed(2)}°
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">{t.monotonicity}</span>
                      <span className="font-semibold text-indigo-300">
                        {result.monotonicity === 'increasing'
                          ? '随 x 增大而增大 (k > 0)'
                          : result.monotonicity === 'decreasing'
                          ? '随 x 增大而减小 (k < 0)'
                          : result.monotonicity === 'constant'
                          ? '常数函数 (水平线)'
                          : '垂直线'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">{t.quadrants}</span>
                      <span className="font-semibold text-emerald-400">
                        {result.quadrants.length > 0
                          ? `第 ${result.quadrants.join('、')} 象限`
                          : '过原点或轴'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">{t.triangleArea}</span>
                      <span className="font-mono font-bold text-amber-300">
                        {result.triangleAreaWithAxes
                          ? formatNum(result.triangleAreaWithAxes)
                          : '无 (过原点或平行)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>点斜式：{result.pointSlopeEq}</span>
                  {result.perpendicularSlope && (
                    <span>垂直线斜率 k⊥ = {result.perpendicularSlope.text}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Coordinate Canvas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-400" />
                    {t.graphTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.graphTip}
                  </p>
                </div>
              </div>

              <CoordinatePlane
                result={result}
                onPointChange={(newP1, newP2) => {
                  setP1(newP1);
                  setP2(newP2);
                }}
                lang={lang}
              />
            </div>

            {/* Detailed Mathematical Steps (待定系数法 & 斜率公式法) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">
                  {t.stepsTitle}
                </h3>
              </div>

              <div className="space-y-2 bg-slate-950 p-5 rounded-xl border border-slate-800/80 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
                {(lang === 'zh' ? result.stepsZh : result.stepsEn).map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.startsWith('【') || line.startsWith('[')
                        ? 'text-indigo-400 font-bold pt-2'
                        : line.includes('👉')
                        ? 'text-emerald-400 font-bold text-base py-1'
                        : ''
                    }
                  >
                    {line || <div className="h-2" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Evaluator Tool (快速求值) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Sliders className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">
                  {t.evaluatorTitle}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Given x => calculate y */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {t.evalXPrompt}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs font-mono text-slate-400">x =</span>
                      <input
                        type="number"
                        step="any"
                        value={evalX}
                        onChange={(e) => setEvalX(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <span className="text-slate-500">➔</span>
                    <div className="flex items-center gap-1.5 flex-1 bg-indigo-950/40 border border-indigo-800/40 px-3 py-1.5 rounded-lg">
                      <span className="text-xs font-mono text-indigo-400">y =</span>
                      <span className="text-sm font-mono font-bold text-indigo-200">
                        {evaluatedY}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Given y => calculate x */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {t.evalYPrompt}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs font-mono text-slate-400">y =</span>
                      <input
                        type="number"
                        step="any"
                        value={evalY}
                        onChange={(e) => setEvalY(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <span className="text-slate-500">➔</span>
                    <div className="flex items-center gap-1.5 flex-1 bg-purple-950/40 border border-purple-800/40 px-3 py-1.5 rounded-lg">
                      <span className="text-xs font-mono text-purple-400">x =</span>
                      <span className="text-sm font-mono font-bold text-purple-200">
                        {evaluatedX}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Formula & Guide (SEO & Educational Knowledge Base) */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <article className="prose prose-invert max-w-none bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">
                一次函数解析式 (y = kx + b) 完整知识图谱与考点总结
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-base font-bold text-indigo-400 mb-2">
                    1. 什么是一次函数？
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    一般地，形如 <strong>y = kx + b</strong>（k, b 是常数，且 <strong>k ≠ 0</strong>）的函数，叫做一次函数（Linear Function）。
                    当常数项 <strong>b = 0</strong> 时，y = kx 叫做<strong>正比例函数</strong>，它是特殊的一次函数，图像必然经过原点 (0, 0)。
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-base font-bold text-emerald-400 mb-2">
                    2. 斜率 k 与截距 b 的几何意义
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><strong>斜率 k (Slope)：</strong> 表示直线的倾斜程度，k = Δy / Δx = tan(α)。k &gt; 0 时，y 随 x 的增大而增大；k &lt; 0 时，y 随 x 的增大而减小。</li>
                    <li><strong>截距 b (Y-Intercept)：</strong> 直线与 y 轴交点的纵坐标 (0, b)，代表直线在 y 轴上的截距。</li>
                  </ul>
                </div>
              </div>

              {/* Quadrant Table */}
              <div className="not-prose mt-6">
                <h4 className="text-base font-bold text-white mb-3">
                  3. 一次函数图像与象限分布规律表 (中考必考)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-800">参数条件</th>
                        <th className="px-4 py-3 border-b border-slate-800">经过象限</th>
                        <th className="px-4 py-3 border-b border-slate-800">函数单调增减性</th>
                        <th className="px-4 py-3 border-b border-slate-800">草图走向</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                      <tr>
                        <td className="px-4 py-3 font-bold text-indigo-400">k &gt; 0, b &gt; 0</td>
                        <td className="px-4 py-3 text-emerald-400">第一、二、三象限</td>
                        <td className="px-4 py-3">y 随 x 的增大而增大</td>
                        <td className="px-4 py-3">左低右高，交 y 轴于上半轴</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-indigo-400">k &gt; 0, b &lt; 0</td>
                        <td className="px-4 py-3 text-emerald-400">第一、三、四象限</td>
                        <td className="px-4 py-3">y 随 x 的增大而增大</td>
                        <td className="px-4 py-3">左低右高，交 y 轴于下半轴</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-indigo-400">k &lt; 0, b &gt; 0</td>
                        <td className="px-4 py-3 text-emerald-400">第一、二、四象限</td>
                        <td className="px-4 py-3">y 随 x 的增大而减小</td>
                        <td className="px-4 py-3">左高右低，交 y 轴于上半轴</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-indigo-400">k &lt; 0, b &lt; 0</td>
                        <td className="px-4 py-3 text-emerald-400">第二、三、四象限</td>
                        <td className="px-4 py-3">y 随 x 的增大而减小</td>
                        <td className="px-4 py-3">左高右低，交 y 轴于下半轴</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Two Points Method */}
              <div className="not-prose mt-6 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-base font-bold text-purple-400">
                  4. 两点确定一条直线的通用解题方法（待定系数法四步法）
                </h4>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li><strong>一设：</strong> 设所求的一次函数解析式为 y = kx + b (k ≠ 0)；</li>
                  <li><strong>二列：</strong> 将已知的两个坐标点 (x₁, y₁) 和 (x₂, y₂) 代入解析式，列出关于 k 和 b 的二元一次方程组；</li>
                  <li><strong>三解：</strong> 解这个方程组，求出参数 k 和 b 的值；</li>
                  <li><strong>四写：</strong> 将求得的 k 和 b 代入 y = kx + b，写出最终的一次函数解析式。</li>
                </ol>
              </div>
            </article>
          </div>
        )}

        {/* Tab 3: FAQ (Google Rich Snippets / Schema.org) */}
        {activeTab === 'faq' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white">一次函数常见问题与解答 (FAQ)</h3>
              <p className="text-xs text-slate-400 mt-1">针对常见疑惑与易错概念提供清晰解答</p>
            </div>

            {[
              {
                q: '两点求一次函数解析式，两点横坐标相同 (x₁ = x₂) 时怎么算？',
                a: '当两点的横坐标相同时（例如 (2, 3) 和 (2, 7)），两点连线垂直于 x 轴（平行于 y 轴）。根据斜率定义 k = (y₂ - y₁) / (x₂ - x₁)，分母为 0，因此斜率不存在。该直线的方程为垂直直线方程 x = x₁。严格在函数定义中，它不满足“每个输入 x 对应唯一输出 y”的函数定义，但它是平面解析几何中的标准垂直直线方程。'
              },
              {
                q: '两点纵坐标相同 (y₁ = y₂) 时是一次函数吗？',
                a: '当纵坐标相同（例如 (-1, 4) 和 (5, 4)）时，斜率 k = 0，此时方程为 y = y₁（例如 y = 4）。在初中阶段，通常称其为常数函数（水平线），它不含一次项 x；在平面解析几何中，它是斜率为 0、平行于 x 轴的水平直线。'
              },
              {
                q: '如何快速计算直线与两坐标轴围成的直角三角形面积？',
                a: '设直线与 x 轴交点为 (x₀, 0)，与 y 轴交点为 (0, y₀)。因为两坐标轴互相垂直，与坐标轴围成的三角形为直角三角形，两直角边长分别为 |x₀| 和 |y₀|。因此三角形面积公式为：S = 1/2 × |x₀| × |y₀| = 1/2 × |-b/k| × |b| = b² / (2|k|)。'
              },
              {
                q: '两条直线平行和垂直的充要条件是什么？',
                a: '设直线 L₁: y = k₁x + b₁，L₂: y = k₂x + b₂。若 L₁ 与 L₂ 平行，则 k₁ = k₂ 且 b₁ ≠ b₂；若 L₁ 与 L₂ 互相垂直，则它们的斜率乘积为 -1，即 k₁ × k₂ = -1（即垂直斜率为原斜率的负倒数 k₂ = -1/k₁）。'
              },
              {
                q: '什么是截距？截距可以为负数或0吗？',
                a: '是的！在数学中，“截距”不是距离，而是一个代数值（坐标值）。直线交 y 轴于点 (0, b)，则 b 为纵截距；交 x 轴于点 (a, 0)，则 a 为横截距。截距可正、可负、也可为 0（过原点时截距为 0）。'
              }
            ].map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="font-semibold text-sm sm:text-base text-slate-200 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Calculator className="h-4 w-4 text-indigo-400" />
              <span className="font-bold text-slate-300">一次函数解析式生成器</span>
              <span>· {t.footerText}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <a
                href="https://github.com/laohu90/linear-function-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-400 transition-colors flex items-center gap-1"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
              </a>
              <span className="text-slate-700">|</span>
              <span>y = kx + b</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-900">
            <span>热门搜索词 (SEO Keywords):</span>
            <span className="text-slate-500">一次函数解析式生成器</span>
            <span className="text-slate-500">一次函数计算器</span>
            <span className="text-slate-500">求一次函数解析式</span>
            <span className="text-slate-500">两点求直线方程</span>
            <span className="text-slate-500">y = kx + b</span>
            <span className="text-slate-500">Linear Function Calculator</span>
            <span className="text-slate-500">Slope-Intercept Form Calculator</span>
            <span className="text-slate-500">Line Equation from Two Points</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Fraction {
  numerator: number;
  denominator: number;
  isInteger: boolean;
  value: number;
  text: string;
  latex: string;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Converts a floating point number to a simplified Fraction
 * Uses continued fractions approximation for high precision
 */
export function toFraction(val: number, tolerance = 1e-6): Fraction {
  if (isNaN(val) || !isFinite(val)) {
    return {
      numerator: 0,
      denominator: 1,
      isInteger: true,
      value: val,
      text: 'undefined',
      latex: '\\text{undefined}'
    };
  }

  // Exact integer check
  if (Math.abs(val - Math.round(val)) < tolerance) {
    const n = Math.round(val);
    return {
      numerator: n,
      denominator: 1,
      isInteger: true,
      value: n,
      text: `${n}`,
      latex: `${n}`
    };
  }

  const sign = val < 0 ? -1 : 1;
  val = Math.abs(val);

  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = val;

  for (let i = 0; i < 20; i++) {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;

    if (k1 > 10000) break;
    const fracVal = h1 / k1;
    if (Math.abs(val - fracVal) <= tolerance * val || Math.abs(val - fracVal) < 1e-7) {
      break;
    }
    const diff = b - a;
    if (diff < 1e-7) break;
    b = 1 / diff;
  }

  const num = sign * h1;
  const den = k1;
  const common = gcd(num, den);
  const finalNum = num / common;
  const finalDen = den / common;

  if (finalDen === 1) {
    return {
      numerator: finalNum,
      denominator: 1,
      isInteger: true,
      value: finalNum,
      text: `${finalNum}`,
      latex: `${finalNum}`
    };
  }

  return {
    numerator: finalNum,
    denominator: finalDen,
    isInteger: false,
    value: finalNum / finalDen,
    text: `${finalNum}/${finalDen}`,
    latex: `\\frac{${finalNum}}{${finalDen}}`
  };
}

export function formatNum(n: number, decimals = 4): string {
  if (Math.abs(n - Math.round(n)) < 1e-6) {
    return Math.round(n).toString();
  }
  const str = n.toFixed(decimals);
  return str.replace(/\.?0+$/, '');
}

export interface Point {
  x: number;
  y: number;
  label?: string;
}

export type LineSpecialType = 'general' | 'horizontal' | 'vertical' | 'direct-proportion' | 'degenerate';

export interface CalculationResult {
  p1: Point;
  p2: Point;
  specialType: LineSpecialType;
  isValid: boolean;
  errorMessage?: string;

  // Slope k
  hasSlope: boolean;
  k?: number;
  kFraction?: Fraction;
  kText?: string;

  // Intercept b
  hasYIntercept: boolean;
  b?: number;
  bFraction?: Fraction;
  bText: string;
  yInterceptPoint?: Point;

  // X Intercept
  hasXIntercept: boolean;
  xIntercept?: number;
  xInterceptFraction?: Fraction;
  xInterceptText: string;
  xInterceptPoint?: Point;

  // Formatted Equations
  slopeInterceptEq: string;
  slopeInterceptEqLatex: string;
  generalEq: string; // Ax + By + C = 0
  pointSlopeEq: string; // y - y1 = k(x - x1)
  twoInterceptEq?: string; // x/a + y/b = 1

  // Additional Geometry
  distance: number;
  distanceExactText: string;
  midpoint: Point;
  inclinationAngleDeg: number;
  inclinationAngleRad: number;
  perpendicularSlope?: Fraction;
  triangleAreaWithAxes?: number;

  // Parallel & Perpendicular through Midpoint M
  parallelThroughOrigin?: string;
  perpendicularThroughMidpoint?: string;

  // Properties
  monotonicity: 'increasing' | 'decreasing' | 'constant' | 'none';
  quadrants: number[];

  // Bilingual steps
  stepsZh: string[];
  stepsEn: string[];
}

/**
 * Solves standard form Ax + By + C = 0 with lowest integer terms, A >= 0
 */
export function computeStandardForm(p1: Point, p2: Point): { a: number; b: number; c: number; eq: string } {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  let A = dy;
  let B = -dx;
  let C = dx * p1.y - dy * p1.x;

  const fA = toFraction(A);
  const fB = toFraction(B);
  const fC = toFraction(C);

  const lcmDen = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);
  const commonDen = lcmDen(fA.denominator, lcmDen(fB.denominator, fC.denominator));

  A = Math.round(A * commonDen);
  B = Math.round(B * commonDen);
  C = Math.round(C * commonDen);

  let g = gcd(A, gcd(B, C));
  if (g !== 0) {
    A = A / g;
    B = B / g;
    C = C / g;
  }

  if (A < 0 || (A === 0 && B < 0)) {
    A = -A;
    B = -B;
    C = -C;
  }

  let parts: string[] = [];
  if (A !== 0) {
    parts.push(A === 1 ? 'x' : A === -1 ? '-x' : `${A}x`);
  }
  if (B !== 0) {
    const sign = B > 0 ? (parts.length > 0 ? '+ ' : '') : '- ';
    const absB = Math.abs(B);
    parts.push(`${sign}${absB === 1 ? 'y' : `${absB}y`}`);
  }
  if (C !== 0) {
    const sign = C > 0 ? '+ ' : '- ';
    parts.push(`${sign}${Math.abs(C)}`);
  }

  const eq = parts.length > 0 ? `${parts.join(' ')} = 0` : '0 = 0';
  return { a: A, b: B, c: C, eq };
}

/**
 * Formats y = kx + b cleanly
 */
export function formatSlopeIntercept(kFrac: Fraction, bFrac: Fraction): { plain: string; latex: string } {
  let kStr = '';
  let kLatex = '';
  if (kFrac.value === 1) {
    kStr = 'x';
    kLatex = 'x';
  } else if (kFrac.value === -1) {
    kStr = '-x';
    kLatex = '-x';
  } else if (kFrac.value === 0) {
    kStr = '';
    kLatex = '';
  } else {
    kStr = `${kFrac.text}x`;
    kLatex = `${kFrac.latex}x`;
  }

  let bStr = '';
  let bLatex = '';
  if (bFrac.value !== 0) {
    if (kFrac.value === 0) {
      bStr = bFrac.text;
      bLatex = bFrac.latex;
    } else {
      if (bFrac.value > 0) {
        bStr = ` + ${bFrac.text}`;
        bLatex = ` + ${bFrac.latex}`;
      } else {
        const absB = toFraction(Math.abs(bFrac.value));
        bStr = ` - ${absB.text}`;
        bLatex = ` - ${absB.latex}`;
      }
    }
  } else {
    if (kFrac.value === 0) {
      bStr = '0';
      bLatex = '0';
    }
  }

  const plain = `y = ${kStr}${bStr}`.trim();
  const latex = `y = ${kLatex}${bLatex}`.trim();
  return { plain, latex };
}

/**
 * Calculates all mathematical properties from two points A(x1, y1) and B(x2, y2)
 */
export function calculateFromTwoPoints(p1: Point, p2: Point, lang: 'zh' | 'en' = 'zh'): CalculationResult {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Case 1: Degenerate (Two identical points)
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) {
    return {
      p1,
      p2,
      specialType: 'degenerate',
      isValid: false,
      errorMessage: lang === 'zh'
        ? '两点坐标完全重合，过单点有无穷多条直线，无法确定唯一直线。请修改其中一个点的坐标。'
        : 'Point A and Point B are identical; infinite lines pass through a single point. Please modify one coordinate.',
      hasSlope: false,
      hasYIntercept: false,
      hasXIntercept: false,
      bText: lang === 'zh' ? '无' : 'None',
      xInterceptText: lang === 'zh' ? '无' : 'None',
      slopeInterceptEq: lang === 'zh' ? '两点重合，解析式无法确定' : 'Identical points, line undefined',
      slopeInterceptEqLatex: '\\text{Undefined}',
      generalEq: 'N/A',
      pointSlopeEq: 'N/A',
      distance: 0,
      distanceExactText: '0',
      midpoint: p1,
      inclinationAngleDeg: 0,
      inclinationAngleRad: 0,
      monotonicity: 'none',
      quadrants: [],
      stepsZh: [
        '【提示：两点坐标重合】',
        `  点 A(${p1.x}, ${p1.y}) 与 点 B(${p2.x}, ${p2.y}) 坐标完全相同。`,
        '  由公理可知：过两点确定一条直线；而过单点存在无穷多条直线。',
        '  请调整任意一点坐标以开始计算。'
      ],
      stepsEn: [
        '[Notice: Points Coincide]',
        `  Point A(${p1.x}, ${p1.y}) and Point B(${p2.x}, ${p2.y}) are identical.`,
        '  Two distinct points determine a unique line; an infinite number of lines pass through a single point.',
        '  Please adjust one of the points to begin.'
      ]
    };
  }

  // Distance & Midpoint
  const distSquared = dx * dx + dy * dy;
  const distance = Math.sqrt(distSquared);
  const distanceExact = Math.abs(distance - Math.round(distance)) < 1e-6
    ? Math.round(distance).toString()
    : `√${formatNum(distSquared)} ≈ ${distance.toFixed(3)}`;

  const midpoint: Point = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    label: 'M'
  };

  const std = computeStandardForm(p1, p2);

  // Case 2: Vertical Line (x1 === x2, dx === 0)
  if (Math.abs(dx) < 1e-9) {
    const xVal = p1.x;
    const xFrac = toFraction(xVal);
    const xInterceptPt: Point = { x: xVal, y: 0, label: 'X' };
    const hasYInt = Math.abs(xVal) < 1e-9;
    const yIntPt: Point | undefined = hasYInt ? { x: 0, y: 0, label: 'Y' } : undefined;

    const bText = hasYInt
      ? (lang === 'zh' ? '0 (与 Y 轴重合)' : '0 (Coincides with Y-Axis)')
      : (lang === 'zh' ? '无交点 (平行于 Y 轴)' : 'None (Parallel to Y-Axis)');

    const eqText = lang === 'zh'
      ? `x = ${xFrac.text} (垂直直线，斜率不存在)`
      : `x = ${xFrac.text} (Vertical line, slope undefined)`;

    return {
      p1,
      p2,
      specialType: 'vertical',
      isValid: true,
      hasSlope: false,
      hasYIntercept: hasYInt,
      b: hasYInt ? 0 : undefined,
      bText,
      yInterceptPoint: yIntPt,
      hasXIntercept: true,
      xIntercept: xVal,
      xInterceptFraction: xFrac,
      xInterceptText: xFrac.text,
      xInterceptPoint: xInterceptPt,
      slopeInterceptEq: eqText,
      slopeInterceptEqLatex: `x = ${xFrac.latex}`,
      generalEq: std.eq,
      pointSlopeEq: `x = ${xFrac.text}`,
      distance,
      distanceExactText: distanceExact,
      midpoint,
      inclinationAngleDeg: 90,
      inclinationAngleRad: Math.PI / 2,
      monotonicity: 'none',
      quadrants: xVal > 0 ? [1, 4] : xVal < 0 ? [2, 3] : [1, 2, 3, 4],
      perpendicularThroughMidpoint: `y = ${formatNum(midpoint.y)} (水平垂直平分线)`,
      stepsZh: [
        `【步骤一：观察坐标特征】`,
        `  x₁ = ${p1.x}，x₂ = ${p2.x}，两点横坐标相等 (x₁ = x₂)。`,
        `  此时分母 Δx = x₂ - x₁ = 0，斜率 k 不存在（倾斜角 α = 90°）。`,
        ``,
        `【步骤二：确定直线方程】`,
        `  直线垂直于 x 轴（平行于 y 轴），直线上所有点的横坐标均为 ${xFrac.text}。`,
        `  👉 直线方程为：x = ${xFrac.text}`,
        `  一般式方程：${std.eq}`,
        ``,
        `【步骤三：求与坐标轴交点】`,
        `  与 x 轴交点为：(${xFrac.text}, 0)`,
        `  ${hasYInt ? '因为 x = 0，该直线与 y 轴完全重合。' : '因为垂直于 x 轴且 x ≠ 0，与 y 轴没有交点。'}`
      ],
      stepsEn: [
        `[Step 1: Check Coordinate Properties]`,
        `  x₁ = ${p1.x}, x₂ = ${p2.x}. The x-coordinates are identical (x₁ = x₂).`,
        `  The change in x is zero (Δx = 0), so the slope is undefined (inclination angle α = 90°).`,
        ``,
        `[Step 2: Determine Line Equation]`,
        `  The line is vertical (perpendicular to x-axis, parallel to y-axis).`,
        `  Every point on the line has an x-coordinate of ${xFrac.text}.`,
        `  👉 Equation: x = ${xFrac.text}`,
        `  Standard Form: ${std.eq}`,
        ``,
        `[Step 3: Axis Intercepts]`,
        `  X-Intercept: (${xFrac.text}, 0)`,
        `  ${hasYInt ? 'Since x = 0, the line coincides with the y-axis.' : 'The line is parallel to the y-axis, so there is no y-intercept.'}`
      ]
    };
  }

  // Slope k
  const kVal = dy / dx;
  const kFrac = toFraction(kVal);
  const kText = kFrac.text;

  // Intercept b = y1 - k * x1
  const bVal = p1.y - kVal * p1.x;
  const bFrac = toFraction(bVal);
  const bText = bFrac.text;

  const { plain: slopeInterceptEq, latex: slopeInterceptEqLatex } = formatSlopeIntercept(kFrac, bFrac);

  // Inclination angle
  let deg = (Math.atan(kVal) * 180) / Math.PI;
  if (deg < 0) deg += 180;
  const rad = (deg * Math.PI) / 180;

  const yInterceptPt: Point = { x: 0, y: bVal, label: 'Y-int' };

  // X-intercept: 0 = kx + b => x = -b/k
  let hasXInt = true;
  let xIntVal: number | undefined;
  let xIntFrac: Fraction | undefined;
  let xIntText = '';
  let xInterceptPt: Point | undefined;

  if (Math.abs(kVal) < 1e-9) {
    if (Math.abs(bVal) < 1e-9) {
      hasXInt = true;
      xIntText = lang === 'zh' ? '与 x 轴重合' : 'Coincides with X-Axis';
    } else {
      hasXInt = false;
      xIntText = lang === 'zh' ? '无交点 (平行于 x 轴)' : 'None (Parallel to X-Axis)';
    }
  } else {
    xIntVal = -bVal / kVal;
    xIntFrac = toFraction(xIntVal);
    xIntText = xIntFrac.text;
    xInterceptPt = { x: xIntVal, y: 0, label: 'X-int' };
  }

  // Triangle area with axes
  let triangleArea: number | undefined;
  if (xIntVal !== undefined && Math.abs(xIntVal) > 1e-9 && Math.abs(bVal) > 1e-9) {
    triangleArea = 0.5 * Math.abs(xIntVal) * Math.abs(bVal);
  }

  let perpFrac: Fraction | undefined;
  if (Math.abs(kVal) > 1e-9) {
    perpFrac = toFraction(-1 / kVal);
  }

  // Refined point-slope format: avoid redundant y - 0 or x - 0
  const y1Part = p1.y === 0 ? 'y' : p1.y > 0 ? `y - ${p1.y}` : `y + ${Math.abs(p1.y)}`;
  const x1Part = p1.x === 0 ? 'x' : p1.x > 0 ? `(x - ${p1.x})` : `(x + ${Math.abs(p1.x)})`;
  const pointSlopeEq = p1.x === 0 ? `${y1Part} = ${kFrac.text}x` : `${y1Part} = ${kFrac.text}${x1Part}`;

  let twoInterceptEq: string | undefined;
  if (xIntVal !== undefined && Math.abs(xIntVal) > 1e-9 && Math.abs(bVal) > 1e-9) {
    twoInterceptEq = `x / (${xIntFrac?.text}) + y / (${bFrac.text}) = 1`;
  }

  // Parallel line through Origin
  const parallelThroughOrigin = Math.abs(kVal) < 1e-9 ? 'y = 0' : `y = ${kFrac.text === '1' ? 'x' : kFrac.text === '-1' ? '-x' : `${kFrac.text}x`}`;

  // Perpendicular line through Midpoint (Perpendicular Bisector)
  let perpendicularThroughMidpoint: string | undefined;
  if (perpFrac) {
    const bPerp = midpoint.y - (-1 / kVal) * midpoint.x;
    const bPerpFrac = toFraction(bPerp);
    perpendicularThroughMidpoint = formatSlopeIntercept(perpFrac, bPerpFrac).plain;
  } else if (Math.abs(kVal) < 1e-9) {
    // Original was horizontal, perp is vertical through midpoint
    perpendicularThroughMidpoint = `x = ${formatNum(midpoint.x)}`;
  }

  let specialType: LineSpecialType = 'general';
  if (Math.abs(kVal) < 1e-9) {
    specialType = 'horizontal';
  } else if (Math.abs(bVal) < 1e-9) {
    specialType = 'direct-proportion';
  }

  let monotonicity: 'increasing' | 'decreasing' | 'constant' | 'none' = 'constant';
  if (kVal > 1e-9) monotonicity = 'increasing';
  else if (kVal < -1e-9) monotonicity = 'decreasing';

  const quads: number[] = [];
  if (specialType === 'horizontal') {
    if (bVal > 0) quads.push(1, 2);
    else if (bVal < 0) quads.push(3, 4);
    else quads.push(1, 2, 3, 4);
  } else if (specialType === 'direct-proportion') {
    if (kVal > 0) quads.push(1, 3);
    else quads.push(2, 4);
  } else {
    if (kVal > 0 && bVal > 0) quads.push(1, 2, 3);
    else if (kVal > 0 && bVal < 0) quads.push(1, 3, 4);
    else if (kVal < 0 && bVal > 0) quads.push(1, 2, 4);
    else if (kVal < 0 && bVal < 0) quads.push(2, 3, 4);
  }

  const stepsZh = [
    `【步骤一：计算直线的斜率 k】`,
    `  根据两点斜率公式：k = (y₂ - y₁) / (x₂ - x₁)`,
    `  代入两点坐标 A(${p1.x}, ${p1.y}) 与 B(${p2.x}, ${p2.y})：`,
    `  k = (${p2.y} - ${p1.y}) / (${p2.x} - ${p1.x}) = ${dy} / ${dx} = ${kFrac.text} ${kFrac.isInteger ? '' : `(≈ ${kVal.toFixed(4)})`}`,
    ``,
    `【步骤二：求 y 轴截距 b（待定系数法）】`,
    `  设一次函数解析式为：y = kx + b`,
    `  将斜率 k = ${kFrac.text} 与已知点 A(${p1.x}, ${p1.y}) 代入方程：`,
    `  ${p1.y} = (${kFrac.text}) × (${p1.x}) + b`,
    `  解得截距：b = ${p1.y} - (${kFrac.text}) × (${p1.x}) = ${bFrac.text} ${bFrac.isInteger ? '' : `(≈ ${bVal.toFixed(4)})`}`,
    ``,
    `【步骤三：得出最终一次函数解析式】`,
    `  将 k 与 b 代入 y = kx + b：`,
    `  👉 ${slopeInterceptEq}`,
    `  整理为一般式方程：${std.eq}`,
    ``,
    `【步骤四：求解与坐标轴的交点】`,
    `  1. 与 y 轴交点：令 x = 0，得 y = b = ${bFrac.text}，交点坐标为 (0, ${bFrac.text})。`,
    `  2. 与 x 轴交点：令 y = 0，得 0 = (${kFrac.text})x + (${bFrac.text})，解得 x = -b/k = ${xIntText}，交点坐标为 (${xIntText}, 0)。`
  ];

  const stepsEn = [
    `[Step 1: Calculate the Slope k (m)]`,
    `  Using two-point slope formula: m = (y₂ - y₁) / (x₂ - x₁)`,
    `  Substituting point A(${p1.x}, ${p1.y}) and point B(${p2.x}, ${p2.y}):`,
    `  m = (${p2.y} - ${p1.y}) / (${p2.x} - ${p1.x}) = ${dy} / ${dx} = ${kFrac.text} ${kFrac.isInteger ? '' : `(≈ ${kVal.toFixed(4)})`}`,
    ``,
    `[Step 2: Solve for Y-Intercept b]`,
    `  Using slope-intercept form y = mx + b with point A(${p1.x}, ${p1.y}):`,
    `  ${p1.y} = (${kFrac.text}) × (${p1.x}) + b`,
    `  Rearranging to solve for b: b = ${p1.y} - (${kFrac.text}) × (${p1.x}) = ${bFrac.text} ${bFrac.isInteger ? '' : `(≈ ${bVal.toFixed(4)})`}`,
    ``,
    `[Step 3: Write Final Line Equation]`,
    `  Substituting m and b into y = mx + b:`,
    `  👉 ${slopeInterceptEq}`,
    `  Standard Form (Ax + By + C = 0): ${std.eq}`,
    ``,
    `[Step 4: Find Axis Intercepts]`,
    `  1. Y-intercept: Set x = 0 → y = ${bFrac.text} → Point (0, ${bFrac.text})`,
    `  2. X-intercept: Set y = 0 → 0 = (${kFrac.text})x + (${bFrac.text}) → x = ${xIntText} → Point (${xIntText}, 0)`
  ];

  return {
    p1,
    p2,
    specialType,
    isValid: true,
    hasSlope: true,
    k: kVal,
    kFraction: kFrac,
    kText,
    hasYIntercept: true,
    b: bVal,
    bFraction: bFrac,
    bText,
    yInterceptPoint: yInterceptPt,
    hasXIntercept: hasXInt,
    xIntercept: xIntVal,
    xInterceptFraction: xIntFrac,
    xInterceptText: xIntText,
    xInterceptPoint: xInterceptPt,
    slopeInterceptEq,
    slopeInterceptEqLatex,
    generalEq: std.eq,
    pointSlopeEq,
    twoInterceptEq,
    distance,
    distanceExactText: distanceExact,
    midpoint,
    inclinationAngleDeg: deg,
    inclinationAngleRad: rad,
    perpendicularSlope: perpFrac,
    triangleAreaWithAxes: triangleArea,
    parallelThroughOrigin,
    perpendicularThroughMidpoint,
    monotonicity,
    quadrants: quads,
    stepsZh,
    stepsEn
  };
}

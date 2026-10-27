/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { CalculationResult, formatNum } from './linearMath';

export interface ExportPdfOptions {
  result: CalculationResult;
  precision: number;
  lang: 'zh' | 'en';
  canvasElement: HTMLCanvasElement | null;
  shareUrl: string;
}

/**
 * Generates an educational PDF worksheet by rendering a high-DPI
 * layout on an offscreen canvas and packaging it with jsPDF.
 * This guarantees perfect Chinese and mathematical symbol rendering without font-missing issues.
 */
export async function exportCalculationPDF({
  result,
  precision,
  lang,
  canvasElement,
  shareUrl
}: ExportPdfOptions): Promise<void> {
  const isZh = lang === 'zh';

  // Standard A4 dimensions at 2x crisp DPI (1600 x 2262)
  const pageWidth = 1600;
  const pageHeight = 2262;
  const offscreen = document.createElement('canvas');
  offscreen.width = pageWidth;
  offscreen.height = pageHeight;
  const ctx = offscreen.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pageWidth, pageHeight);

  // Decorative Top Accent Bar
  const grad = ctx.createLinearGradient(0, 0, pageWidth, 0);
  grad.addColorStop(0, '#4f46e5');
  grad.addColorStop(0.5, '#6366f1');
  grad.addColorStop(1, '#818cf8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, pageWidth, 18);

  let currentY = 70;
  const marginX = 80;
  const contentWidth = pageWidth - marginX * 2;

  // Header Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", -apple-system, sans-serif';
  ctx.textAlign = 'left';
  const docTitle = isZh
    ? '一次函数解析式学习与解题卡 (y = kx + b)'
    : 'Linear Function Solution & Study Sheet (y = mx + b)';
  ctx.fillText(docTitle, marginX, currentY);

  // Subtitle & Timestamp
  currentY += 36;
  ctx.fillStyle = '#64748b';
  ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
  const now = new Date();
  const dateStr = now.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  ctx.fillText(
    `${isZh ? '生成时间' : 'Generated'}: ${dateStr}   |   ${isZh ? '计算精度' : 'Precision'}: ${precision} ${isZh ? '位小数' : 'decimals'}`,
    marginX,
    currentY
  );

  // Divider
  currentY += 20;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, currentY);
  ctx.lineTo(marginX + contentWidth, currentY);
  ctx.stroke();

  // 1. Given Points Banner
  currentY += 30;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(marginX, currentY, contentWidth, 80);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(marginX, currentY, contentWidth, 80);

  // Point A Pill
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(marginX + 35, currentY + 40, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(
    `${isZh ? '已知点 A' : 'Point A'}: (${result.p1.x}, ${result.p1.y})`,
    marginX + 60,
    currentY + 48
  );

  // Point B Pill
  ctx.fillStyle = '#db2777';
  ctx.beginPath();
  ctx.arc(marginX + 420, currentY + 40, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.fillText(
    `${isZh ? '已知点 B' : 'Point B'}: (${result.p2.x}, ${result.p2.y})`,
    marginX + 445,
    currentY + 48
  );

  // Primary Equation on right side of banner
  ctx.fillStyle = '#4f46e5';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(result.slopeInterceptEq, marginX + contentWidth - 30, currentY + 48);
  ctx.textAlign = 'left';

  currentY += 105;

  // 2. Two Columns Layout: Graph Snapshot (Left 640px) & Key Formulas/Properties (Right)
  const leftColWidth = 660;
  const rightColX = marginX + leftColWidth + 30;
  const rightColWidth = contentWidth - leftColWidth - 30;
  const graphHeight = 440;

  // Draw Graph Box
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(marginX, currentY, leftColWidth, graphHeight);

  if (canvasElement) {
    try {
      ctx.drawImage(canvasElement, marginX, currentY, leftColWidth, graphHeight);
    } catch {
      // Fallback placeholder if canvas tainted
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(marginX, currentY, leftColWidth, graphHeight);
    }
  } else {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(marginX, currentY, leftColWidth, graphHeight);
  }

  // Right Column: Equations & Metric Cards
  let rY = currentY;

  // Box: Primary Line Equations
  ctx.fillStyle = '#eef2ff';
  ctx.fillRect(rightColX, rY, rightColWidth, 140);
  ctx.strokeStyle = '#c7d2fe';
  ctx.strokeRect(rightColX, rY, rightColWidth, 140);

  ctx.fillStyle = '#3730a3';
  ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(isZh ? '【直线方程总结】' : '[Line Equations]', rightColX + 20, rY + 30);

  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`${isZh ? '斜截式' : 'Slope-Int'}: ${result.slopeInterceptEq}`, rightColX + 20, rY + 65);

  ctx.font = '17px monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText(`${isZh ? '一般式' : 'Standard'}: ${result.generalEq}`, rightColX + 20, rY + 95);
  ctx.fillText(`${isZh ? '点斜式' : 'Point-Slope'}: ${result.pointSlopeEq}`, rightColX + 20, rY + 123);

  rY += 155;

  // Metric grid in right column
  const metricBoxHeight = 270;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(rightColX, rY, rightColWidth, metricBoxHeight);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(rightColX, rY, rightColWidth, metricBoxHeight);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(isZh ? '【几何与代数核心参数】' : '[Key Mathematical Properties]', rightColX + 20, rY + 30);

  const metrics = [
    { label: isZh ? '斜率 k (m)' : 'Slope k', val: result.hasSlope ? `${result.kText} (≈ ${result.k?.toFixed(precision)})` : (isZh ? '不存在' : 'Undefined') },
    { label: isZh ? 'y 轴截距 b' : 'Y-Intercept b', val: result.hasYIntercept ? `${result.bText} (≈ ${result.b?.toFixed(precision)})` : (isZh ? '无' : 'None') },
    { label: isZh ? 'x 轴交点' : 'X-Intercept', val: result.xInterceptPoint ? `(${result.xInterceptText}, 0)` : (isZh ? '无' : 'None') },
    { label: isZh ? 'y 轴交点' : 'Y-Intercept Pt', val: result.yInterceptPoint ? `(0, ${result.bText})` : (isZh ? '无' : 'None') },
    { label: isZh ? '倾斜角 α' : 'Inclination Angle', val: `${result.inclinationAngleDeg.toFixed(1)}°` },
    { label: isZh ? '两点间距离 d' : 'Distance d', val: result.distanceExactText },
    { label: isZh ? '线段中点 M' : 'Midpoint M', val: `(${formatNum(result.midpoint.x, precision)}, ${formatNum(result.midpoint.y, precision)})` },
    { label: isZh ? '两轴围成面积 S' : 'Triangle Area', val: result.triangleAreaWithAxes ? formatNum(result.triangleAreaWithAxes, precision) : (isZh ? '无' : 'None') }
  ];

  let mY = rY + 60;
  for (let i = 0; i < metrics.length; i += 2) {
    const m1 = metrics[i];
    const m2 = metrics[i + 1];

    ctx.fillStyle = '#64748b';
    ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(m1.label + ':', rightColX + 20, mY);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(m1.val, rightColX + 140, mY);

    if (m2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(m2.label + ':', rightColX + 380, mY);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(m2.val, rightColX + 500, mY);
    }

    mY += 45;
  }

  currentY += graphHeight + 35;

  // 3. Step-by-Step Derivation Section
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(
    isZh ? '三、待定系数法与解题步骤演算记录' : 'Step-by-Step Mathematical Derivation',
    marginX,
    currentY
  );

  currentY += 15;
  const steps = isZh ? result.stepsZh : result.stepsEn;
  const stepsBoxHeight = 620;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(marginX, currentY, contentWidth, stepsBoxHeight);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(marginX, currentY, contentWidth, stepsBoxHeight);

  let stepY = currentY + 36;
  ctx.font = '16px "PingFang SC", "Microsoft YaHei", monospace';

  for (const line of steps) {
    if (stepY > currentY + stepsBoxHeight - 25) break;

    if (line.startsWith('【') || line.startsWith('[')) {
      ctx.fillStyle = '#312e81';
      ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(line, marginX + 25, stepY);
      stepY += 28;
      ctx.font = '16px "PingFang SC", "Microsoft YaHei", monospace';
    } else if (line.includes('👉')) {
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", monospace';
      ctx.fillText(line, marginX + 25, stepY);
      stepY += 28;
      ctx.font = '16px "PingFang SC", "Microsoft YaHei", monospace';
    } else if (line.trim() === '') {
      stepY += 12;
    } else {
      ctx.fillStyle = '#334155';
      ctx.fillText(line, marginX + 30, stepY);
      stepY += 24;
    }
  }

  currentY += stepsBoxHeight + 30;

  // 4. Footer & Classroom Notes / Verification Link
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, currentY);
  ctx.lineTo(marginX + contentWidth, currentY);
  ctx.stroke();

  currentY += 25;
  ctx.fillStyle = '#64748b';
  ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(
    `${isZh ? '学生/教师备注' : 'Notes'}: __________________________________________________________________________`,
    marginX,
    currentY
  );

  currentY += 25;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px monospace';
  ctx.fillText(
    `${isZh ? '在线复现链接' : 'Online Replay'}: ${shareUrl}`,
    marginX,
    currentY
  );

  // Generate jsPDF instance and save
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgData = offscreen.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

  const safeFileName = `linear_function_A(${result.p1.x},${result.p1.y})_B(${result.p2.x},${result.p2.y}).pdf`;
  pdf.save(safeFileName);
}

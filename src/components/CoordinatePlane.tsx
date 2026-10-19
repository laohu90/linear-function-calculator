/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CalculationResult, Point } from '../utils/linearMath';
import { ZoomIn, ZoomOut, RotateCcw, Download, Crosshair, Magnet, AlertCircle } from 'lucide-react';

interface CoordinatePlaneProps {
  result: CalculationResult;
  onPointChange: (p1: Point, p2: Point) => void;
  lang: 'zh' | 'en';
}

export const CoordinatePlane: React.FC<CoordinatePlaneProps> = ({ result, onPointChange, lang }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport scale & offset
  const [scale, setScale] = useState<number>(38); // pixels per unit
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingPoint, setDraggingPoint] = useState<'p1' | 'p2' | 'pan' | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number }>({ mouseX: 0, mouseY: 0 });
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);

  // Feature toggles
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [showAuxLines, setShowAuxLines] = useState<boolean>(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear with crisp white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const originX = width / 2 + offset.x;
    const originY = height / 2 + offset.y;

    const toScreen = (x: number, y: number) => ({
      sx: originX + x * scale,
      sy: originY - y * scale
    });

    const toMath = (sx: number, sy: number) => ({
      mx: (sx - originX) / scale,
      my: (originY - sy) / scale
    });

    // Determine grid step
    let gridStep = 1;
    if (scale < 18) gridStep = 5;
    else if (scale < 28) gridStep = 2;
    else if (scale > 85) gridStep = 0.5;

    // 2. Draw Math Grid Lines (Subtle slate-100 / slate-200)
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();

    const minX = Math.floor(toMath(0, 0).mx / gridStep) * gridStep;
    const maxX = Math.ceil(toMath(width, 0).mx / gridStep) * gridStep;
    const minY = Math.floor(toMath(0, height).my / gridStep) * gridStep;
    const maxY = Math.ceil(toMath(0, 0).my / gridStep) * gridStep;

    for (let x = minX; x <= maxX; x += gridStep) {
      if (Math.abs(x) < 1e-6) continue;
      const { sx } = toScreen(x, 0);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    for (let y = minY; y <= maxY; y += gridStep) {
      if (Math.abs(y) < 1e-6) continue;
      const { sy } = toScreen(0, y);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // 3. Draw Major Axes (Slate-600)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    // X Axis
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    // Y Axis
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Arrows on Axes
    ctx.fillStyle = '#475569';
    // X Arrow
    ctx.beginPath();
    ctx.moveTo(width - 5, originY - 4);
    ctx.lineTo(width, originY);
    ctx.lineTo(width - 5, originY + 4);
    ctx.fill();
    // Y Arrow
    ctx.beginPath();
    ctx.moveTo(originX - 4, 5);
    ctx.lineTo(originX, 0);
    ctx.lineTo(originX + 4, 5);
    ctx.fill();

    // Tick labels and numbers
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = minX; x <= maxX; x += gridStep) {
      if (Math.abs(x) < 1e-6) continue;
      const { sx, sy } = toScreen(x, 0);
      if (sx > 20 && sx < width - 20) {
        ctx.fillText(Number(x.toFixed(2)).toString(), sx, Math.min(Math.max(sy + 4, 4), height - 16));
      }
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = minY; y <= maxY; y += gridStep) {
      if (Math.abs(y) < 1e-6) continue;
      const { sx, sy } = toScreen(0, y);
      if (sy > 20 && sy < height - 20) {
        ctx.fillText(Number(y.toFixed(2)).toString(), Math.min(Math.max(sx - 5, 20), width - 4), sy);
      }
    }

    // Origin label '0' & Axis names 'x', 'y'
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('O', originX - 8, originY + 6);
    ctx.fillText('x', width - 8, originY + 8);
    ctx.fillText('y', originX + 12, 10);

    // 4. Highlight Triangle with axes (if applicable)
    if (result.triangleAreaWithAxes && result.xInterceptPoint && result.yInterceptPoint) {
      const pX = toScreen(result.xInterceptPoint.x, 0);
      const pY = toScreen(0, result.yInterceptPoint.y);
      const pO = toScreen(0, 0);

      ctx.save();
      ctx.fillStyle = 'rgba(79, 70, 229, 0.08)';
      ctx.beginPath();
      ctx.moveTo(pO.sx, pO.sy);
      ctx.lineTo(pX.sx, pX.sy);
      ctx.lineTo(pY.sx, pY.sy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw Auxiliary Lines (Optional: Parallel through (0,0) & Perpendicular Bisector)
    if (showAuxLines && result.isValid) {
      ctx.save();
      ctx.setLineDash([4, 4]);

      // Auxiliary 1: Parallel through origin (0, 0)
      if (result.specialType === 'vertical') {
        const pO = toScreen(0, 0);
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(pO.sx, 0);
        ctx.lineTo(pO.sx, height);
        ctx.stroke();
      } else if (result.k !== undefined) {
        const leftMath = toMath(0, 0);
        const rightMath = toMath(width, 0);
        const yL = result.k * leftMath.mx;
        const yR = result.k * rightMath.mx;
        const pL = toScreen(leftMath.mx, yL);
        const pR = toScreen(rightMath.mx, yR);
        ctx.strokeStyle = '#0284c7'; // Sky-600
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pL.sx, pL.sy);
        ctx.lineTo(pR.sx, pR.sy);
        ctx.stroke();
      }

      // Auxiliary 2: Perpendicular Bisector through Midpoint M
      if (result.k !== undefined && Math.abs(result.k) > 1e-9) {
        const perpSlope = -1 / result.k;
        const leftMath = toMath(0, 0);
        const rightMath = toMath(width, 0);
        const bPerp = result.midpoint.y - perpSlope * result.midpoint.x;
        const yL = perpSlope * leftMath.mx + bPerp;
        const yR = perpSlope * rightMath.mx + bPerp;
        const pL = toScreen(leftMath.mx, yL);
        const pR = toScreen(rightMath.mx, yR);
        ctx.strokeStyle = '#8b5cf6'; // Violet-500
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pL.sx, pL.sy);
        ctx.lineTo(pR.sx, pR.sy);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 6. Draw the Primary Linear Function Line
    if (result.isValid) {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#4f46e5';
      ctx.beginPath();

      if (result.specialType === 'vertical') {
        const sx = toScreen(result.p1.x, 0).sx;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
      } else if (result.k !== undefined && result.b !== undefined) {
        const leftMath = toMath(0, 0);
        const rightMath = toMath(width, 0);

        const yLeft = result.k * leftMath.mx + result.b;
        const yRight = result.k * rightMath.mx + result.b;

        const pLeft = toScreen(leftMath.mx, yLeft);
        const pRight = toScreen(rightMath.mx, yRight);

        ctx.moveTo(pLeft.sx, pLeft.sy);
        ctx.lineTo(pRight.sx, pRight.sy);
      }
      ctx.stroke();
    }

    // 7. Draw Intercepts
    if (result.xInterceptPoint && Math.abs(result.xInterceptPoint.x) > 1e-4) {
      const { sx, sy } = toScreen(result.xInterceptPoint.x, 0);
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#059669';
      ctx.textAlign = 'center';
      ctx.fillText(
        `X(${result.xInterceptFraction?.text ?? result.xInterceptPoint.x.toFixed(1)}, 0)`,
        sx,
        sy - 12
      );
    }

    if (result.yInterceptPoint && (result.xInterceptPoint?.x !== 0 || result.yInterceptPoint.y !== 0)) {
      const { sx, sy } = toScreen(0, result.yInterceptPoint.y);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#d97706';
      ctx.textAlign = 'left';
      ctx.fillText(
        `Y(0, ${result.bFraction?.text ?? result.yInterceptPoint.y.toFixed(1)})`,
        sx + 8,
        sy + 4
      );
    }

    // 8. Draw Midpoint M
    if (result.isValid && result.midpoint) {
      const { sx, sy } = toScreen(result.midpoint.x, result.midpoint.y);
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 9. Draw Control Points A & B
    const drawControlPoint = (pt: Point, color: string, label: string) => {
      const { sx, sy } = toScreen(pt.x, pt.y);

      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'left';
      ctx.fillText(`${label}(${pt.x}, ${pt.y})`, sx + 12, sy - 8);
    };

    drawControlPoint(result.p1, '#2563eb', 'A');
    drawControlPoint(result.p2, '#db2777', 'B');

    // 10. Mouse Cursor Coords Display
    if (mouseCoord) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        `x: ${mouseCoord.x.toFixed(2)}, y: ${mouseCoord.y.toFixed(2)}`,
        width - 12,
        height - 12
      );
    }
  }, [offset, scale, result, mouseCoord, showAuxLines]);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  const getCanvasMousePos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const getMathCoordinates = (sx: number, sy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const originX = canvas.width / 2 + offset.x;
    const originY = canvas.height / 2 + offset.y;
    return {
      x: (sx - originX) / scale,
      y: (originY - sy) / scale
    };
  };

  const processDragStart = (sx: number, sy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const originX = canvas.width / 2 + offset.x;
    const originY = canvas.height / 2 + offset.y;

    const sA = { sx: originX + result.p1.x * scale, sy: originY - result.p1.y * scale };
    const sB = { sx: originX + result.p2.x * scale, sy: originY - result.p2.y * scale };

    const distA = Math.hypot(sx - sA.sx, sy - sA.sy);
    const distB = Math.hypot(sx - sB.sx, sy - sB.sy);

    if (distA <= 18) {
      setDraggingPoint('p1');
    } else if (distB <= 18) {
      setDraggingPoint('p2');
    } else {
      setDraggingPoint('pan');
      setDragStart({ mouseX: sx - offset.x, mouseY: sy - offset.y });
    }
  };

  const processDragMove = (sx: number, sy: number) => {
    const mathPos = getMathCoordinates(sx, sy);
    setMouseCoord(mathPos);

    if (draggingPoint === 'pan') {
      setOffset({
        x: sx - dragStart.mouseX,
        y: sy - dragStart.mouseY
      });
    } else if (draggingPoint === 'p1') {
      const targetX = snapToGrid ? Math.round(mathPos.x * 2) / 2 : mathPos.x;
      const targetY = snapToGrid ? Math.round(mathPos.y * 2) / 2 : mathPos.y;
      onPointChange({ x: targetX, y: targetY }, result.p2);
    } else if (draggingPoint === 'p2') {
      const targetX = snapToGrid ? Math.round(mathPos.x * 2) / 2 : mathPos.x;
      const targetY = snapToGrid ? Math.round(mathPos.y * 2) / 2 : mathPos.y;
      onPointChange(result.p1, { x: targetX, y: targetY });
    }
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: sx, y: sy } = getCanvasMousePos(e.clientX, e.clientY);
    processDragStart(sx, sy);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: sx, y: sy } = getCanvasMousePos(e.clientX, e.clientY);
    processDragMove(sx, sy);
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  // Touch handlers for mobile / tablet support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const { x: sx, y: sy } = getCanvasMousePos(touch.clientX, touch.clientY);
      processDragStart(sx, sy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const { x: sx, y: sy } = getCanvasMousePos(touch.clientX, touch.clientY);
      processDragMove(sx, sy);
    }
  };

  const handleTouchEnd = () => {
    setDraggingPoint(null);
  };

  const handleZoom = (factor: number) => {
    setScale((prev) => Math.min(Math.max(prev * factor, 14), 160));
  };

  const handleReset = () => {
    setOffset({ x: 0, y: 0 });
    setScale(38);
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `linear_function_${result.slopeInterceptEq.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col select-none">
      {/* Degenerate Warning Alert if points are identical */}
      {!result.isValid && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>
            {lang === 'zh'
              ? '两点重合，无法确定唯一直线。请拖拽或修改任意一点。'
              : 'Points coincide; infinite lines pass through. Please move a point.'}
          </span>
        </div>
      )}

      {/* Floating hints on canvas */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 text-xs flex items-center gap-2 text-slate-700 shadow-sm">
          <Crosshair className="h-3.5 w-3.5 text-indigo-600" />
          <span className="font-medium">
            {lang === 'zh'
              ? '按住并拖拽点 A 或点 B 实时联动'
              : 'Drag Point A / B to update in real time'}
          </span>
        </div>

        {/* Snap to grid toggle button */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          title={lang === 'zh' ? '切换吸附网格 (0.5精度)' : 'Toggle Grid Snap (0.5 Step)'}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ${
            snapToGrid
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white/95 border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          <Magnet className="h-3 w-3" />
          <span>{lang === 'zh' ? '吸附网格' : 'Snap'}</span>
        </button>

        {/* Aux Lines toggle button */}
        <button
          onClick={() => setShowAuxLines(!showAuxLines)}
          title={lang === 'zh' ? '显示平行线与垂直平分线' : 'Show Parallel & Perpendicular Lines'}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ${
            showAuxLines
              ? 'bg-purple-50 border-purple-200 text-purple-700'
              : 'bg-white/95 border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{lang === 'zh' ? '辅助垂线/平行线' : 'Aux Lines'}</span>
        </button>
      </div>

      {/* Floating Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => handleZoom(1.25)}
          title={lang === 'zh' ? '放大' : 'Zoom In'}
          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          title={lang === 'zh' ? '缩小' : 'Zoom Out'}
          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          title={lang === 'zh' ? '重置中心原点' : 'Reset View'}
          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />
        <button
          onClick={handleExportPNG}
          title={lang === 'zh' ? '导出高清图片 (PNG)' : 'Export PNG'}
          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Canvas container with touch-action none for smooth touch drags */}
      <div
        ref={containerRef}
        className="w-full flex-1 relative cursor-crosshair touch-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full block"
        />
      </div>

      {/* Canvas Bottom Legend Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <strong className="text-slate-800">{lang === 'zh' ? '点 A:' : 'Point A:'}</strong> ({result.p1.x}, {result.p1.y})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-600" />
            <strong className="text-slate-800">{lang === 'zh' ? '点 B:' : 'Point B:'}</strong> ({result.p2.x}, {result.p2.y})
          </span>
          {result.xInterceptPoint && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <strong className="text-slate-800">{lang === 'zh' ? 'X轴交点:' : 'X-Intercept:'}</strong> ({result.xInterceptFraction?.text ?? result.xInterceptPoint.x.toFixed(1)}, 0)
            </span>
          )}
          {result.yInterceptPoint && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
              <strong className="text-slate-800">{lang === 'zh' ? 'Y轴交点:' : 'Y-Intercept:'}</strong> (0, {result.bFraction?.text ?? result.yInterceptPoint.y.toFixed(1)})
            </span>
          )}
        </div>

        <div className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
          {result.slopeInterceptEq}
        </div>
      </div>
    </div>
  );
};

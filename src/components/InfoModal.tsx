/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText, Info, Github, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export type InfoModalTab = 'privacy' | 'terms' | 'about';

interface InfoModalProps {
  isOpen: boolean;
  activeTab: InfoModalTab;
  onClose: () => void;
  onTabChange: (tab: InfoModalTab) => void;
  lang: 'zh' | 'en';
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
  lang
}) => {
  const isZh = lang === 'zh';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              {activeTab === 'privacy' && <ShieldCheck className="h-4 w-4" />}
              {activeTab === 'terms' && <FileText className="h-4 w-4" />}
              {activeTab === 'about' && <Info className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {activeTab === 'privacy' && (isZh ? '隐私政策 (Privacy Policy)' : 'Privacy Policy')}
                {activeTab === 'terms' && (isZh ? '服务条款 (Terms of Service)' : 'Terms of Service')}
                {activeTab === 'about' && (isZh ? '关于本工具 (About Calculator)' : 'About Linear Function Calculator')}
              </h3>
              <p className="text-xs text-slate-500">
                {isZh ? '纯本地计算 · 开源透明 · 教学专用' : 'Client-Side Computing · Open Source · Educational'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title={isZh ? '关闭' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-2 pt-2">
          <button
            onClick={() => onTabChange('about')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="h-4 w-4" />
            <span>{isZh ? '关于我们' : 'About'}</span>
          </button>
          <button
            onClick={() => onTabChange('privacy')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isZh ? '隐私政策' : 'Privacy Policy'}</span>
          </button>
          <button
            onClick={() => onTabChange('terms')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{isZh ? '服务条款' : 'Terms of Service'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto text-slate-700 text-sm leading-relaxed space-y-4">
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-indigo-950 mb-1">
                    {isZh ? '一次函数解析式生成器' : 'Linear Function Calculator'}
                  </h4>
                  <p className="text-xs text-indigo-900/90 leading-relaxed">
                    {isZh
                      ? '本工具专为初高中数学代数几何教学、学生自查、作业演算与教师备课设计。只需输入任意两点坐标，秒级输出标准斜截式方程 y = kx + b、一般式、点斜式、斜率、截距、交点及交互式图像。'
                      : 'Designed for middle & high school mathematics, algebra students, tutors, and teachers. Quickly deduce line equations in slope-intercept form (y = mx + b), standard form, point-slope form, intercepts, and interactive graphing.'}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-2">
                  {isZh ? '主要功能特性：' : 'Core Features:'}
                </h5>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{isZh ? '两点求解析式与待定系数法全流程分步推导' : 'Two-point slope formula & substitution method step-by-step'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{isZh ? '输入实时校验：非数字实时标红，清空停止计算，严防虚假答案' : 'Real-time validation: highlights invalid inputs, stops on blank fields'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{isZh ? '0~8 位小数精度自由调节，支持分数与小数双重对照' : 'Adjustable 0-8 decimal places precision with exact fractions'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{isZh ? '带参数 URL 一键复现题目与一键复制全部演算结果' : 'Shareable parameter URL & one-click full results copy'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{isZh ? '教学级 PDF 打印解题卡与高清 PNG 图像双导出' : 'Downloadable PDF printable worksheet and high-resolution PNG'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{isZh ? '动态笛卡尔直角坐标系画布，支持拖拽、网格吸附与辅助线' : 'Interactive Cartesian plane with drag-and-drop & snap to grid'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href="https://github.com/laohu90/linear-function-calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-xs text-slate-400">Open Source MIT</span>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  {isZh
                    ? '纯本地运算保证：所有坐标和公式推导均在您的浏览器中完成。'
                    : 'Client-Side Guarantee: All calculations occur solely within your web browser.'}
                </span>
              </div>

              <h5 className="font-bold text-slate-900 pt-1">
                {isZh ? '1. 数据收集与隐私声明' : '1. Data Collection & Privacy'}
              </h5>
              <p>
                {isZh
                  ? '本网站是一项纯前端运行的数学教育工具，不会收集、存储或上传您输入的任何坐标数值、题目参数或计算结果到远程服务器。'
                  : 'This website is a client-side educational tool. It does not collect, track, or upload any coordinate numbers or calculation records to remote servers.'}
              </p>

              <h5 className="font-bold text-slate-900 pt-1">
                {isZh ? '2. 本地存储 (LocalStorage) 的使用' : '2. Use of LocalStorage'}
              </h5>
              <p>
                {isZh
                  ? '本工具仅在浏览器的本地存储（LocalStorage）中保存您的界面语言选择与小数精度偏好，以便您下次访问时获得相同的体验。绝不用于任何追踪或广告目的。'
                  : 'LocalStorage is strictly used to remember your preferred language and decimal precision settings across sessions.'}
              </p>

              <h5 className="font-bold text-slate-900 pt-1">
                {isZh ? '3. 校园与未成年人保护' : '3. Student & Classroom Protection'}
              </h5>
              <p>
                {isZh
                  ? '完全符合教育环境要求，无广告植入，无第三方跟踪分析器，教师与学生可安心在任何教学设备上使用。'
                  : 'Safe for school classrooms, students, and tutors without third-party tracking or behavioral profiling.'}
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <h5 className="font-bold text-slate-900">
                {isZh ? '1. 使用许可与授权' : '1. Terms of Usage'}
              </h5>
              <p>
                {isZh
                  ? '您可以免费将本工具用于个人学习、数学练习、学校备课、课后辅导及打印试卷解答卡。允许在遵守开源许可协议的前提下进行合理引用。'
                  : 'You are granted free permission to use this calculator for personal learning, classroom teaching, academic tutoring, and generating study worksheets.'}
              </p>

              <h5 className="font-bold text-slate-900 pt-1">
                {isZh ? '2. 数学准确性声明' : '2. Mathematical Accuracy'}
              </h5>
              <p>
                {isZh
                  ? '所有公式计算严格基于欧几里得解析几何与代数待定系数法公理。浮点计算经过分数连分数算法精确化。虽然我们全力确保算法严谨，但在考试与工程实践中仍请结合题目要求仔细核算。'
                  : 'Calculations follow Euclidean analytic geometry and standard algebraic substitution algorithms with continuous fraction exactness.'}
              </p>

              <h5 className="font-bold text-slate-900 pt-1">
                {isZh ? '3. 免责条款' : '3. Disclaimer'}
              </h5>
              <p>
                {isZh
                  ? '本软件按“现状”（AS-IS）提供，不提供任何形式的明示或暗示担保。开发者不对使用本工具产生的任何直接或间接后果承担法律责任。'
                  : 'The software is provided "as is", without warranty of any kind, express or implied.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isZh ? '一次函数解析式生成器 · 专业数学工作台' : 'Linear Function Calculator Studio'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {isZh ? '我知道了' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};

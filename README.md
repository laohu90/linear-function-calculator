# 一次函数解析式生成器 | Linear Function & Line Equation Calculator (y = kx + b)

<p align="center">
  <img src="https://img.shields.io/badge/Equation-y%20%3D%20kx%20%2B%20b-6366f1?style=for-the-badge" alt="Equation" />
  <img src="https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google%20SEO-Optimized-10b981?style=for-the-badge" alt="SEO" />
</p>

## 📌 核心功能与亮点 (Core Features)

- **输入两点秒求解析式**：输入坐标点 $A(x_1, y_1)$ 与 $B(x_2, y_2)$，秒级自动计算一次函数解析式 $y = kx + b$。
- **斜率与截距精准输出**：
  - 斜率 $k$（分数化简形式 + 精确小数）
  - 截距 $b$（分数形式 + 精确小数）
  - 与 $x$ 轴交点坐标 $\left(-\frac{b}{k}, 0\right)$
  - 与 $y$ 轴交点坐标 $(0, b)$
  - 与两坐标轴围成的直角三角形面积 $S = \frac{1}{2} |x_{\text{int}}| \cdot |y_{\text{int}}|$
- **完整几何与代数属性**：
  - 一般式方程 $Ax + By + C = 0$
  - 点斜式方程 $y - y_1 = k(x - x_1)$
  - 倾斜角 $\alpha$（度数与弧度）
  - 两点间直线距离 $d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$ 与中点坐标 $M$
  - 垂直线斜率 $k_\perp = -\frac{1}{k}$
  - 函数增减性与象限经过判定
- **高保真直角坐标系（Canvas 交互式图像）**：
  - 动态绘制网格、刻度与轴线
  - 支持直接在画布上拖拽点 $A$ / $B$ 实时动态更新公式
  - 缩放（Zoom In/Out）、平移与一键重置
  - 一键导出高清函数图像 PNG
- **详细分步解题推导（Step-by-step Steps）**：
  - 待定系数法解方程组步骤
  - 斜率公式法步骤
  - 适合初中、高中、中考与国际课程（SAT/ACT）数学学习与备课
- **函数点快速求值器**：
  - 给定 $x$ 计算 $y$
  - 给定 $y$ 计算 $x$
- **深度 Google SEO 优化**：
  - 适配 Google 搜索引擎中英文关键词抓取收录
  - 包含 WebApplication、HowTo 和 FAQPage Schema.org 结构化数据
  - 中英双语（Chinese & English）一键切换

---

## 🚀 关键词 (Google SEO Keywords)

`一次函数解析式生成器` · `一次函数计算器` · `求一次函数解析式` · `两点求直线方程` · `y=kx+b` · `斜率截距式` · `一次函数图像` · `Linear Function Calculator` · `Line Equation from Two Points` · `Slope Intercept Form Calculator` · `y=mx+b`

---

## 🛠️ 本地运行与开发 (Local Development)

```bash
# 1. 克隆仓库
git clone https://github.com/laohu90/linear-function-calculator.git

# 2. 进入项目目录
cd linear-function-calculator

# 3. 安装依赖
npm install

# 4. 启动本地开发服务
npm run dev

# 5. 打包生产版本
npm run build
```

---

## 📄 许可证 (License)

Apache-2.0 License.

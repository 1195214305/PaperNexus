# PaperNexus - 科研文献智能助手

> 基于边缘计算和 AI 的科研文献管理与分析平台

## 本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护

![阿里云ESA](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

## 项目简介

PaperNexus 是一款基于阿里云 ESA Pages 边缘计算平台开发的科研文献智能助手。它借鉴了 Zotero-AI-Butler 的设计理念，将文献管理搬到了云端，让科研工作者能够随时随地管理和分析学术论文。

### 核心功能

- **📄 PDF 智能解析**：上传 PDF 论文，AI 自动提取标题、作者、摘要等元信息
- **🤖 AI 深度分析**：使用千问大模型对论文进行结构化分析，生成研究背景、方法、结果、结论等摘要
- **💬 智能追问**：对论文内容有疑问？直接提问，AI 基于论文内容回答
- **🎨 学术海报生成**：一键生成论文学术海报，方便组会汇报和快速回顾
- **📱 多端适配**：完美适配桌面端和移动端，随时随地管理文献
- **🔒 隐私保护**：API Key 存储在本地浏览器，数据安全可控

### 设计特色

- **简洁石色系设计**：摒弃 AI 味浓重的蓝紫渐变，采用温暖的石色系（stone）配色
- **无过度圆角**：避免满屏圆角卡片，使用简洁的直角和细边框设计
- **优雅排版**：使用 Noto Serif SC 衬线字体，提升学术氛围
- **流畅交互**：精心设计的动画和过渡效果，提供流畅的用户体验

## 技术架构

### 前端技术栈

- **React 18** - 现代化 UI 框架
- **TypeScript** - 类型安全
- **Vite** - 极速构建工具
- **Tailwind CSS** - 原子化 CSS 框架
- **Zustand** - 轻量级状态管理
- **React Router** - 路由管理
- **React Markdown** - Markdown 渲染
- **KaTeX** - 数学公式渲染

### 边缘计算技术

- **ESA Pages** - 静态资源托管
- **ESA 边缘函数** - Serverless 计算
- **千问 AI** - 大语言模型

## How We Use Edge

PaperNexus 深度利用了阿里云 ESA 的完整边缘生态，边缘计算在本项目中具有**不可替代性**：

### 1. 边缘函数 - 核心计算能力

所有 AI 分析和处理逻辑都运行在边缘函数中：

- **`/api/analyze`** - PDF 解析和 AI 分析
  - 接收用户上传的 PDF 文件
  - 将 PDF 转换为 Base64 格式
  - 调用千问多模态 API 进行智能分析
  - 解析 AI 返回的结构化内容
  - 返回完整的论文元数据和摘要

- **`/api/ask`** - 智能追问
  - 接收用户的问题
  - 基于论文上下文调用千问 API
  - 返回专业的学术解答

- **`/api/poster`** - 学术海报生成
  - 基于论文摘要生成海报内容
  - 使用 AI 提取核心观点和创新点

### 2. 边缘优势

- **低延迟**：边缘节点就近处理，大幅降低 API 调用延迟
- **高并发**：边缘函数自动扩展，支持多用户同时上传分析
- **成本优化**：按需计算，无需维护服务器
- **全球加速**：静态资源通过 ESA CDN 全球分发

### 3. 为什么必须用边缘？

传统方案的问题：
- ❌ 传统服务器：需要维护、扩容、备份，成本高
- ❌ 纯前端方案：无法处理 PDF 解析和 AI 调用，存在 API Key 泄露风险
- ❌ 第三方 Serverless：冷启动慢，跨境延迟高

ESA 边缘方案的优势：
- ✅ 零运维：无需管理服务器
- ✅ 极速响应：边缘节点就近处理
- ✅ 安全可靠：API Key 在边缘函数中使用，不暴露给前端
- ✅ 弹性扩展：自动应对流量波动

## 快速开始

### 1. 获取千问 API Key

访问 [阿里云百炼平台](https://dashscope.aliyun.com/)，注册并创建 API Key。

### 2. 本地开发

```bash
# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm run dev
```

### 3. 配置 API Key

1. 访问 `http://localhost:3000/settings`
2. 输入你的千问 API Key
3. 选择分析深度（快速/标准/深度）
4. 保存设置

### 4. 上传文献

1. 返回首页
2. 点击"上传 PDF 文献"按钮
3. 选择一篇学术论文 PDF
4. AI 会自动开始分析（约 3-5 分钟）
5. 分析完成后，查看结构化摘要

### 5. 智能追问

1. 在文献详情页底部输入框提问
2. AI 会基于论文内容回答你的问题
3. 对话历史会自动保存

## 部署到 ESA Pages

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "feat: 初始化 PaperNexus 项目"
git branch -M main
git remote add origin https://github.com/1195214305/PaperNexus.git
git push -u origin main
```

### 2. 在 ESA 控制台创建项目

1. 登录 [阿里云 ESA 控制台](https://esa.console.aliyun.com/)
2. 选择"Pages"服务
3. 点击"创建项目"
4. 选择"从 GitHub 导入"
5. 授权并选择 `PaperNexus` 仓库

### 3. 配置构建参数

| 配置项 | 值 |
|--------|-----|
| 项目名称 | PaperNexus |
| 生产分支 | main |
| 安装命令 | `cd frontend && npm install` |
| 构建命令 | `cd frontend && npm run build` |
| 静态资源目录 | `frontend/dist` |
| 函数文件路径 | （留空，使用 esa.jsonc 配置） |
| Node.js 版本 | 22.x |

### 4. 部署

点击"部署"按钮，等待构建完成。部署成功后，你会获得一个 ESA Pages 域名，例如：

```
https://papernexus.xxxxxxxx.er.aliyun-esa.net
```

## 项目结构

```
PaperNexus/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/      # React 组件
│   │   │   ├── Header.tsx
│   │   │   ├── PaperList.tsx
│   │   │   ├── PaperCard.tsx
│   │   │   └── PaperDetail.tsx
│   │   ├── pages/           # 页面
│   │   │   ├── Home.tsx
│   │   │   └── Settings.tsx
│   │   ├── store/           # 状态管理
│   │   │   └── useStore.ts
│   │   ├── utils/           # 工具函数
│   │   │   └── api.ts
│   │   ├── types/           # 类型定义
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/              # 静态资源
│   ├── package.json
│   └── vite.config.ts
├── functions/                # 边缘函数
│   ├── index.js             # 统一入口
│   └── api/
│       ├── analyze.js       # PDF 分析
│       ├── ask.js           # 智能追问
│       ├── poster.js        # 海报生成
│       └── health.js        # 健康检查
├── screenshots/              # 项目截图
├── esa.jsonc                # ESA 配置文件
└── README.md
```

## 使用场景

### 1. 科研工作者

- 快速浏览大量论文，AI 帮你提取核心要点
- 组会前快速回顾论文内容
- 对论文有疑问时，随时追问 AI

### 2. 研究生

- 管理课题相关的文献
- 学习如何阅读学术论文
- 准备文献综述和开题报告

### 3. 本科生

- 学习学术论文的结构和写作方法
- 快速理解复杂的学术概念
- 准备毕业论文

## 创新点

### 1. 创意卓越

- **Web 版 Zotero-AI-Butler**：将桌面端插件的理念搬到云端，随时随地访问
- **简洁设计**：摒弃 AI 味浓重的设计，采用学术风格的石色系配色
- **一键生成海报**：快速生成学术海报，方便组会汇报

### 2. 应用价值

- **即用性**：无需安装任何软件，打开浏览器即可使用
- **实用性**：解决科研工作者的真实痛点（文献太多、读不过来、容易忘记）
- **传播性**：分享链接即可让他人使用，无需复杂配置

### 3. 技术探索

- **完整边缘生态**：深度使用 ESA Pages + 边缘函数
- **多模态 AI**：使用千问多模态能力直接解析 PDF
- **状态持久化**：使用 Zustand + LocalStorage 实现数据持久化
- **数学公式渲染**：支持 LaTeX 公式完美渲染

## 未来规划

- [ ] 支持更多 AI 模型（Claude、GPT-4 等）
- [ ] 文献关系图谱可视化
- [ ] 多人协作和分享功能
- [ ] 文献引用管理
- [ ] 导出为 BibTeX 格式
- [ ] 集成学术搜索引擎

## 开源协议

MIT License

## 致谢

- 感谢 [Zotero-AI-Butler](https://github.com/steven-jianhao-li/zotero-AI-Butler) 提供的设计灵感
- 感谢阿里云 ESA 团队提供的边缘计算平台
- 感谢阿里云百炼团队提供的千问 AI 服务

## 联系方式

- GitHub: [@1195214305](https://github.com/1195214305)
- 项目地址: [https://github.com/1195214305/PaperNexus](https://github.com/1195214305/PaperNexus)

---

**让 AI 成为你的科研助手，让文献阅读不再是负担！**

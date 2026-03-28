# PomChat Studio

PomChat Studio 是一个以桌面端为主的聊天对话视频编辑工具，用来把本地音频和 ASS 字幕整理成聊天气泡风格的视频内容。

它支持在一个项目里完成字幕编辑、说话人配置、气泡样式调整、布局预览和视频导出。

English README: `README.en.md`

## 功能简介

- 导入本地音频和 ASS 字幕文件
- 编辑字幕文本、时间和说话人映射
- 配置头像、名称、气泡颜色、字体、边框、阴影和动画
- 跟随音频实时预览聊天排版效果
- 选择导出区间并导出视频
- 通过 Electron 读写本地项目文件和配置

## 主要功能

- **字幕编辑**：新增、删除、排序、修改字幕行
- **角色样式**：自定义头像、气泡、字体、边距、内边距和主题
- **布局控制**：调整画布尺寸、全局缩放、头像大小、注释位置和边距
- **播放工具**：拖动播放、循环播放、记忆位置、快速设置导出范围
- **视频导出**：按当前项目配置导出聊天视频

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

## 基本使用

1. 打开应用
2. 导入音频文件和 ASS 字幕文件
3. 检查并调整说话人配置
4. 编辑字幕内容、时间和样式
5. 调整布局、动画和导出参数
6. 在预览区确认效果
7. 导出最终视频

## 构建

构建应用：

```bash
npm run build
```

本地打包 Electron 应用：

```bash
npm run dist
```

打包产物输出到 `release/`。

## GitHub Actions

仓库内已经包含 Electron 自动构建和手动发布工作流：

- `Build Electron Apps`：多平台自动构建产物
- `Release Electron Apps`：手动创建 GitHub Release 并上传产物

## 项目结构

- `src/App.tsx`：主应用流程与预览集成
- `src/components/`：编辑面板、播放器、导出弹窗、共享聊天组件
- `src/remotion/`：Remotion 导出组合和类型
- `src/hooks/useAssSubtitle.ts`：ASS 解析与字幕加载
- `electron/`：Electron 主进程、预加载脚本和渲染工作进程
- `.github/workflows/`：CI 构建和发布工作流

## 说明

- 当前主要面向 Electron 本地桌面使用场景
- 部分 Electron 配置仍偏开发态，后续可以继续收紧

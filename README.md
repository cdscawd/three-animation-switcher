# three-animation-switcher

全屏 WebGL 背景动画切换器。左侧毛玻璃菜单切换动画，右侧参数面板实时调参，右上角显示 FPS / MS / MB 性能面板。

基于 **Vite + React 19 + TypeScript + Three.js**，同时只挂载一个 WebGL 引擎，切换时完整卸载旧引擎以避免多上下文并存。

## 功能

- 13 种全屏背景动画，菜单一键切换
- 每种动画独立参数 schema，滑块改动实时推送到引擎
- 参数按动画分存，切换菜单不会串值
- 支持 Reset / Copy JSON / Export 导出当前配置
- 页面隐藏时自动暂停渲染循环

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端输出的本地地址（默认 `http://localhost:5173`）。

```bash
npm run build    # 生产构建
npm run preview  # 预览构建产物
npm run lint     # Oxlint
```

## 动画列表

| 名称 | 引擎类型 | 说明 |
|------|----------|------|
| Enter Cyberspace | `three-scene` | 隧道 + 粒子 + GSAP 的多对象 Three.js 场景 |
| Starship Shader | `three-shader` | ShaderMaterial 全屏星舰效果 |
| Phosphor Shader | `fullscreen-shader` | WebGL1 全屏 phosphor 着色器 |
| ATC Shader | `fullscreen-shader` | WebGL1 全屏 ATC 效果 |
| Cathedral Shader | `fullscreen-shader` | WebGL2 原始 raymarch（需 WebGL2） |
| Shader Lines | `three-shader` | Three.js 线条流动着色器 |
| Shader Animation | `three-shader` | Three.js 动态着色器动画 |
| Anomalous Matter | `three-scene` | 多 pass Three.js 场景 |
| Lab Shader | `fullscreen-shader` | WebGL2 全屏着色器 |
| Launch Shader | `fullscreen-shader` | WebGL2 raymarch 发射效果 |
| Radial Shader | `fullscreen-shader` | WebGL2 径向着色器 |
| Grid Shader | `three-shader` | Three.js 滚动网格 |
| Fireflies | `fullscreen-shader` | WebGL2 萤火虫粒子场 |

多数 shader 动画还原自 [21st.dev](https://21st.dev) 社区 bundle（ShaderCanvas / Three.js 组件），在 `src/engine/<id>/` 中保留原始 GLSL 逻辑。

## 项目结构

```
src/
  animations/          # 菜单项 + 组件注册表（types.ts / registry.tsx）
  params/              # 各动画 ParamSchema 与默认值
  context/             # AnimationParamsProvider
  components/
    BackgroundShell/   # 通用背景挂载壳
    ConfigPanel/       # 右侧 liquidglass 参数面板
    ThreePerfStats/    # 右上角 Stats.js 性能面板
    *Background/       # 各动画 React 入口
  engine/
    types.ts           # BackgroundEngine 接口（load / dispose / applyParams?）
    shared/            # FullscreenShaderEngine、WebGL2FullscreenEngine 基类
    cyberspace/        # 多对象场景引擎
    starship/          # Three.js ShaderMaterial 引擎
    …                  # 其余动画各自独立目录
  hooks/
    createBackgroundEngineHook.ts
    backgroundEngines.ts
  pages/Home/          # 菜单 + 面板 + 动态背景
```

## 架构要点

```
MenuLiquidGlass ──► activeAnimation
                         │
                         ├─► AnimationParamsProvider
                         │        ├─► ConfigPanel（读 schema，写 setParam）
                         │        └─► *Background
                         │                 └─► createBackgroundEngineHook
                         │                          ├─ load() 后 applyParams
                         │                          └─ values 变化时 applyParams
                         └─► key={activeAnimation} 强制卸载旧引擎
```

- 引擎实现 `load()` / `dispose()`，在 `dispose` 中释放 GPU 资源
- 可调参数通过 `applyParams` 写 uniform，**不**重建 WebGL 上下文
- 不使用 `@react-three/fiber`，优先 raw Three.js 或 WebGL 全屏 quad

### 引擎类型

| kind | 适用场景 | 基类 / 参考 |
|------|----------|-------------|
| `three-scene` | 多 mesh、相机、动画 | `cyberspace/` |
| `three-shader` | 单 ShaderMaterial + 纹理 | `starship/`、`grid-shader/` |
| `fullscreen-shader` | WebGL1/WebGL2 全屏 quad | `shared/FullscreenShaderEngine`、`shared/WebGL2FullscreenEngine` |

## 新增动画

按顺序完成以下步骤（详见 `.cursor/rules/add-threejs-animation.mdc`）：

1. 在 `src/engine/<id>/` 实现引擎与 GLSL
2. 在 `src/hooks/backgroundEngines.ts` 注册 hook
3. 添加 `src/components/<Name>Background/` 组件
4. 更新 `src/animations/types.ts` 与 `registry.tsx`
5. 在 `src/params/schemas.ts` 追加参数 schema，引擎实现 `applyParams`

`Home.tsx` 无需修改，菜单与面板由注册表驱动。

## 技术栈

| 依赖 | 用途 |
|------|------|
| [Three.js](https://threejs.org/) | WebGL 渲染 |
| [GSAP](https://gsap.com/) | Cyberspace 等场景动画 |
| [@gatsby/liquidglassui](https://www.npmjs.com/package/@gatsby/liquidglassui) | 毛玻璃菜单与参数面板 |
| [React Router](https://reactrouter.com/) | 路由 |
| [Vite](https://vite.dev/) | 构建与 dev server |
| [Oxlint](https://oxc.rs/) | Lint |

GLSL 通过 `*.glsl?raw` 导入；React Compiler 已启用（见 `vite.config.ts`）。

## 浏览器要求

- 需要支持 WebGL 的现代浏览器
- Cathedral、Launch、Lab、Radial、Fireflies 等动画需要 **WebGL2**
- 建议使用 Chrome / Firefox / Safari 最新版

## License

Private project.

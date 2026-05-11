在线代码编辑器                                                                                      前端开发
项目概述：
飞书技术训练营前端 2.0 项目，基于 Web 的在线代码编辑平台（类似 CodePen）。采用前后端分离架构，前端基于 React 18 + TypeScript，后端基于 Node.js + Express + MongoDB，支持多语言实时编写、编译预览与代码分享。

核心技术栈：
React 18 + TypeScript + CodeMirror 6 + React Router v6 + Axios + Babel Standalone + Node.js + Express + MongoDB

项目亮点：

· 多语言编译管线：在浏览器端实现完整的编译链路——使用 Babel Standalone 编译 JSX/React，动态从 CDN 加载 TypeScript Compiler API 编译 TS，基于 @vue/compiler-sfc 解析 Vue 单文件组件，集成 sass/less 编译 CSS 预处理器；所有编译均在客户端完成，无需服务端编译接口，消除网络往返延迟。

· 实时错误检测与行内诊断：构建双层错误检测系统——静态层通过 CodeMirror Lint 扩展对 HTML/CSS/JS 进行语法检查并标注错误行；运行时层通过 iframe postMessage 机制捕获预览沙箱中的运行时异常，将错误信息以 ErrorMessageWidget 形式内联展示在对应代码行，精准定位问题。

· 代码补全系统：实现两层补全体系——基础层复用 CodeMirror 官方语言包的内置语义补全（HTML/CSS 标签、属性、属性值自动提示）；片段层为 JS/TS/React/Vue/CSS/HTML 六种语言共维护约 180 条 Snippet，通过异步加载避免阻塞主线程，并在补全列表中区分关键字、函数、变量等类型以提升可读性。

· CodeMirror 6 深度集成：通过编辑器扩展系统集成行号、语法高亮、括号匹配、选中高亮、代码折叠、历史记录等 10+ 项功能；利用 Compartment 机制实现语言模式热切换，切换语言时无需销毁重建编辑器实例，保留用户编辑状态。

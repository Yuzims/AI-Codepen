import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { less } from '@codemirror/lang-less';
import { vue } from '@codemirror/lang-vue';

import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { createPen, updatePen, getUserPens, getPen, deletePen, Pen, PenData } from '../services/penService';
import Preview from './Preview';
import DebugPreview from './DebugPreview';
import UserNavbar from './UserNavbar';
import Split from 'react-split';
import { Global } from '@emotion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { compileJsFramework, loadTypeScriptCompiler, compileCssFramework } from '../services/compilerService';
import { DebugManager } from '../services/debugService';
import {
    PageContainer,
    Container,
    EditorContainer,
    PreviewContainer,
    EditorHeader,
    EditorTitle,
    EditorActions,
    Button,
    BackButton,
    Select,
    DeleteButton,
    LanguageSelect,
    ShareButton,
    ShareModal,
    ShareInput,
    ShareTitle,
    ShareClose,
    Overlay,
    Toast,
    DebugToggleButton
} from '../styles/editorStyles';
import {
    bracketMatchingExtension,
    closeBracketsExtension,
    completionKeymap,
    closeBracketsKeymap
} from '../services/autocompleteService';
import { createAutocompleteConfig, EditorLanguage } from '../services/completion';
import { addRuntimeErrorsToEditor, clearRuntimeErrorsFromEditor, jsLint, htmlLint, cssLint, errorInfoField } from '../services/lintService';
import ErrorStatusBar from './ErrorStatusBar';

// 创建编辑器的辅助函数
const createEditor = (
    element: HTMLElement,
    langExtension: Extension,
    setEditor: React.Dispatch<React.SetStateAction<EditorView | null>>,
    setCode: React.Dispatch<React.SetStateAction<string>>,
    initialContent: string,
    isUpdatingFromState: boolean,
    autocompleteExt?: Extension,
    lintExtension?: Extension | Extension[]
) => {
    const commonExtensions = [
        lineNumbers({
            formatNumber: (lineNo) => lineNo.toString()
        }),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        drawSelection({
            drawRangeCursor: true
        }),
        dropCursor(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        keymap.of([
            indentWithTab,
            ...completionKeymap,
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap
        ]),
        history(),
        syntaxHighlighting(defaultHighlightStyle),
        bracketMatchingExtension,
        closeBracketsExtension,
        // 确保选择功能正常工作和字体优化
        EditorView.theme({
            '&.cm-focused .cm-selectionBackground': {
                backgroundColor: '#b3d4fc !important'
            },
            '.cm-selectionBackground': {
                backgroundColor: '#c8e1ff !important'
            },
            '.cm-content': {
                fontFamily: '"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important',
                fontSize: '13px !important',
                fontWeight: 'normal !important',
                lineHeight: '1.3 !important',
                letterSpacing: '0 !important',
                textRendering: 'auto !important',
                WebkitFontSmoothing: 'auto !important',
                MozOsxFontSmoothing: 'auto !important',
                fontVariantLigatures: 'none !important'
            },
            '.cm-editor .cm-line': {
                fontFamily: '"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important',
                fontSize: '13px !important',
                fontWeight: 'normal !important',
                lineHeight: '1.3 !important',
                letterSpacing: '0 !important'
            },
            '.cm-editor': {
                fontFamily: '"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important'
            },
            '.cm-gutters': {
                fontFamily: '"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important',
                fontSize: '12px !important'
            }
        })
    ];

    const state = EditorState.create({
        doc: initialContent,
        extensions: [
            ...commonExtensions,
            langExtension,
            autocompleteExt || [],
            ...(Array.isArray(lintExtension) ? lintExtension : [lintExtension || []]), // 添加传入的lint扩展
            // 监听编辑器变化，在非程序性更新时同步到React state
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    // 使用setTimeout来确保在下一个事件循环中执行，避免在更新过程中触发状态变化
                    setTimeout(() => {
                        const newContent = update.state.doc.toString();
                        setCode(newContent);
                    }, 0);
                }
            })
        ]
    });
    const view = new EditorView({
        state,
        parent: element
    });
    setEditor(view);
    return view;
};

const Editor: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const params = useParams();
    const [htmlEditor, setHtmlEditor] = useState<EditorView | null>(null);
    const [cssEditor, setCssEditor] = useState<EditorView | null>(null);
    const [jsEditor, setJsEditor] = useState<EditorView | null>(null);
    const [title, setTitle] = useState('Untitled');
    const [currentPen, setCurrentPen] = useState<Pen | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [userPens, setUserPens] = useState<Pen[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    // 导入其他 pen 的 state
    const [importedCssPenIds, setImportedCssPenIds] = useState<string[]>([]);
    const [importedJsPenIds, setImportedJsPenIds] = useState<string[]>([]);
    const [showCssImportPanel, setShowCssImportPanel] = useState(false);
    const [showJsImportPanel, setShowJsImportPanel] = useState(false);
    const [draggedCssIndex, setDraggedCssIndex] = useState<number | null>(null);
    const [draggedJsIndex, setDraggedJsIndex] = useState<number | null>(null);

    // Debug functionality
    const [debugEnabled, setDebugEnabled] = useState(false);
    const debugManagerRef = useRef<DebugManager>(new DebugManager());

    // 添加一个标志来防止在保存过程中重新加载 Pen
    const [isSavingPen, setIsSavingPen] = useState(false);

    // State to hold the content for the preview
    const [htmlCode, setHtmlCode] = useState('<div>Hello World</div>'); // Initialize with default HTML
    const [cssCode, setCssCode] = useState('body { color: blue; }'); // Initialize with default CSS
    const [jsCode, setJsCode] = useState('console.log("Hello World");'); // Initialize with default JS
    const [cssLanguage, setCssLanguage] = useState<'css' | 'scss' | 'less'>('css');
    const { jsLanguage, setJsLanguage } = useLanguage();
    const [compiledCss, setCompiledCss] = useState('body { color: blue; }'); // 初始化为默认CSS
    const [compiledJs, setCompiledJs] = useState('console.log("Hello World");'); // 初始化为默认JS

    // Preview 防抖：300ms 内连续输入只触发一次预览更新
    const [debouncedHtml, setDebouncedHtml] = useState('<div>Hello World</div>');
    const [debouncedMergedCss, setDebouncedMergedCss] = useState('body { color: blue; }');
    const [debouncedMergedJs, setDebouncedMergedJs] = useState('console.log("Hello World");');
    const [jsCompilationError, setJsCompilationError] = useState<string>('');
    const [tsCompilerLoaded, setTSCompilerLoaded] = useState(false);

    // 添加一个标志来跟踪是否是程序性更新
    const [isUpdatingFromState, setIsUpdatingFromState] = useState(false);

    // 使用ref来跟踪语言变化，避免编辑器初始化时使用过时的内容
    const languageChangeRef = useRef({ cssLanguage, jsLanguage });
    const [shouldReinitializeEditors, setShouldReinitializeEditors] = useState(false);
    const [isPenLoaded, setIsPenLoaded] = useState(false); // 添加状态跟踪Pen是否已加载

    // 静态错误状态
    const [hasStaticErrors, setHasStaticErrors] = useState(false);
    const [jsErrorCount, setJsErrorCount] = useState(0);
    const [jsWarningCount, setJsWarningCount] = useState(0);

    // 检查静态错误（如lint）
    const checkStaticErrors = useCallback(() => {
        if (!jsEditor) return;
        try {
            const errors = jsEditor.state.field(errorInfoField, false) ?? [];
            const staticErrors = errors.filter(e => e.source === 'static');
            const hasError = staticErrors.length > 0;
            const previousHasStaticErrors = hasStaticErrors;
            setHasStaticErrors(hasError);
            setJsErrorCount(errors.filter(e => e.type === 'error').length);
            setJsWarningCount(errors.filter(e => e.type === 'warning').length);

            if (previousHasStaticErrors !== hasError) {
                clearRuntimeErrorsFromEditor(jsEditor);
            }
        } catch (e) {
            setHasStaticErrors(false);
        }
    }, [jsEditor, hasStaticErrors]);

    // 运行时错误处理（静态错误优先）
    const handleRuntimeError = useCallback((errors: Array<{
        line: number;
        column: number;
        message: string;
        severity: 'error' | 'warning';
    }>) => {
        if (jsEditor) {
            if (!hasStaticErrors) {
                if (errors.length > 0) {
                    addRuntimeErrorsToEditor(jsEditor, errors);
                } else {
                    clearRuntimeErrorsFromEditor(jsEditor);
                }
            } else {
                // 有静态错误时，始终清除运行时错误高亮
                clearRuntimeErrorsFromEditor(jsEditor);
            }
        }
    }, [jsEditor, hasStaticErrors]);

    // 编辑器内容变化时，先检测静态错误
    useEffect(() => {
        if (jsEditor) {
            checkStaticErrors();
        }
    }, [jsEditor, jsCode, checkStaticErrors]);

    // 导入 pen 的辅助函数
    const toggleCssPen = (penId: string) => {
        setImportedCssPenIds(prev =>
            prev.includes(penId)
                ? prev.filter(id => id !== penId)
                : [...prev, penId]
        );
    };

    const toggleJsPen = (penId: string) => {
        setImportedJsPenIds(prev =>
            prev.includes(penId)
                ? prev.filter(id => id !== penId)
                : [...prev, penId]
        );
    };

    const clearAllCssImports = () => setImportedCssPenIds([]);
    const clearAllJsImports = () => setImportedJsPenIds([]);

    const importAllCss = () => {
        const availablePens = userPens.filter(p => !currentPen || p.id !== currentPen.id);
        setImportedCssPenIds(availablePens.map(p => p.id));
    };

    const importAllJs = () => {
        const availablePens = userPens.filter(p => !currentPen || p.id !== currentPen.id);
        setImportedJsPenIds(availablePens.map(p => p.id));
    };

    // 拖拽排序功能
    const handleCssDragStart = (e: React.DragEvent, index: number) => {
        setDraggedCssIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleCssDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleCssDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedCssIndex === null || draggedCssIndex === dropIndex) return;

        const newOrder = [...importedCssPenIds];
        const draggedItem = newOrder[draggedCssIndex];
        newOrder.splice(draggedCssIndex, 1);
        newOrder.splice(dropIndex, 0, draggedItem);

        setImportedCssPenIds(newOrder);
        setDraggedCssIndex(null);
    };

    const handleJsDragStart = (e: React.DragEvent, index: number) => {
        setDraggedJsIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleJsDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleJsDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedJsIndex === null || draggedJsIndex === dropIndex) return;

        const newOrder = [...importedJsPenIds];
        const draggedItem = newOrder[draggedJsIndex];
        newOrder.splice(draggedJsIndex, 1);
        newOrder.splice(dropIndex, 0, draggedItem);

        setImportedJsPenIds(newOrder);
        setDraggedJsIndex(null);
    };

    // 上移下移功能
    const moveCssUp = (index: number) => {
        if (index === 0) return;
        const newOrder = [...importedCssPenIds];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setImportedCssPenIds(newOrder);
    };

    const moveCssDown = (index: number) => {
        if (index === importedCssPenIds.length - 1) return;
        const newOrder = [...importedCssPenIds];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setImportedCssPenIds(newOrder);
    };

    const moveJsUp = (index: number) => {
        if (index === 0) return;
        const newOrder = [...importedJsPenIds];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setImportedJsPenIds(newOrder);
    };

    const moveJsDown = (index: number) => {
        if (index === importedJsPenIds.length - 1) return;
        const newOrder = [...importedJsPenIds];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setImportedJsPenIds(newOrder);
    };

    // 计算合并后的 CSS/JS
    const mergedCss = useMemo(() => [
        ...userPens.filter(p => importedCssPenIds.includes(p.id)).sort((a, b) => {
            return importedCssPenIds.indexOf(a.id) - importedCssPenIds.indexOf(b.id);
        }).map(p => p.css),
        compiledCss
    ].join('\n\n'), [userPens, importedCssPenIds, compiledCss]);
    const mergedJs = useMemo(() => {
        const compiledImportedJs = userPens
            .filter(p => importedJsPenIds.includes(p.id))
            .sort((a, b) => {
                return importedJsPenIds.indexOf(a.id) - importedJsPenIds.indexOf(b.id);
            })
            .map(p => {
                const penJsLanguage = p.jsLanguage || 'js';

                if (penJsLanguage === 'react') {
                    try {
                        const Babel = (window as any).Babel;
                        if (Babel) {
                            const result = Babel.transform(p.js, {
                                presets: [
                                    ["env", { targets: "defaults" }],
                                    ["react", { runtime: "classic" }]
                                ],
                                plugins: [],
                            });
                            return result.code || p.js;
                        }
                    } catch (error) {
                        console.warn('Failed to compile imported React code:', error);
                    }
                }

                if (penJsLanguage === 'ts') {
                    try {
                        const ts = (window as any).ts;
                        if (ts) {
                            const result = ts.transpileModule(p.js, {
                                compilerOptions: {
                                    module: ts.ModuleKind.ESNext,
                                    target: ts.ScriptTarget.ES2020,
                                    jsx: ts.JsxEmit.Preserve,
                                    strict: false,
                                    esModuleInterop: true,
                                    allowSyntheticDefaultImports: true,
                                    skipLibCheck: true
                                }
                            });
                            return result.outputText || p.js;
                        }
                    } catch (error) {
                        console.warn('Failed to compile imported TypeScript code:', error);
                    }
                }

                return p.js;
            });

        return [...compiledImportedJs, compiledJs].join('\n\n');
    }, [userPens, importedJsPenIds, compiledJs]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedHtml(htmlCode), 300);
        return () => clearTimeout(t);
    }, [htmlCode]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedMergedCss(mergedCss), 300);
        return () => clearTimeout(t);
    }, [mergedCss]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedMergedJs(mergedJs), 300);
        return () => clearTimeout(t);
    }, [mergedJs]);

    const fetchUserPens = useCallback(async () => {
        try {
            const pens = await getUserPens();
            setUserPens(pens);
        } catch (error) {
            console.error('Failed to fetch user pens:', error);
        }
    }, []);

    const initializeNewPen = useCallback(() => {
        console.log('🔧 initializeNewPen called');
        setTitle('Untitled');
        setCurrentPen(null);

        // 重置语言为默认值
        setCssLanguage('css');
        setJsLanguage('js');

        // 使用默认的JavaScript代码，不依赖当前语言状态
        const defaultHtml = '<div id="app">Hello World</div>';
        const defaultCss = 'body { color: blue; }';
        const defaultJs = 'console.log("Hello World");';

        setHtmlCode(defaultHtml);
        setCssCode(defaultCss);
        setJsCode(defaultJs);

        // 同时初始化编译后的代码
        setCompiledCss(defaultCss); // CSS默认直接使用
        setCompiledJs(defaultJs);   // JS默认直接使用，因为默认代码不需要编译

        setIsPenLoaded(true); // 标记Pen已初始化
        console.log('🔧 isPenLoaded set to true (initializeNewPen)');

    }, []); // 不依赖任何外部状态

    // 当语言改变时，如果是新建状态，更新默认代码
    useEffect(() => {
        // 如果正在保存，不要更新默认代码
        if (isSavingPen) return;

        if (!currentPen && isPenLoaded) {
            // 只有在新建状态且Pen已加载完成时才更新默认代码
            // 这样可以避免在初始化时自动更新代码
            const defaultJs = jsLanguage === 'react'
                ? 'function App() {\n  return <h1>Hello React!</h1>;\n}\n\nconst root = ReactDOM.createRoot(document.getElementById("app"));\nwindow.reactRoot = root;\nroot.render(<App />);'
                : jsLanguage === 'vue'
                    ? 'const { createApp } = Vue;\n\nconst component = {\n  setup() {\n    return {\n      message: "Hello Vue!"\n    };\n  },\n  template: `<h1>{{ message }}</h1>`\n};\n\nconst app = createApp(component);\nwindow.vueApp = app;\napp.mount("#app");'
                    : jsLanguage === 'ts'
                        ? 'console.log("Hello TypeScript!");'
                        : 'console.log("Hello World");';

            setJsCode(defaultJs);
        }
    }, [jsLanguage, currentPen, isPenLoaded, isSavingPen]);

    // 监听语言变化，标记需要重新初始化编辑器
    useEffect(() => {
        if (languageChangeRef.current.cssLanguage !== cssLanguage ||
            languageChangeRef.current.jsLanguage !== jsLanguage) {
            languageChangeRef.current = { cssLanguage, jsLanguage };
            setShouldReinitializeEditors(true);
        }
    }, [cssLanguage, jsLanguage]);

    // 加载单个Pen的函数（仿照handleLoadPen的逻辑）
    const loadPenById = useCallback(async (penId: string, updateCode: boolean = true) => {
        try {
            const pen = await getPen(penId);

            setCurrentPen(pen);
            setTitle(pen.title);

            // 只有在需要更新代码时才更新
            if (updateCode) {
                // 更新React state，useEffect会自动同步到编辑器
                setHtmlCode(pen.html);
                setCssCode(pen.css);
                setJsCode(pen.js);
            }

            // 加载语言选择（如果保存了的话）
            if (pen.cssLanguage) setCssLanguage(pen.cssLanguage);
            if (pen.jsLanguage) {
                setJsLanguage(pen.jsLanguage);
            }

            // 加载导入的 Pen ID
            if (pen.importedCssPenIds) setImportedCssPenIds(pen.importedCssPenIds);
            if (pen.importedJsPenIds) setImportedJsPenIds(pen.importedJsPenIds);

            // 标记Pen已加载完成
            setIsPenLoaded(true);
            // console.log(pen.cssLanguage)
            // console.log(pen.jsLanguage)
        } catch (error) {
            console.error('Failed to load pen by ID:', error);
            // 如果加载失败，显示默认内容
            initializeNewPen();
            setIsPenLoaded(true);
        }
    }, [initializeNewPen]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchUserPens();
    }, [isAuthenticated, navigate, fetchUserPens]);

    // 处理URL参数，加载对应的Pen
    useEffect(() => {
        console.log('🔧 useEffect [params.id, userPens.length, loadPenById, initializeNewPen, isSavingPen, currentPen] fired', {
            paramsId: params.id,
            userPensLength: userPens.length,
            isSavingPen,
            currentPenId: currentPen?.id
        });
        if (isSavingPen) return;

        const penId = params.id;
        if (penId && userPens.length > 0) {
            // 确保userPens已经加载完成再加载具体的pen
            // 但是，如果currentPen已经存在且ID匹配，就不要重新加载
            if (!currentPen || currentPen.id !== penId) {
                console.log('🔧 loadPenById will be called', { penId });
                loadPenById(penId, true);
            } else {
                console.log('🔧 currentPen already matches penId, skip loadPenById');
            }
        } else if (!penId) {
            console.log('🔧 No penId, will call initializeNewPen');
            initializeNewPen();
        }
    }, [params.id, userPens.length, loadPenById, initializeNewPen, isSavingPen, currentPen]);

    // 统一的编辑器初始化逻辑
    useEffect(() => {
        // 如果正在保存，不要重新初始化编辑器
        if (isSavingPen) return;

        // 只有在Pen加载完成或需要重新初始化时才创建编辑器
        if (!isPenLoaded && !shouldReinitializeEditors) return;

        const htmlElement = document.getElementById('html-editor');
        const cssElement = document.getElementById('css-editor');
        const jsElement = document.getElementById('js-editor');

        if (!htmlElement || !cssElement || !jsElement) return;

        // 清理现有编辑器
        if (htmlEditor) {
            htmlEditor.destroy();
            setHtmlEditor(null);
        }
        if (cssEditor) {
            cssEditor.destroy();
            setCssEditor(null);
        }
        if (jsEditor) {
            jsEditor.destroy();
            setJsEditor(null);
        }

        // 清空容器
        htmlElement.innerHTML = '';
        cssElement.innerHTML = '';
        jsElement.innerHTML = '';

        // 设置标志，表示即将进行程序性更新
        setIsUpdatingFromState(true);

        // 创建新编辑器
        // 创建HTML编辑器，同时使用自动完成和lint扩展
        createEditor(
            htmlElement,
            html(),
            setHtmlEditor,
            setHtmlCode,
            htmlCode,
            true,
            createAutocompleteConfig('html'),
            htmlLint
        );

        // 创建CSS编辑器，同时使用自动完成和lint扩展
        createEditor(
            cssElement,
            css(),
            setCssEditor,
            setCssCode,
            cssCode,
            true,
            createAutocompleteConfig(cssLanguage as EditorLanguage),
            cssLint
        );

        let jsExtension;
        switch (jsLanguage) {
            case 'react':
                jsExtension = javascript({ jsx: true, typescript: true });
                break;
            case 'vue':
                jsExtension = vue();
                break;
            case 'ts':
                jsExtension = javascript({ typescript: true });
                break;
            case 'js':
            default:
                jsExtension = javascript();
                break;
        }

        // 创建JavaScript编辑器，同时使用运行时错误扩展和静态lint扩展
        const tsLanguageMap: Record<string, 'js' | 'ts' | 'tsx'> = {
            js: 'js',
            react: 'tsx',
            vue: 'ts',
            ts: 'ts',
        };
        const tsLang = tsLanguageMap[jsLanguage] || 'js';
        createEditor(
            jsElement,
            jsExtension,
            setJsEditor,
            setJsCode,
            jsCode,
            true,
            createAutocompleteConfig(jsLanguage as EditorLanguage, {
                fileName: '/src/index.' + (tsLang === 'tsx' ? 'tsx' : tsLang === 'ts' ? 'ts' : 'js'),
                language: tsLang,
            }),
            jsLint // jsLint 已包含 errorInfoField、errorDecorationField、gutter、tooltip 等所有扩展
        );

        // 延迟重置isUpdatingFromState标志，确保编辑器完全初始化
        setTimeout(() => {
            setIsUpdatingFromState(false);
        }, 100);

        // 重置重新初始化标志
        if (shouldReinitializeEditors) {
            setShouldReinitializeEditors(false);
        }

        return () => {
            if (htmlEditor) htmlEditor.destroy();
            if (cssEditor) cssEditor.destroy();
            if (jsEditor) jsEditor.destroy();
        };
    }, [shouldReinitializeEditors, jsLanguage, cssLanguage, isPenLoaded, isSavingPen]); // 统一的依赖项

    // 当React state变化时，同步更新编辑器内容（不重建编辑器）
    useEffect(() => {
        // 只有当编辑器都存在，且不是正在更新状态时才同步
        if (htmlEditor && cssEditor && jsEditor && !isUpdatingFromState) {
            const currentHtml = htmlEditor.state.doc.toString();
            const currentCss = cssEditor.state.doc.toString();
            const currentJs = jsEditor.state.doc.toString();

            // 只有当内容真的不同时才更新（避免重复更新）
            if (currentHtml !== htmlCode) {
                htmlEditor.dispatch({
                    changes: {
                        from: 0,
                        to: htmlEditor.state.doc.length,
                        insert: htmlCode
                    }
                });
            }

            if (currentCss !== cssCode) {
                cssEditor.dispatch({
                    changes: {
                        from: 0,
                        to: cssEditor.state.doc.length,
                        insert: cssCode
                    }
                });
            }

            if (currentJs !== jsCode) {
                jsEditor.dispatch({
                    changes: {
                        from: 0,
                        to: jsEditor.state.doc.length,
                        insert: jsCode
                    }
                });
            }
        }
    }, [htmlCode, cssCode, jsCode, htmlEditor, cssEditor, jsEditor, isUpdatingFromState]);

    // 编译 JavaScript 框架代码
    const compileJs = useCallback(async (code: string, language: 'js' | 'react' | 'vue' | 'ts') => {
        try {
            // 对于TypeScript，需要等待编译器加载完成
            if (language === 'ts' && !tsCompilerLoaded) {
                console.log('Waiting for TypeScript compiler to load...');
                return code; // 返回原始代码，等待编译器加载
            }

            const result = await compileJsFramework(code, language);

            if (result.error) {
                console.error('Compilation error:', result.error);
                return code; // Return original code if compilation fails
            }
            return result.code;
        } catch (error) {
            console.error(`Error compiling ${language}:`, error);
            return code;
        }
    }, [tsCompilerLoaded]);

    // 当 CSS 代码或语言改变时重新编译
    useEffect(() => {
        if (cssLanguage !== 'css') {
            compileCssFramework(cssCode, cssLanguage).then(result => {
                if (result.error) {
                    console.error('CSS compilation error:', result.error);
                    setCompiledCss(cssCode); // 出错时使用原始代码
                } else {
                    setCompiledCss(result.code);
                }
            });
        } else {
            setCompiledCss(cssCode);
        }
    }, [cssCode, cssLanguage, cssEditor]);

    // 当 JS 代码或语言改变时重新编译
    useEffect(() => {
        console.log('🔧 Compilation Debug - Triggering JS compilation:', {
            jsCode,
            jsLanguage,
            codeLength: jsCode.length
        });
        compileJs(jsCode, jsLanguage).then(result => {
            console.log('🔧 Compilation Debug - JS compilation result:', {
                resultCode: result,
                resultLength: result.length
            });
            setCompiledJs(result);
        });
    }, [jsCode, jsLanguage, compileJs]);

    // 当TypeScript编译器加载完成后，重新编译代码
    useEffect(() => {
        if (tsCompilerLoaded && jsLanguage === 'ts') {
            compileJs(jsCode, jsLanguage).then(setCompiledJs);
        }
    }, [tsCompilerLoaded, jsCode, jsLanguage, compileJs]);

    // 移除错误高亮的useEffect，现在由CodeMirror自动处理

    // 加载 TypeScript 编译器
    useEffect(() => {
        loadTypeScriptCompiler()
            .then(() => {
                console.log('TypeScript compiler loaded successfully');
                setTSCompilerLoaded(true);
            })
            .catch(error => {
                console.error('Failed to load TypeScript compiler:', error);
                // 即使加载失败，也设置为true，避免无限等待
                setTSCompilerLoaded(true);
            });
    }, []);

    // 检测内容是否有变化
    const checkForChanges = useCallback(() => {
        if (!currentPen) {
            // 新建状态下，如果内容不是默认内容，则认为有变化
            // 使用与 initializeNewPen 相同的默认值
            const defaultHtml = '<div id="app">Hello World</div>';
            const defaultCss = 'body { color: blue; }';
            const defaultJs = 'console.log("Hello World");';

            const hasChanges =
                htmlCode !== defaultHtml ||
                cssCode !== defaultCss ||
                jsCode !== defaultJs ||
                title !== 'Untitled' ||
                cssLanguage !== 'css' ||
                jsLanguage !== 'js';
            setHasUnsavedChanges(hasChanges);
        } else {
            // 编辑状态下，比较当前内容与保存的内容
            const hasChanges =
                htmlCode !== currentPen.html ||
                cssCode !== currentPen.css ||
                jsCode !== currentPen.js ||
                title !== currentPen.title ||
                cssLanguage !== (currentPen.cssLanguage || 'css') ||
                jsLanguage !== (currentPen.jsLanguage || 'js');
            setHasUnsavedChanges(hasChanges);
        }
    }, [htmlCode, cssCode, jsCode, title, cssLanguage, jsLanguage, currentPen]);

    // 监听内容变化
    useEffect(() => {
        checkForChanges();
    }, [checkForChanges]);

    // 监听 currentPen 变化，用于调试
    useEffect(() => {
        console.log('🔧 CurrentPen Debug - currentPen changed:', currentPen);
    }, [currentPen]);

    // 页面关闭/刷新时的提示
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
                return '您有未保存的更改，确定要离开吗？';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleSave = async () => {
        if (isSaving) return;

        setIsSaving(true);
        setIsSavingPen(true); // 设置保存标志
        try {
            const penData = {
                title,
                html: htmlCode,
                css: cssCode,
                js: jsCode,
                cssLanguage,
                jsLanguage,
                importedCssPenIds,
                importedJsPenIds
            };

            if (currentPen) {
                // 更新现有的 Pen
                await updatePen(currentPen.id, penData);
                setCurrentPen(prev => prev ? { ...prev, ...penData } : null);
            } else {
                // 创建新的 Pen
                const newPen = await createPen(penData);
                console.log('🔧 Save Debug - Created new pen:', newPen);
                setCurrentPen(newPen);
                // 用navigate替换URL，确保React Router同步
                navigate(`/editor/${newPen.id}`, { replace: true });
                console.log('🔧 Save Debug - Updated URL to:', `/editor/${newPen.id}`);
            }

            setSaveSuccess(true);
            setHasUnsavedChanges(false);

            // 延迟获取用户的 Pen 列表，确保保存标志在获取完成后才重置
            setTimeout(async () => {
                try {
                    const pens = await getUserPens();
                    setUserPens(pens);
                } catch (error) {
                    console.error('Failed to fetch user pens after save:', error);
                } finally {
                    setIsSavingPen(false); // 在获取完成后重置保存标志
                }
            }, 100);

            // 3秒后重置保存成功状态
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Save failed:', error);
            setIsSavingPen(false); // 出错时也要重置保存标志
        } finally {
            setIsSaving(false);
        }
    };

    const handleNew = useCallback(() => {
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm('您有未保存的更改，确定要创建新的 Pen 吗？');
            if (!confirmLeave) return;
        }
        setIsPenLoaded(false); // 重置加载标志
        initializeNewPen();
        setHasUnsavedChanges(false);
    }, [initializeNewPen, hasUnsavedChanges]);

    const handleDelete = async () => {
        if (!currentPen || isDeleting) return;

        const confirmDelete = window.confirm(`确定要删除 "${currentPen.title}" 吗？此操作无法撤销。`);
        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            await deletePen(currentPen.id);
            // 删除成功后，重新获取用户的pen列表，但不触发URL相关的useEffect
            const pens = await getUserPens();
            setUserPens(pens);
            // 重置为新建状态
            initializeNewPen();
        } catch (error) {
            console.error('Delete error:', error);
            alert('删除失败，请重试');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBackToHome = () => {
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm('您有未保存的更改，确定要离开吗？');
            if (!confirmLeave) return;
        }
        navigate('/pens');
    };

    const handleLoadPen = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm('您有未保存的更改，确定要切换到其他 Pen 吗？');
            if (!confirmLeave) {
                // 重置选择框到当前pen
                e.target.value = currentPen?.id.toString() || '';
                return;
            }
        }

        const penId = e.target.value;

        if (!penId) {
            // 选择了"New Pen"选项
            handleNew();
            // 更新URL为编辑器根路径
            navigate('/editor', { replace: true });
            return;
        }

        const selectedPen = userPens.find(pen => pen.id === penId);

        if (selectedPen) {
            // 先更新URL，这会触发useEffect加载pen
            navigate(`/editor/${selectedPen.id}`, { replace: true });
        } else {
            handleNew();
            // 更新URL为编辑器根路径
            navigate('/editor', { replace: true });
        }
    };

    const handleShare = () => {
        if (!currentPen) return;
        const url = `${window.location.origin}/p/${currentPen.id}`;
        setShareUrl(url);
        setShowShareModal(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setToastMessage('链接已复制到剪贴板！');
        setShowToast(true);
        setShowShareModal(false);
        setTimeout(() => {
            setShowToast(false);
        }, 2000);
    };

    // 处理CSS语言切换
    const handleCssLanguageChange = (newLanguage: 'css' | 'scss' | 'less') => {
        setCssLanguage(newLanguage);
        // 标记需要重新初始化编辑器
        setShouldReinitializeEditors(true);
    };

    // 处理JavaScript语言切换
    const handleJsLanguageChange = (newLanguage: 'js' | 'react' | 'vue' | 'ts') => {
        console.log('🔧 Language Change Debug - Switching to:', newLanguage);
        setJsLanguage(newLanguage);

        // 如果是新建状态且当前代码是默认代码，则更新默认代码
        if (!currentPen) {
            const currentHtml = htmlEditor?.state.doc.toString() || htmlCode;
            const currentCss = cssEditor?.state.doc.toString() || cssCode;
            const currentJs = jsEditor?.state.doc.toString() || jsCode;

            console.log('🔧 Language Change Debug - Current content:', {
                html: currentHtml,
                css: currentCss,
                js: currentJs
            });

            // 检查是否是默认代码
            const isDefaultHtml = currentHtml === '<div id="app">Hello World</div>' ||
                currentHtml === '<div id="app"></div>';
            const isDefaultCss = currentCss === 'body { color: blue; }' ||
                currentCss === 'body {\n  font-family: -apple-system, BlinkMacSystemFont, sans-serif;\n  margin: 0;\n  padding: 20px;\n}';
            const isDefaultJs = currentJs === 'console.log("Hello World");' ||
                currentJs === 'function App() {\n  return <h1>Hello React!</h1>;\n}\n\nconst root = ReactDOM.createRoot(document.getElementById("app"));\nroot.render(<App />);' ||
                currentJs === 'const { createApp } = Vue;\n\nconst component = {\n  setup() {\n    return {\n      message: "Hello Vue!"\n    };\n  },\n  template: `<h1>{{ message }}</h1>`\n};\n\ncreateApp(component).mount("#app");' ||
                currentJs === 'function App() {\n  return <h1>Hello React!</h1>;\n}\n\nconst root = ReactDOM.createRoot(document.getElementById("app"));\nwindow.reactRoot = root;\nroot.render(<App />);' ||
                currentJs === 'const { createApp } = Vue;\n\nconst component = {\n  setup() {\n    return {\n      message: "Hello Vue!"\n    };\n  },\n  template: `<h1>{{ message }}</h1>`\n};\n\nconst app = createApp(component);\nwindow.vueApp = app;\napp.mount("#app");' ||
                currentJs === 'console.log("Hello TypeScript!");';

            console.log('🔧 Language Change Debug - Is default code:', {
                isDefaultHtml,
                isDefaultCss,
                isDefaultJs
            });

            if (isDefaultJs) {
                const defaultJs = newLanguage === 'react'
                    ? 'function App() {\n  return <h1>Hello React!</h1>;\n}\n\nconst root = ReactDOM.createRoot(document.getElementById("app"));\nroot.render(<App />);'
                    : newLanguage === 'vue'
                        ? 'const { createApp } = Vue;\n\nconst component = {\n  setup() {\n    return {\n      message: "Hello Vue!"\n    };\n  },\n  template: `<h1>{{ message }}</h1>`\n};\n\ncreateApp(component).mount("#app");'
                        : newLanguage === 'ts'
                            ? 'console.log("Hello TypeScript!");'
                            : 'console.log("Hello World");';

                console.log('🔧 Language Change Debug - Setting default JS code:', defaultJs);
                setJsCode(defaultJs);
                setCompiledJs(defaultJs);

                if (isDefaultJs || isDefaultHtml || isDefaultCss) {
                    // 获取新语言对应的默认代码
                    const getNewDefaultHtml = () => {
                        switch (newLanguage) {
                            case 'react':
                            case 'vue':
                                return '<div id="app"></div>';
                            default:
                                return '<div id="app">Hello World</div>';
                        }
                    };

                    const getNewDefaultCss = () => {
                        switch (newLanguage) {
                            case 'react':
                            case 'vue':
                                return 'body {\n  font-family: -apple-system, BlinkMacSystemFont, sans-serif;\n  margin: 0;\n  padding: 20px;\n}';
                            default:
                                return 'body { color: blue; }';
                        }
                    };

                    const getNewDefaultJs = () => {
                        switch (newLanguage) {
                            case 'react':
                                return 'function App() {\n  return <h1>Hello React!</h1>;\n}\n\nconst root = ReactDOM.createRoot(document.getElementById("app"));\nwindow.reactRoot = root;\nroot.render(<App />);';
                            case 'vue':
                                return 'const { createApp } = Vue;\n\nconst component = {\n  setup() {\n    return {\n      message: "Hello Vue!"\n    };\n  },\n  template: `<h1>{{ message }}</h1>`\n};\n\nconst app = createApp(component);\nwindow.vueApp = app;\napp.mount("#app");';
                            case 'ts':
                                return 'console.log("Hello TypeScript!");';
                            default:
                                return 'console.log("Hello World");';
                        }
                    };

                    const newDefaultHtml = getNewDefaultHtml();
                    const newDefaultCss = getNewDefaultCss();
                    const newDefaultJs = getNewDefaultJs();

                    console.log('🔧 Language Change Debug - Updating default content:', {
                        newDefaultHtml,
                        newDefaultCss,
                        newDefaultJs
                    });

                    // 只更新是默认内容的部分
                    if (isDefaultHtml) setHtmlCode(newDefaultHtml);
                    if (isDefaultCss) {
                        setCssCode(newDefaultCss);
                        setCompiledCss(newDefaultCss);
                    }
                    if (isDefaultJs) {
                        setJsCode(newDefaultJs);
                        setCompiledJs(newDefaultJs);
                    }
                }
            } else {
                // 如果不是默认代码，但语言切换到了React/Vue，需要确保HTML是空的容器
                if (newLanguage === 'react' || newLanguage === 'vue') {
                    const currentHtml = htmlEditor?.state.doc.toString() || htmlCode;
                    console.log('🔧 Language Change Debug - Non-default code, current HTML:', currentHtml);
                    // 如果HTML不是空的容器，则更新为空的容器
                    if (currentHtml !== '<div id="app"></div>') {
                        console.log('🔧 Language Change Debug - Updating HTML to empty container');
                        setHtmlCode('<div id="app"></div>');
                    } else {
                        console.log('🔧 Language Change Debug - HTML already empty container');
                    }
                }
            }

            // 标记需要重新初始化编辑器
            setShouldReinitializeEditors(true);
        };

        // 标记需要重新初始化编辑器
        setShouldReinitializeEditors(true);
    };

    // Debug toggle handler
    const handleToggleDebug = () => {
        const newState = debugManagerRef.current.toggle();
        setDebugEnabled(newState);
    };

    useEffect(() => {
        console.log('🔧 isPenLoaded changed:', isPenLoaded);
    }, [isPenLoaded]);

    return (
        <PageContainer style={{ height: '100vh', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Global styles={`
               .gutter {
                 background-color: #e1e4e8;
                 background-clip: padding-box;
                 transition: background 0.2s;
                 z-index: 10;
               }
               .gutter.gutter-horizontal {
                 cursor: col-resize;
                 width: 6px;
               }
               .gutter.gutter-vertical {
                 cursor: row-resize;
                 height: 6px;
               }
               .gutter:hover {
                 background-color: #b3d4fc;
               }
            `} />
            {/* 顶部用户信息栏 */}
            <UserNavbar />
            {/* 顶部操作栏 */}
            <EditorHeader>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flex: 1,
                    minWidth: 0,
                    marginRight: '32px'
                }}>
                    <BackButton onClick={handleBackToHome}>
                        <span style={{ fontSize: '16px' }}>←</span>
                        My Pens
                    </BackButton>
                    <EditorTitle
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled"
                    />
                </div>
                <EditorActions>
                    <Select onChange={handleLoadPen} value={currentPen?.id || ''}>
                        <option value="">📁 New Pen</option>
                        {userPens.map(pen => (
                            <option key={pen.id.toString()} value={pen.id.toString()}>{pen.title}</option>
                        ))}
                    </Select>
                    <Button onClick={handleSave} disabled={isSaving || saveSuccess}>
                        {isSaving ? '💾 Saving...' : saveSuccess ? '✅ Saved!' : '💾 Save'}
                    </Button>
                    {currentPen && (
                        <ShareButton onClick={handleShare}>
                            🔗 Share
                        </ShareButton>
                    )}
                    <DeleteButton
                        onClick={handleDelete}
                        disabled={isDeleting || !currentPen}
                        style={{
                            visibility: currentPen ? 'visible' : 'hidden',
                            opacity: currentPen ? 1 : 0,
                            transition: 'opacity 0.3s ease, visibility 0.3s ease'
                        }}
                    >
                        {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete'}
                    </DeleteButton>
                    <DebugToggleButton
                        active={debugEnabled}
                        onClick={handleToggleDebug}
                        title={debugEnabled ? '关闭调试模式' : '开启调试模式'}
                    >
                        🐛 {debugEnabled ? 'ON' : 'OFF'}
                    </DebugToggleButton>
                </EditorActions>
            </EditorHeader>
            {/* 主内容区：左右分为编辑区和预览区 */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
                <Split
                    direction="horizontal"
                    sizes={[50, 50]}
                    minSize={150}
                    gutterSize={6}
                    style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%' }}
                >
                    {/* 左侧编辑区（纵向可拖拽） */}
                    <Split
                        direction="vertical"
                        sizes={[33, 33, 34]}
                        minSize={36}
                        gutterSize={6}
                        style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
                    >
                        {/* HTML 编辑器 */}
                        <div style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                padding: '8px 12px',
                                height: '32px',
                                backgroundColor: '#f8f9fa',
                                borderBottom: '1px solid #e1e4e8',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#586069',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                flexShrink: 0,
                                position: 'sticky',
                                top: 0,
                                zIndex: 10
                            }}>
                                HTML
                            </div>
                            <div id="html-editor" style={{ flex: 1, minHeight: 0, overflow: 'auto' }} />
                        </div>
                        {/* CSS 编辑器 */}
                        <div style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                padding: '8px 12px',
                                height: '32px',
                                backgroundColor: '#f8f9fa',
                                borderBottom: '1px solid #e1e4e8',
                                borderTop: '1px solid #e4e4e4',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#586069',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                flexShrink: 0,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: 0,
                                zIndex: 10
                            }}>
                                <span>CSS</span>
                                <LanguageSelect
                                    value={cssLanguage}
                                    onChange={(e) => handleCssLanguageChange(e.target.value as 'css' | 'scss' | 'less')}
                                >
                                    <option value="css">CSS</option>
                                    <option value="scss">SCSS</option>
                                    <option value="less">LESS</option>
                                </LanguageSelect>
                            </div>
                            <div id="css-editor" style={{ flex: 1, minHeight: 0, overflow: 'auto' }} />
                        </div>
                        {/* JS 编辑器 */}
                        <div style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                padding: '8px 12px',
                                height: '32px',
                                backgroundColor: '#f8f9fa',
                                borderBottom: '1px solid #e1e4e8',
                                borderTop: '1px solid #e4e4e4',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#586069',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                flexShrink: 0,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: 0,
                                zIndex: 10
                            }}>
                                <span>JavaScript</span>
                                <LanguageSelect
                                    value={jsLanguage}
                                    onChange={(e) => handleJsLanguageChange(e.target.value as 'js' | 'react' | 'vue' | 'ts')}
                                >
                                    <option value="js">JavaScript</option>
                                    <option value="react">React</option>
                                    <option value="vue">Vue</option>
                                    <option value="ts">TS</option>
                                </LanguageSelect>
                            </div>

                            <div id="js-editor" style={{ flex: 1, minHeight: 0, overflow: 'auto' }} />
                            <ErrorStatusBar
                                errorCount={jsErrorCount}
                                warningCount={jsWarningCount}
                                onNavigateNext={() => {
                                    if (!jsEditor) return;
                                    const errors = jsEditor.state.field(errorInfoField, false) ?? [];
                                    if (errors.length === 0) return;
                                    const sorted = [...errors].sort((a, b) => a.from - b.from);
                                    const curPos = jsEditor.state.selection.main.head;
                                    const next = sorted.find(e => e.from > curPos) ?? sorted[0];
                                    jsEditor.dispatch({ selection: { anchor: next.from }, scrollIntoView: true });
                                    jsEditor.focus();
                                }}
                            />
                        </div>
                        {/* 导入其他 Pen 的功能区 */}
                        <div style={{
                            padding: '12px',
                            background: '#f8f9fa',
                            borderBottom: '1px solid #e1e4e8',
                            borderTop: '1px solid #e4e4e4'
                        }}>
                            <div style={{
                                fontWeight: 600,
                                fontSize: 13,
                                marginBottom: 8,
                                color: '#24292e',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                <span>📦 导入其他 Pen</span>
                                <div style={{ fontSize: 11, color: '#6a737d' }}>
                                    ({importedCssPenIds.length + importedJsPenIds.length} 个已选)
                                </div>
                            </div>

                            {/* CSS 导入区域 */}
                            <div style={{ marginBottom: 12 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 6
                                }}>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: '#0366d6' }}>
                                        🎨 CSS ({importedCssPenIds.length})
                                    </span>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button
                                            onClick={() => setShowCssImportPanel(!showCssImportPanel)}
                                            style={{
                                                padding: '2px 6px',
                                                fontSize: 11,
                                                border: '1px solid #d1d5da',
                                                borderRadius: 3,
                                                background: showCssImportPanel ? '#0366d6' : 'white',
                                                color: showCssImportPanel ? 'white' : '#586069',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {showCssImportPanel ? '收起' : '选择'}
                                        </button>
                                        {importedCssPenIds.length > 0 && (
                                            <button
                                                onClick={clearAllCssImports}
                                                style={{
                                                    padding: '2px 6px',
                                                    fontSize: 11,
                                                    border: '1px solid #d73a49',
                                                    borderRadius: 3,
                                                    background: 'white',
                                                    color: '#d73a49',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                清空
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* CSS 已选标签 */}
                                {importedCssPenIds.length > 0 && (
                                    <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 11, color: '#6a737d', marginBottom: 4 }}>
                                            优先级顺序（可拖拽调整，越靠前优先级越低）:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {importedCssPenIds.map((penId, index) => {
                                                const pen = userPens.find(p => p.id === penId);
                                                return pen ? (
                                                    <div
                                                        key={penId}
                                                        draggable
                                                        onDragStart={(e) => handleCssDragStart(e, index)}
                                                        onDragOver={handleCssDragOver}
                                                        onDrop={(e) => handleCssDrop(e, index)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: 11,
                                                            background: draggedCssIndex === index ? '#e3f2fd' : '#f8f9fa',
                                                            color: '#24292e',
                                                            borderRadius: 4,
                                                            border: '1px solid #d1d5da',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            cursor: 'grab',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                                                        onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ color: '#6a737d', fontSize: 10 }}>
                                                                #{index + 1}
                                                            </span>
                                                            <span style={{ color: '#0366d6', fontWeight: 500 }}>
                                                                🎨 {pen.title}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <button
                                                                onClick={() => moveCssUp(index)}
                                                                disabled={index === 0}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: index === 0 ? '#d1d5da' : '#586069',
                                                                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                                    fontSize: 12,
                                                                    padding: '2px 4px'
                                                                }}
                                                                title="上移"
                                                            >
                                                                ↑
                                                            </button>
                                                            <button
                                                                onClick={() => moveCssDown(index)}
                                                                disabled={index === importedCssPenIds.length - 1}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: index === importedCssPenIds.length - 1 ? '#d1d5da' : '#586069',
                                                                    cursor: index === importedCssPenIds.length - 1 ? 'not-allowed' : 'pointer',
                                                                    fontSize: 12,
                                                                    padding: '2px 4px'
                                                                }}
                                                                title="下移"
                                                            >
                                                                ↓
                                                            </button>
                                                            <button
                                                                onClick={() => toggleCssPen(penId)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#d73a49',
                                                                    cursor: 'pointer',
                                                                    fontSize: 12,
                                                                    padding: '2px 4px'
                                                                }}
                                                                title="移除"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* CSS 选择面板 */}
                                {showCssImportPanel && (
                                    <div style={{
                                        maxHeight: 120,
                                        overflowY: 'auto',
                                        border: '1px solid #d1d5da',
                                        borderRadius: 4,
                                        background: 'white',
                                        padding: 6
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <button
                                                onClick={importAllCss}
                                                style={{
                                                    fontSize: 10,
                                                    padding: '2px 4px',
                                                    border: '1px solid #28a745',
                                                    borderRadius: 2,
                                                    background: 'white',
                                                    color: '#28a745',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                全选
                                            </button>
                                            <button
                                                onClick={clearAllCssImports}
                                                style={{
                                                    fontSize: 10,
                                                    padding: '2px 4px',
                                                    border: '1px solid #dc3545',
                                                    borderRadius: 2,
                                                    background: 'white',
                                                    color: '#dc3545',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                全不选
                                            </button>
                                        </div>
                                        {userPens.filter(p => !currentPen || p.id !== currentPen.id).map(pen => (
                                            <label
                                                key={pen.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '3px 0',
                                                    cursor: 'pointer',
                                                    fontSize: 11
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={importedCssPenIds.includes(pen.id)}
                                                    onChange={() => toggleCssPen(pen.id)}
                                                    style={{ margin: 0 }}
                                                />
                                                <span style={{
                                                    color: importedCssPenIds.includes(pen.id) ? '#0366d6' : '#586069',
                                                    fontWeight: importedCssPenIds.includes(pen.id) ? 500 : 400
                                                }}>
                                                    {pen.title}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* JS 导入区域 */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 6
                                }}>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: '#f1c40f' }}>
                                        ⚡ JavaScript ({importedJsPenIds.length})
                                    </span>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button
                                            onClick={() => setShowJsImportPanel(!showJsImportPanel)}
                                            style={{
                                                padding: '2px 6px',
                                                fontSize: 11,
                                                border: '1px solid #d1d5da',
                                                borderRadius: 3,
                                                background: showJsImportPanel ? '#f1c40f' : 'white',
                                                color: showJsImportPanel ? 'white' : '#586069',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {showJsImportPanel ? '收起' : '选择'}
                                        </button>
                                        {importedJsPenIds.length > 0 && (
                                            <button
                                                onClick={clearAllJsImports}
                                                style={{
                                                    padding: '2px 6px',
                                                    fontSize: 11,
                                                    border: '1px solid #d73a49',
                                                    borderRadius: 3,
                                                    background: 'white',
                                                    color: '#d73a49',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                清空
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* JS 已选标签 */}
                                {importedJsPenIds.length > 0 && (
                                    <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 11, color: '#6a737d', marginBottom: 4 }}>
                                            优先级顺序（可拖拽调整，越靠前优先级越低）:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {importedJsPenIds.map((penId, index) => {
                                                const pen = userPens.find(p => p.id === penId);
                                                return pen ? (
                                                    <div
                                                        key={penId}
                                                        draggable
                                                        onDragStart={(e) => handleJsDragStart(e, index)}
                                                        onDragOver={handleJsDragOver}
                                                        onDrop={(e) => handleJsDrop(e, index)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: 11,
                                                            background: draggedJsIndex === index ? '#fff8e1' : '#f8f9fa',
                                                            color: '#24292e',
                                                            borderRadius: 4,
                                                            border: '1px solid #d1d5da',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            cursor: 'grab',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                                                        onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ color: '#6a737d', fontSize: 10 }}>
                                                                #{index + 1}
                                                            </span>
                                                            <span style={{ color: '#f1c40f', fontWeight: 500 }}>
                                                                ⚡ {pen.title}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <button
                                                                onClick={() => moveJsUp(index)}
                                                                disabled={index === 0}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: index === 0 ? '#d1d5da' : '#586069',
                                                                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                                    fontSize: 12,
                                                                    padding: '2px 4px'
                                                                }}
                                                                title="上移"
                                                            >
                                                                ↑
                                                            </button>
                                                            <button
                                                                onClick={() => moveJsDown(index)}
                                                                disabled={index === importedJsPenIds.length - 1}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: index === importedJsPenIds.length - 1 ? '#d1d5da' : '#586069',
                                                                    cursor: index === importedJsPenIds.length - 1 ? 'not-allowed' : 'pointer',
                                                                    fontSize: 12,
                                                                    padding: '2px 4px'
                                                                }}
                                                                title="下移"
                                                            >
                                                                ↓
                                                            </button>
                                                            <button
                                                                onClick={() => toggleJsPen(penId)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#d73a49',
                                                                    cursor: 'pointer',
                                                                    fontSize: 12,
                                                                    padding: '2px 4px'
                                                                }}
                                                                title="移除"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* JS 选择面板 */}
                                {showJsImportPanel && (
                                    <div style={{
                                        maxHeight: 120,
                                        overflowY: 'auto',
                                        border: '1px solid #d1d5da',
                                        borderRadius: 4,
                                        background: 'white',
                                        padding: 6
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <button
                                                onClick={importAllJs}
                                                style={{
                                                    fontSize: 10,
                                                    padding: '2px 4px',
                                                    border: '1px solid #28a745',
                                                    borderRadius: 2,
                                                    background: 'white',
                                                    color: '#28a745',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                全选
                                            </button>
                                            <button
                                                onClick={clearAllJsImports}
                                                style={{
                                                    fontSize: 10,
                                                    padding: '2px 4px',
                                                    border: '1px solid #dc3545',
                                                    borderRadius: 2,
                                                    background: 'white',
                                                    color: '#dc3545',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                全不选
                                            </button>
                                        </div>
                                        {userPens.filter(p => !currentPen || p.id !== currentPen.id).map(pen => (
                                            <label
                                                key={pen.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '3px 0',
                                                    cursor: 'pointer',
                                                    fontSize: 11
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={importedJsPenIds.includes(pen.id)}
                                                    onChange={() => toggleJsPen(pen.id)}
                                                    style={{ margin: 0 }}
                                                />
                                                <span style={{
                                                    color: importedJsPenIds.includes(pen.id) ? '#f1c40f' : '#586069',
                                                    fontWeight: importedJsPenIds.includes(pen.id) ? 500 : 400
                                                }}>
                                                    {pen.title}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Split>
                    {/* 右侧预览区 */}
                    <PreviewContainer>
                        {debugEnabled ? (
                            <DebugPreview
                                html={debouncedHtml}
                                css={debouncedMergedCss}
                                js={debouncedMergedJs}
                                jsLanguage={jsLanguage}
                                debugEnabled={debugEnabled}
                            />
                        ) : (
                            <Preview
                                html={debouncedHtml}
                                css={debouncedMergedCss}
                                js={debouncedMergedJs}
                                jsLanguage={jsLanguage}
                                onRuntimeError={handleRuntimeError}
                            />
                        )}
                    </PreviewContainer>
                </Split>
            </div>

            {showShareModal && (
                <>
                    <Overlay onClick={() => setShowShareModal(false)} />
                    <ShareModal>
                        <ShareClose onClick={() => setShowShareModal(false)}>×</ShareClose>
                        <ShareTitle>分享代码片段</ShareTitle>
                        <ShareInput
                            value={shareUrl}
                            readOnly
                            onClick={(e) => e.currentTarget.select()}
                        />
                        <Button onClick={copyToClipboard}>
                            📋 复制链接
                        </Button>
                    </ShareModal>
                </>
            )}
            {showToast && <Toast>{toastMessage}</Toast>}
        </PageContainer>
    );
};

export default Editor;

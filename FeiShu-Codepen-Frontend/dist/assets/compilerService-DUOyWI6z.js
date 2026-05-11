const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/babel-runtime-NlBRrITh.js","assets/vendor-react-CFRVorIX.js","assets/less-runtime-CNc9D0M5.js"])))=>i.map(i=>d[i]);
import{w as Ze,a as Qe,T as er,u as Me,i as rr,h as tr,E as nr,c as or,s as Ae}from"./emotion-styled.browser.esm-BbqDsb-3.js";import{r as B,j as Re,g as sr,d as Ce}from"./vendor-react-CFRVorIX.js";import{p as H,_ as he}from"./index-CQPbsDfg.js";import{H as ir,E as ar}from"./codemirror-Btu511nc.js";var Le={exports:{}},f={};/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var z=typeof Symbol=="function"&&Symbol.for,Se=z?Symbol.for("react.element"):60103,we=z?Symbol.for("react.portal"):60106,oe=z?Symbol.for("react.fragment"):60107,se=z?Symbol.for("react.strict_mode"):60108,ie=z?Symbol.for("react.profiler"):60114,ae=z?Symbol.for("react.provider"):60109,ce=z?Symbol.for("react.context"):60110,be=z?Symbol.for("react.async_mode"):60111,le=z?Symbol.for("react.concurrent_mode"):60111,ue=z?Symbol.for("react.forward_ref"):60112,de=z?Symbol.for("react.suspense"):60113,cr=z?Symbol.for("react.suspense_list"):60120,pe=z?Symbol.for("react.memo"):60115,fe=z?Symbol.for("react.lazy"):60116,lr=z?Symbol.for("react.block"):60121,ur=z?Symbol.for("react.fundamental"):60117,dr=z?Symbol.for("react.responder"):60118,pr=z?Symbol.for("react.scope"):60119;function D(e){if(typeof e=="object"&&e!==null){var r=e.$$typeof;switch(r){case Se:switch(e=e.type,e){case be:case le:case oe:case ie:case se:case de:return e;default:switch(e=e&&e.$$typeof,e){case ce:case ue:case fe:case pe:case ae:return e;default:return r}}case we:return r}}}function Pe(e){return D(e)===le}f.AsyncMode=be;f.ConcurrentMode=le;f.ContextConsumer=ce;f.ContextProvider=ae;f.Element=Se;f.ForwardRef=ue;f.Fragment=oe;f.Lazy=fe;f.Memo=pe;f.Portal=we;f.Profiler=ie;f.StrictMode=se;f.Suspense=de;f.isAsyncMode=function(e){return Pe(e)||D(e)===be};f.isConcurrentMode=Pe;f.isContextConsumer=function(e){return D(e)===ce};f.isContextProvider=function(e){return D(e)===ae};f.isElement=function(e){return typeof e=="object"&&e!==null&&e.$$typeof===Se};f.isForwardRef=function(e){return D(e)===ue};f.isFragment=function(e){return D(e)===oe};f.isLazy=function(e){return D(e)===fe};f.isMemo=function(e){return D(e)===pe};f.isPortal=function(e){return D(e)===we};f.isProfiler=function(e){return D(e)===ie};f.isStrictMode=function(e){return D(e)===se};f.isSuspense=function(e){return D(e)===de};f.isValidElementType=function(e){return typeof e=="string"||typeof e=="function"||e===oe||e===le||e===ie||e===se||e===de||e===cr||typeof e=="object"&&e!==null&&(e.$$typeof===fe||e.$$typeof===pe||e.$$typeof===ae||e.$$typeof===ce||e.$$typeof===ue||e.$$typeof===ur||e.$$typeof===dr||e.$$typeof===pr||e.$$typeof===lr)};f.typeOf=D;Le.exports=f;var fr=Le.exports,Fe=fr,mr={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},vr={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},Ie={};Ie[Fe.ForwardRef]=mr;Ie[Fe.Memo]=vr;var $e=function(r,s){var n=arguments;if(s==null||!tr.call(s,"css"))return B.createElement.apply(void 0,n);var c=n.length,d=new Array(c);d[0]=nr,d[1]=or(r,s);for(var u=2;u<c;u++)d[u]=n[u];return B.createElement.apply(null,d)};(function(e){var r;r||(r=e.JSX||(e.JSX={}))})($e||($e={}));var Ir=Ze(function(e,r){var s=e.styles,n=Qe([s],void 0,B.useContext(er)),c=B.useRef();return Me(function(){var d=r.key+"-global",u=new r.sheet.constructor({key:d,nonce:r.sheet.nonce,container:r.sheet.container,speedy:r.sheet.isSpeedy}),y=!1,l=document.querySelector('style[data-emotion="'+d+" "+n.name+'"]');return r.sheet.tags.length&&(u.before=r.sheet.tags[0]),l!==null&&(y=!0,l.setAttribute("data-emotion",d),u.hydrate([l])),c.current=[u,y],function(){u.flush()}},[r]),Me(function(){var d=c.current,u=d[0],y=d[1];if(y){d[1]=!1;return}if(n.next!==void 0&&rr(r,n.next,!0),u.tags.length){var l=u.tags[u.tags.length-1].nextElementSibling;u.before=l,u.flush()}r.insert("",n,u,!1)},[r,n.name]),null});const yr=Ae.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: white;
`;Ae.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;function gr(e){const r=[],n=e.state.doc.toString();try{new DOMParser().parseFromString(n,"text/html").querySelector("parsererror")&&r.push({from:0,to:n.length,severity:"error",message:"HTML syntax error detected"});const y=n.split(`
`),l=[],v=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);let E=0;y.forEach((x,g)=>{const _=E,O=/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;let S;for(;(S=O.exec(x))!==null;){const h=S[0],$=S[1].toLowerCase(),w=_+S.index,M=w+h.length;if(h.startsWith("</"))if(l.length===0)r.push({from:w,to:M,severity:"error",message:`Unexpected closing tag </${$}>`});else{const L=l[l.length-1];L.tag===$?l.pop():r.push({from:w,to:M,severity:"error",message:`Mismatched closing tag </${$}>, expected </${L.tag}>`})}else!h.endsWith("/>")&&!v.has($)&&l.push({tag:$,line:g+1,from:w})}E+=x.length+1}),l.forEach(x=>{r.push({from:x.from,to:x.from+x.tag.length+2,severity:"error",message:`Unclosed tag <${x.tag}>`})})}catch(c){console.warn("Error in HTML linting:",c)}return r}const jr=({html:e,css:r,js:s,jsLanguage:n="js",onRuntimeError:c})=>{const d=B.useRef(null);B.useEffect(()=>{const l=v=>{var E;((E=v.data)==null?void 0:E.type)==="runtime-error"&&c&&c(v.data.errors)};return window.addEventListener("message",l),()=>window.removeEventListener("message",l)},[c]);const u=B.useRef({html:"",css:"",js:"",jsLanguage:"js"}),y=B.useRef(!1);return B.useEffect(()=>{var x;const l=d.current;if(!l)return;const v=l.contentDocument;if(!v)return;const E=!y.current||u.current.html!==e||u.current.css!==r||u.current.jsLanguage!==n;if(y.current&&u.current.html===e&&u.current.css===r&&u.current.jsLanguage===n&&u.current.js!==s)try{const g=l.contentWindow;if(g&&g.executeUserCode){const _=s.replace(/\/\*[\s\S]*?\*\//g,"").split(`
`).filter(S=>{const h=S.trim();return!h.includes("错误：")&&!h.includes("// 错误")&&!h.includes("/* 错误")&&!h.includes('setTimeout("alert')&&!h.includes('setInterval("alert')&&!h.includes('eval("')&&!h.includes("eval('")&&!h.includes("document.write(")&&!h.includes("检测到危险函数")&&!h.includes("检测到限制的函数")}).join(`
`).replace(/eval\s*\([^)]*\)\s*;?/g,"").replace(/new\s+Function\s*\([^)]*\)\s*;?/g,"").replace(/document\.write\s*\([^)]*\)\s*;?/g,"").replace(/setTimeout\s*\(\s*["'][^"']*["']\s*,\s*\d+\s*\)\s*;?/g,"").replace(/setInterval\s*\(\s*["'][^"']*["']\s*,\s*\d+\s*\)\s*;?/g,"").replace(/alert\s*\([^)]*\)\s*;?/g,"").trim();u.current.js=s;const O=performance.now();g.executeUserCode(_),H.record("preview_incremental_update_ms",performance.now()-O);return}}catch(g){console.warn("Failed incremental update, falling back to full rebuild:",g)}if(E){u.current={html:e,css:r,js:s,jsLanguage:n};try{let g=!1;const _=e.trim();if(_!==""){try{const T=ir.create({doc:e}),m=new ar({state:T,parent:document.createElement("div")});g=gr(m).length>0,m.destroy()}catch(T){console.warn("Error running HTML linter:",T)}if(!g){const T=(_.match(/</g)||[]).length,m=(_.match(/>/g)||[]).length;if(T!==m)g=!0;else{const N=_.split(`
`);for(const X of N){const V=X.trim();if(V.startsWith("<")&&!V.includes(">")){g=!0;break}}}}if(!g){const T=(_.match(/'/g)||[]).length,m=(_.match(/"/g)||[]).length;(T%2!==0||m%2!==0)&&(g=!0)}g||/\s+[a-zA-Z-]+=\s*["'][^"']*$/.test(_)&&(g=!0)}if(g){const T=document.createElement("div");T.innerHTML=e;const m=T.getElementsByTagName("script");for(;m.length>0;)(x=m[0].parentNode)==null||x.removeChild(m[0]);const N=`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  overflow-x: hidden;
                }
                ${r}
              </style>
            </head>
            <body>
              ${T.innerHTML}
            </body>
          </html>
        `,X=performance.now();v.open(),v.write(N),v.close(),H.record("preview_full_rebuild_ms",performance.now()-X);return}let O="";n==="react"?O=`
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
        `:n==="vue"?O=`
          <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
        `:n==="ts"&&(O=`
          <script src="https://cdnjs.cloudflare.com/ajax/libs/typescript/5.3.3/typescript.min.js"><\/script>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
        `),n!=="react"&&(O+=`
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
        `);const S=s.replace(/\/\*[\s\S]*?\*\//g,"").split(`
`).filter(T=>{const m=T.trim();return!m.includes("错误：")&&!m.includes("// 错误")&&!m.includes("/* 错误")&&!m.includes('setTimeout("alert')&&!m.includes('setInterval("alert')&&!m.includes('eval("')&&!m.includes("eval('")&&!m.includes("document.write(")&&!m.includes("检测到危险函数")&&!m.includes("检测到限制的函数")}).join(`
`).replace(/eval\s*\([^)]*\)\s*;?/g,"").replace(/new\s+Function\s*\([^)]*\)\s*;?/g,"").replace(/document\.write\s*\([^)]*\)\s*;?/g,"").replace(/setTimeout\s*\(\s*["'][^"']*["']\s*,\s*\d+\s*\)\s*;?/g,"").replace(/setInterval\s*\(\s*["'][^"']*["']\s*,\s*\d+\s*\)\s*;?/g,"").replace(/alert\s*\([^)]*\)\s*;?/g,"").trim(),h=e.split(`
`),$=r.split(`
`),w=O?O.split(`
`):[],M=6+$.length+1+w.length+1+1+h.length+1,L=S.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$/g,"\\$").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t"),G=`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        ${r}
      </style>
      ${O}
    </head>
    <body>
      ${e}
      <script>
        (function() {
          // 运行时错误捕获系统 - 使用 IIFE 避免变量冲突
          let runtimeErrors = [];
          var jsStartLine = ${M}; // JavaScript代码在HTML文档中的起始行号
          
          // 计算用户代码的实际行号
          function calculateUserCodeLine(htmlLineNumber) {
            return Math.max(1, htmlLineNumber - jsStartLine + 1);
          }
          
          // 捕获全局 JavaScript 错误
          window.onerror = function(message, source, lineno, colno, error) {
            
            // 计算用户代码的实际行号
            var userCodeLine = calculateUserCodeLine(lineno || 1);
            
            // 解析错误信息
            let errorMessage = message;
            if (typeof message === 'string') {
              // 清理错误消息
              errorMessage = message
                .replace(/Uncaught\\s+/i, '')
                .replace(/ReferenceError:\\s*/i, '未定义错误: ')
                .replace(/TypeError:\\s*/i, '类型错误: ')
                .replace(/SyntaxError:\\s*/i, '语法错误: ')
                .replace(/RangeError:\\s*/i, '范围错误: ')
                .replace(/Error:\\s*/i, '错误: ')
                .replace(/is not defined/i, '未定义')
                .replace(/is not a function/i, '不是一个函数')
                .replace(/Cannot read propert(y|ies) of undefined/i, '无法读取未定义的属性')
                .replace(/Cannot read propert(y|ies) of null/i, '无法读取null的属性')
                .replace(/Cannot set propert(y|ies) of undefined/i, '无法设置未定义的属性')
                .replace(/Cannot set propert(y|ies) of null/i, '无法设置null的属性');
            }
            
            var errorObj = {
              line: userCodeLine,
              column: colno || 0,
              message: 'Runtime error: ' + errorMessage,
              severity: 'error'
            };
            
            runtimeErrors.push(errorObj);
            
            // 发送错误到父窗口
            try {
              var messageData = {
                type: 'runtime-error',
                errors: runtimeErrors
              };
              window.parent.postMessage(messageData, '*');
            } catch (e) {
              console.error('Failed to send runtime error to parent:', e);
            }
            
            return true; // 阻止默认错误处理
          };
          
          // 提供增量更新函数
          window.executeUserCode = function(newCode) {
            
            // 清空之前的错误但不发送清除消息（保持错误显示的连续性）
            var previousErrorCount = runtimeErrors.length;
            runtimeErrors = [];
            var executionSuccessful = false;
            
            try {
              // 清理之前的 React 根节点（如果存在）
              if (window.reactRoot) {
                try {
                  window.reactRoot.unmount();
                } catch (e) {
                  // 忽略卸载错误
                }
                window.reactRoot = null;
              }
              
              // 清理之前的 Vue 应用（如果存在）
              if (window.vueApp) {
                try {
                  window.vueApp.unmount();
                } catch (e) {
                  // 忽略卸载错误
                }
                window.vueApp = null;
              }
              
              // 编译代码（如果需要）
              let codeToExecute = newCode;
              
              // 如果是 React 代码，需要编译 JSX
              if ('${n}' === 'react') {
                try {
                  if (window.Babel) {
                    const result = window.Babel.transform(codeToExecute, {
                      presets: [
                        ["env", { targets: "defaults" }],
                        ["react", { runtime: "classic" }]
                      ],
                      plugins: [],
                    });
                    codeToExecute = result.code || codeToExecute;
                  }
                } catch (compileError) {
                  console.warn('Failed to compile React code:', compileError);
                }
              }
              
              // 如果是 TypeScript 代码，需要编译
              if ('${n}' === 'ts') {
                try {
                  if (window.ts) {
                    const result = window.ts.transpileModule(codeToExecute, {
                      compilerOptions: {
                        module: window.ts.ModuleKind.ESNext,
                        target: window.ts.ScriptTarget.ES2020,
                        jsx: window.ts.JsxEmit.Preserve,
                        strict: false,
                        esModuleInterop: true,
                        allowSyntheticDefaultImports: true,
                        skipLibCheck: true
                      }
                    });
                    codeToExecute = result.outputText || codeToExecute;
                    
                    // TypeScript编译后可能还包含JSX，需要进一步用Babel编译
                    if (window.Babel && codeToExecute.includes('React.createElement') || codeToExecute.includes('<')) {
                      try {
                        const babelResult = window.Babel.transform(codeToExecute, {
                          presets: [
                            ["env", { targets: "defaults" }],
                            ["react", { runtime: "classic" }]
                          ],
                          plugins: [],
                        });
                        codeToExecute = babelResult.code || codeToExecute;
                      } catch (babelError) {
                        console.warn('Failed to compile TypeScript JSX with Babel:', babelError);
                      }
                    }
                  }
                } catch (compileError) {
                  console.warn('Failed to compile TypeScript code:', compileError);
                }
              }
              
              eval(codeToExecute);
              executionSuccessful = true;
              
              // 延迟检查是否需要清除错误，避免时序竞争
              setTimeout(function() {
                if (executionSuccessful && previousErrorCount > 0 && runtimeErrors.length === 0) {
                  try {
                    window.parent.postMessage({
                      type: 'runtime-error',
                      errors: []
                    }, '*');
                  } catch (e) {
                    console.warn('Failed to send clear message:', e);
                  }
                }
              }, 50); // 给 window.onerror 足够时间处理
              
            } catch (error) {
              // 直接处理eval错误，解析正确的行号
              var errorLine = 1; // 默认第1行
              
              // 尝试从错误堆栈中解析行号
              if (error.stack) {
                var stackLines = error.stack.split('\\n');
                for (var i = 0; i < stackLines.length; i++) {
                  var line = stackLines[i];
                  // 查找eval中的行号信息：<anonymous>:行号:列号
                  var match = line.match(/<anonymous>:(\\d+):(\\d+)/);
                  if (match) {
                    // 对于eval错误，行号已经是相对于eval代码的，所以直接使用
                    errorLine = parseInt(match[1], 10);
                    break;
                  }
                }
              }
              
              // 直接创建错误对象并发送
              var errorObj = {
                line: errorLine,
                column: 0,
                message: 'Runtime error: ' + (error.message || '未知错误'),
                severity: 'error'
              };
              
              runtimeErrors.push(errorObj);
              
              try {
                window.parent.postMessage({
                  type: 'runtime-error',
                  errors: runtimeErrors
                }, '*');
              } catch (e) {
                console.warn('Failed to send eval error:', e);
              }
            }
          };
          
          // 捕获 Promise 拒绝错误
          window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            
            let errorMessage = 'Unhandled Promise error';
            if (event.reason && event.reason.message) {
              errorMessage = event.reason.message;
            } else if (typeof event.reason === 'string') {
              errorMessage = event.reason;
            }
            
            runtimeErrors.push({
              line: 1,
              column: 0,
              message: 'Promise error: ' + errorMessage,
              severity: 'error'
            });
            
            try {
              window.parent.postMessage({
                type: 'runtime-error',
                errors: runtimeErrors
              }, '*');
            } catch (e) {
              console.warn('Failed to send promise error to parent:', e);
            }
            
            event.preventDefault();
          });
          
          // 初始代码执行 - 编译并执行
          runtimeErrors = []; // 重置错误数组
          
          try {
            // 清理之前的 React 根节点（如果存在）
            if (window.reactRoot) {
              try {
                window.reactRoot.unmount();
              } catch (e) {
                // 忽略卸载错误
              }
              window.reactRoot = null;
            }
            
            // 清理之前的 Vue 应用（如果存在）
            if (window.vueApp) {
              try {
                window.vueApp.unmount();
              } catch (e) {
                // 忽略卸载错误
              }
              window.vueApp = null;
            }
            
            // 编译代码（如果需要）
            let codeToExecute = \`${L}\`;
            
            // 如果是 React 代码，需要编译 JSX
            if ('${n}' === 'react') {
              try {
                if (window.Babel) {
                  const result = window.Babel.transform(codeToExecute, {
                    presets: [
                      ["env", { targets: "defaults" }],
                      ["react", { runtime: "classic" }]
                    ],
                    plugins: [],
                  });
                  codeToExecute = result.code || codeToExecute;
                }
              } catch (compileError) {
                console.warn('Failed to compile React code:', compileError);
              }
            }
            
            // 如果是 TypeScript 代码，需要编译
            if ('${n}' === 'ts') {
              try {
                if (window.ts) {
                  const result = window.ts.transpileModule(codeToExecute, {
                    compilerOptions: {
                      module: window.ts.ModuleKind.ESNext,
                      target: window.ts.ScriptTarget.ES2020,
                      jsx: window.ts.JsxEmit.Preserve,
                      strict: false,
                      esModuleInterop: true,
                      allowSyntheticDefaultImports: true,
                      skipLibCheck: true
                    }
                  });
                  codeToExecute = result.outputText || codeToExecute;
                  
                  // TypeScript编译后可能还包含JSX，需要进一步用Babel编译
                  if (window.Babel && (codeToExecute.includes('React.createElement') || codeToExecute.includes('<'))) {
                    try {
                      const babelResult = window.Babel.transform(codeToExecute, {
                        presets: [
                          ["env", { targets: "defaults" }],
                          ["react", { runtime: "classic" }]
                        ],
                        plugins: [],
                      });
                      codeToExecute = babelResult.code || codeToExecute;
                    } catch (babelError) {
                      console.warn('Failed to compile TypeScript JSX with Babel:', babelError);
                    }
                  }
                }
              } catch (compileError) {
                console.warn('Failed to compile TypeScript code:', compileError);
              }
            }
            
            // 执行编译后的代码
            eval(codeToExecute);
            
          } catch (error) {
            // 直接处理eval错误，解析正确的行号
            var errorLine = 1; // 默认第1行
            
            // 尝试从错误堆栈中解析行号
            if (error.stack) {
              var stackLines = error.stack.split('\\n');
              for (var i = 0; i < stackLines.length; i++) {
                var line = stackLines[i];
                // 查找eval中的行号信息：<anonymous>:行号:列号
                var match = line.match(/<anonymous>:(\\d+):(\\d+)/);
                if (match) {
                  // 对于eval错误，行号已经是相对于eval代码的，所以直接使用
                  errorLine = parseInt(match[1], 10);
                  break;
                }
              }
            }
            
            // 直接创建错误对象并发送
            var errorObj = {
              line: errorLine,
              column: 0,
              message: 'Runtime error: ' + (error.message || '未知错误'),
              severity: 'error'
            };
            
            runtimeErrors.push(errorObj);
            
            try {
              window.parent.postMessage({
                type: 'runtime-error',
                errors: runtimeErrors
              }, '*');
            } catch (e) {
              console.warn('Failed to send eval error:', e);
            }
          }
          
        })(); // 结束 IIFE
      <\/script>
    </body>
  </html>
`,me=performance.now();v.open(),v.write(G),v.close(),H.record("preview_full_rebuild_ms",performance.now()-me)}catch(g){console.error("Preview rendering error:",g)}}},[e,r,s,n]),Re.jsx(yr,{children:Re.jsx("iframe",{ref:d,title:"preview",sandbox:"allow-scripts allow-same-origin allow-modals allow-pointer-lock allow-downloads",style:{width:"100%",height:"100%",border:"none"}})})};var je={exports:{}},hr="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",Sr=hr,wr=Sr;function Ue(){}function Be(){}Be.resetWarningCache=Ue;var br=function(){function e(n,c,d,u,y,l){if(l!==wr){var v=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw v.name="Invariant Violation",v}}e.isRequired=e;function r(){return e}var s={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:r,element:e,elementType:e,instanceOf:r,node:e,objectOf:r,oneOf:r,oneOfType:r,shape:r,exact:r,checkPropTypes:Be,resetWarningCache:Ue};return s.PropTypes=s,s};je.exports=br();var Er=je.exports;const p=sr(Er);var A=typeof window<"u"?window:null,Ee=A===null,Z=Ee?void 0:A.document,P="addEventListener",F="removeEventListener",ve="getBoundingClientRect",K="_a",I="_b",U="_c",te="horizontal",j=function(){return!1},xr=Ee?"calc":["","-webkit-","-moz-","-o-"].filter(function(e){var r=Z.createElement("div");return r.style.cssText="width:"+e+"calc(9px)",!!r.style.length}).shift()+"calc",Ne=function(e){return typeof e=="string"||e instanceof String},ke=function(e){if(Ne(e)){var r=Z.querySelector(e);if(!r)throw new Error("Selector "+e+" did not match a DOM element");return r}return e},C=function(e,r,s){var n=e[r];return n!==void 0?n:s},ne=function(e,r,s,n){if(r){if(n==="end")return 0;if(n==="center")return e/2}else if(s){if(n==="start")return 0;if(n==="center")return e/2}return e},Tr=function(e,r){var s=Z.createElement("div");return s.className="gutter gutter-"+r,s},zr=function(e,r,s){var n={};return Ne(r)?n[e]=r:n[e]=xr+"("+r+"% - "+s+"px)",n},_r=function(e,r){var s;return s={},s[e]=r+"px",s},De=function(e,r){if(r===void 0&&(r={}),Ee)return{};var s=e,n,c,d,u,y,l;Array.from&&(s=Array.from(s));var v=ke(s[0]),E=v.parentNode,x=getComputedStyle?getComputedStyle(E):null,g=x?x.flexDirection:null,_=C(r,"sizes")||s.map(function(){return 100/s.length}),O=C(r,"minSize",100),S=Array.isArray(O)?O:s.map(function(){return O}),h=C(r,"maxSize",1/0),$=Array.isArray(h)?h:s.map(function(){return h}),w=C(r,"expandToMin",!1),M=C(r,"gutterSize",10),L=C(r,"gutterAlign","center"),G=C(r,"snapOffset",30),me=Array.isArray(G)?G:s.map(function(){return G}),T=C(r,"dragInterval",1),m=C(r,"direction",te),N=C(r,"cursor",m===te?"col-resize":"row-resize"),X=C(r,"gutter",Tr),V=C(r,"elementStyle",zr),We=C(r,"gutterStyle",_r);m===te?(n="width",c="clientX",d="left",u="right",y="clientWidth"):m==="vertical"&&(n="height",c="clientY",d="top",u="bottom",y="clientHeight");function q(i,t,o,a){var R=V(n,t,o,a);Object.keys(R).forEach(function(b){i.style[b]=R[b]})}function He(i,t,o){var a=We(n,t,o);Object.keys(a).forEach(function(R){i.style[R]=a[R]})}function Q(){return l.map(function(i){return i.size})}function xe(i){return"touches"in i?i.touches[0][c]:i[c]}function Te(i){var t=l[this.a],o=l[this.b],a=t.size+o.size;t.size=i/this.size*a,o.size=a-i/this.size*a,q(t.element,t.size,this[I],t.i),q(o.element,o.size,this[U],o.i)}function Ge(i){var t,o=l[this.a],a=l[this.b];this.dragging&&(t=xe(i)-this.start+(this[I]-this.dragOffset),T>1&&(t=Math.round(t/T)*T),t<=o.minSize+o.snapOffset+this[I]?t=o.minSize+this[I]:t>=this.size-(a.minSize+a.snapOffset+this[U])&&(t=this.size-(a.minSize+this[U])),t>=o.maxSize-o.snapOffset+this[I]?t=o.maxSize+this[I]:t<=this.size-(a.maxSize-a.snapOffset+this[U])&&(t=this.size-(a.maxSize+this[U])),Te.call(this,t),C(r,"onDrag",j)(Q()))}function ze(){var i=l[this.a].element,t=l[this.b].element,o=i[ve](),a=t[ve]();this.size=o[n]+a[n]+this[I]+this[U],this.start=o[d],this.end=o[u]}function Xe(i){if(!getComputedStyle)return null;var t=getComputedStyle(i);if(!t)return null;var o=i[y];return o===0?null:(m===te?o-=parseFloat(t.paddingLeft)+parseFloat(t.paddingRight):o-=parseFloat(t.paddingTop)+parseFloat(t.paddingBottom),o)}function _e(i){var t=Xe(E);if(t===null||S.reduce(function(b,k){return b+k},0)>t)return i;var o=0,a=[],R=i.map(function(b,k){var W=t*b/100,ee=ne(M,k===0,k===i.length-1,L),re=S[k]+ee;return W<re?(o+=re-W,a.push(0),re):(a.push(W-re),W)});return o===0?i:R.map(function(b,k){var W=b;if(o>0&&a[k]-o>0){var ee=Math.min(o,a[k]-o);o-=ee,W=b-ee}return W/t*100})}function Ve(){var i=this,t=l[i.a].element,o=l[i.b].element;i.dragging&&C(r,"onDragEnd",j)(Q()),i.dragging=!1,A[F]("mouseup",i.stop),A[F]("touchend",i.stop),A[F]("touchcancel",i.stop),A[F]("mousemove",i.move),A[F]("touchmove",i.move),i.stop=null,i.move=null,t[F]("selectstart",j),t[F]("dragstart",j),o[F]("selectstart",j),o[F]("dragstart",j),t.style.userSelect="",t.style.webkitUserSelect="",t.style.MozUserSelect="",t.style.pointerEvents="",o.style.userSelect="",o.style.webkitUserSelect="",o.style.MozUserSelect="",o.style.pointerEvents="",i.gutter.style.cursor="",i.parent.style.cursor="",Z.body.style.cursor=""}function qe(i){if(!("button"in i&&i.button!==0)){var t=this,o=l[t.a].element,a=l[t.b].element;t.dragging||C(r,"onDragStart",j)(Q()),i.preventDefault(),t.dragging=!0,t.move=Ge.bind(t),t.stop=Ve.bind(t),A[P]("mouseup",t.stop),A[P]("touchend",t.stop),A[P]("touchcancel",t.stop),A[P]("mousemove",t.move),A[P]("touchmove",t.move),o[P]("selectstart",j),o[P]("dragstart",j),a[P]("selectstart",j),a[P]("dragstart",j),o.style.userSelect="none",o.style.webkitUserSelect="none",o.style.MozUserSelect="none",o.style.pointerEvents="none",a.style.userSelect="none",a.style.webkitUserSelect="none",a.style.MozUserSelect="none",a.style.pointerEvents="none",t.gutter.style.cursor=N,t.parent.style.cursor=N,Z.body.style.cursor=N,ze.call(t),t.dragOffset=xe(i)-t.end}}_=_e(_);var J=[];l=s.map(function(i,t){var o={element:ke(i),size:_[t],minSize:S[t],maxSize:$[t],snapOffset:me[t],i:t},a;if(t>0&&(a={a:t-1,b:t,dragging:!1,direction:m,parent:E},a[I]=ne(M,t-1===0,!1,L),a[U]=ne(M,!1,t===s.length-1,L),g==="row-reverse"||g==="column-reverse")){var R=a.a;a.a=a.b,a.b=R}if(t>0){var b=X(t,m,o.element);He(b,M,t),a[K]=qe.bind(a),b[P]("mousedown",a[K]),b[P]("touchstart",a[K]),E.insertBefore(b,o.element),a.gutter=b}return q(o.element,o.size,ne(M,t===0,t===s.length-1,L),t),t>0&&J.push(a),o});function Oe(i){var t=i.i===J.length,o=t?J[i.i-1]:J[i.i];ze.call(o);var a=t?o.size-i.minSize-o[U]:i.minSize+o[I];Te.call(o,a)}l.forEach(function(i){var t=i.element[ve]()[n];t<i.minSize&&(w?Oe(i):i.minSize=t)});function Ke(i){var t=_e(i);t.forEach(function(o,a){if(a>0){var R=J[a-1],b=l[R.a],k=l[R.b];b.size=t[a-1],k.size=o,q(b.element,b.size,R[I],b.i),q(k.element,k.size,R[U],k.i)}})}function Ye(i,t){J.forEach(function(o){if(t!==!0?o.parent.removeChild(o.gutter):(o.gutter[F]("mousedown",o[K]),o.gutter[F]("touchstart",o[K])),i!==!0){var a=V(n,o.a.size,o[I]);Object.keys(a).forEach(function(R){l[o.a].element.style[R]="",l[o.b].element.style[R]=""})}})}return{setSizes:Ke,getSizes:Q,collapse:function(t){Oe(l[t])},destroy:Ye,parent:E,pairs:J}};function ye(e,r){var s={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&r.indexOf(n)===-1&&(s[n]=e[n]);return s}var Je=function(e){function r(){e.apply(this,arguments)}return e&&(r.__proto__=e),r.prototype=Object.create(e&&e.prototype),r.prototype.constructor=r,r.prototype.componentDidMount=function(){var n=this.props;n.children;var c=n.gutter,d=ye(n,["children","gutter"]),u=d;u.gutter=function(y,l){var v;return c?v=c(y,l):(v=document.createElement("div"),v.className="gutter gutter-"+l),v.__isSplitGutter=!0,v},this.split=De(this.parent.children,u)},r.prototype.componentDidUpdate=function(n){var c=this,d=this.props;d.children;var u=d.minSize,y=d.sizes,l=d.collapsed,v=ye(d,["children","minSize","sizes","collapsed"]),E=v,x=n.minSize,g=n.sizes,_=n.collapsed,O=["maxSize","expandToMin","gutterSize","gutterAlign","snapOffset","dragInterval","direction","cursor"],S=O.map(function(w){return c.props[w]!==n[w]}).reduce(function(w,M){return w||M},!1);if(Array.isArray(u)&&Array.isArray(x)){var h=!1;u.forEach(function(w,M){h=h||w!==x[M]}),S=S||h}else Array.isArray(u)||Array.isArray(x)?S=!0:S=S||u!==x;if(S)E.minSize=u,E.sizes=y||this.split.getSizes(),this.split.destroy(!0,!0),E.gutter=function(w,M,L){return L.previousSibling},this.split=De(Array.from(this.parent.children).filter(function(w){return!w.__isSplitGutter}),E);else if(y){var $=!1;y.forEach(function(w,M){$=$||w!==g[M]}),$&&this.split.setSizes(this.props.sizes)}Number.isInteger(l)&&(l!==_||S)&&this.split.collapse(l)},r.prototype.componentWillUnmount=function(){this.split.destroy(),delete this.split},r.prototype.render=function(){var n=this,c=this.props;c.sizes,c.minSize,c.maxSize,c.expandToMin,c.gutterSize,c.gutterAlign,c.snapOffset,c.dragInterval,c.direction,c.cursor,c.gutter,c.elementStyle,c.gutterStyle,c.onDrag,c.onDragStart,c.onDragEnd,c.collapsed;var d=c.children,u=ye(c,["sizes","minSize","maxSize","expandToMin","gutterSize","gutterAlign","snapOffset","dragInterval","direction","cursor","gutter","elementStyle","gutterStyle","onDrag","onDragStart","onDragEnd","collapsed","children"]),y=u;return Ce.createElement("div",Object.assign({},{ref:function(l){n.parent=l}},y),d)},r}(Ce.Component);Je.propTypes={sizes:p.arrayOf(p.number),minSize:p.oneOfType([p.number,p.arrayOf(p.number)]),maxSize:p.oneOfType([p.number,p.arrayOf(p.number)]),expandToMin:p.bool,gutterSize:p.number,gutterAlign:p.string,snapOffset:p.oneOfType([p.number,p.arrayOf(p.number)]),dragInterval:p.number,direction:p.string,cursor:p.string,gutter:p.func,elementStyle:p.func,gutterStyle:p.func,onDrag:p.func,onDragStart:p.func,onDragEnd:p.func,collapsed:p.number,children:p.arrayOf(p.element)};Je.defaultProps={sizes:void 0,minSize:void 0,maxSize:void 0,expandToMin:void 0,gutterSize:void 0,gutterAlign:void 0,snapOffset:void 0,dragInterval:void 0,direction:void 0,cursor:void 0,gutter:void 0,elementStyle:void 0,gutterStyle:void 0,onDrag:void 0,onDragStart:void 0,onDragEnd:void 0,collapsed:void 0,children:void 0};let ge=null;async function Or(){return ge||(ge=await he(()=>import("./babel-runtime-NlBRrITh.js").then(e=>e.b),__vite__mapDeps([0,1]))),ge}const Y=new Map;function Mr(e){return Y.get(e)}function Rr(e,r){if(Y.set(e,r),Y.size>50){const s=Y.keys().next().value;s!==void 0&&Y.delete(s)}}const Cr=async e=>H.measureAsync("compile_ts_ms",async()=>{try{if(typeof window<"u"&&window.ts){const r=window.ts;return{code:r.transpileModule(e,{compilerOptions:{module:r.ModuleKind.ESNext,target:r.ScriptTarget.ES2020,jsx:r.JsxEmit.Preserve,strict:!1,esModuleInterop:!0,allowSyntheticDefaultImports:!0,skipLibCheck:!0}}).outputText}}return{code:e}}catch(r){return console.error("TypeScript compilation error:",r),{code:e,error:r instanceof Error?r.message:"Unknown TypeScript compilation error",errorDetails:r}}}),Ur=()=>new Promise((e,r)=>{if(typeof window<"u"&&window.ts){e();return}const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/typescript/5.3.3/typescript.min.js",s.async=!0,s.onload=()=>e(),s.onerror=()=>{console.error("Failed to load TypeScript compiler"),r(new Error("Failed to load TypeScript compiler"))},document.head.appendChild(s)}),$r=async e=>{const r=`babel:${e}`,s=Mr(r);if(s)return H.record("compile_babel_ms",0),s;const n=await Or(),c=H.measure("compile_babel_ms",()=>{try{return{code:n.transform(e,{presets:[["react",{runtime:"classic"}]],plugins:[]}).code||""}}catch(d){return console.error("React compilation error:",d),{code:"",error:d instanceof Error?d.message:"Unknown compilation error",errorDetails:d}}});return Rr(r,c),c},kr=e=>({code:e}),Dr=e=>({code:e}),Br=async(e,r)=>{try{switch(r){case"react":return await $r(e);case"vue":return kr(e);case"ts":return await Cr(e);default:return Dr(e)}}catch(s){return console.error(`Error compiling ${r}:`,s),{code:e,error:s instanceof Error?s.message:"Unknown error",errorDetails:s}}},Nr=async(e,r)=>{if(r==="css")return{code:e};const s=r==="scss"?"compile_sass_ms":"compile_less_ms";return H.measureAsync(s,async()=>{try{let n;if(r==="scss"){const{default:c}=await he(async()=>{const{default:u}=await import("./sass-runtime-CFadK7gR.js");return{default:u}},[]);n=c.compileString(e).css}else{const{default:c}=await he(async()=>{const{default:u}=await import("./less-runtime-CNc9D0M5.js").then(y=>y.l);return{default:u}},__vite__mapDeps([2,1]));n=(await c.render(e)).css}return{code:n}}catch(n){return console.error(`Error compiling ${r}:`,n),{code:e,error:n instanceof Error?n.message:"Unknown CSS compilation error",errorDetails:n}}})};export{Ir as G,jr as P,Je as S,Nr as a,Br as c,Ur as l};

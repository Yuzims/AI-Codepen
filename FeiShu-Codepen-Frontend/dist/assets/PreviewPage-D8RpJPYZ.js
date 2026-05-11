import{r as i,j as n,e as A}from"./vendor-react-CFRVorIX.js";import{g as N,a as W}from"./penService-CdzsdC2C.js";import{l as G,G as O,S as K,P as q,a as U,c as Z}from"./compilerService-DUOyWI6z.js";import{a as F,j as H,d as Q,n as X,o as Y,p as _,q as tt,r as ot,t as et,u as nt,w as rt,k as it,x as st,A as at,B as ct,C as lt,F as dt,I as mt,E as V,H as pt}from"./codemirror-Btu511nc.js";import{s as a}from"./emotion-styled.browser.esm-BbqDsb-3.js";import"./api-D_a7eN0k.js";import"./index-CQPbsDfg.js";const ft=a.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-right: 1px solid #e1e4e8;
  position: relative;
`,ut=a.div`
  display: flex;
  background-color: #f8f9ff;
  border-bottom: 1px solid #e1e8ff;
  height: 32px;
  flex-shrink: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  width: 100%;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #c1c8ff #f8f9ff;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f8f9ff;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c8ff;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8b3ff;
  }
`,I=a.button`
  flex-shrink: 0;
  border: none;
  background-color: ${s=>s.active?"#ffffff":"transparent"};
  color: ${s=>s.active?"#3b82f6":"#6b7280"};
  font-size: 12px;
  font-weight: ${s=>s.active?"600":"500"};
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid ${s=>s.active?"#3b82f6":"transparent"};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 80px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: ${s=>s.active?"#ffffff":"#f1f5ff"};
    color: ${s=>s.active?"#3b82f6":"#374151"};
  }

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px #93c5fd;
  }

  &:first-child {
    border-radius: 0 0 0 8px;
  }

  &:last-child {
    border-radius: 0 0 8px 0;
  }
`,ht=a.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  margin-top: 32px;
`,gt=a.div`
  height: 100%;
  width: 100%;
  overflow: auto;
  
  .cm-editor {
    height: 100%;
    max-height: 100%;
    overflow: auto;
    transform: translateZ(0);
    font-family: "Consolas", "Monaco", "Lucida Console", "Liberation Mono",
      "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important;
    font-size: 13px !important;
    font-weight: normal !important;
    line-height: 1.3 !important;
    font-variant-ligatures: none !important;
    text-rendering: auto !important;
    -webkit-font-smoothing: auto !important;
    -moz-osx-font-smoothing: auto !important;
    letter-spacing: 0 !important;
    will-change: transform;
  }

  .cm-scroller {
    overflow: auto !important;
    max-height: 100% !important;
  }

  .cm-gutters {
    background-color: #f8f8f8;
    border-right: 1px solid #e8e8e8;
    color: #858585;
  }

  .cm-lineNumbers {
    min-width: 3ch;
    text-align: right;
    padding-right: 16px;
    font-size: 12px !important;
    font-family: "Consolas", "Monaco", "Lucida Console", "Liberation Mono",
      "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important;
    font-weight: normal !important;
    letter-spacing: 0 !important;
  }

  .cm-content {
    background-color: #ffffff;
    caret-color: #3b82f6;
    padding: 12px 16px;
    font-family: "Consolas", "Monaco", "Lucida Console", "Liberation Mono",
      "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important;
    font-size: 13px !important;
    font-weight: normal !important;
    line-height: 1.3 !important;
    letter-spacing: 0 !important;
    text-rendering: auto !important;
    -webkit-font-smoothing: auto !important;
    -moz-osx-font-smoothing: auto !important;
    font-variant-ligatures: none !important;
  }

  /* 改善文本选中效果 */
  .cm-editor .cm-selectionBackground {
    background-color: #dbeafe !important;
    opacity: 0.8 !important;
  }

  .cm-editor.cm-focused .cm-selectionBackground {
    background-color: #bfdbfe !important;
    opacity: 1 !important;
  }

  /* 强制覆盖 CodeMirror 默认选中样式 */
  .cm-editor .cm-content ::selection {
    background-color: #bfdbfe !important;
    color: inherit !important;
  }

  .cm-editor .cm-content ::-moz-selection {
    background-color: #bfdbfe !important;
    color: inherit !important;
  }

  /* 确保选中层在正确的层级 */
  .cm-editor .cm-selectionLayer {
    z-index: -1 !important;
  }

  /* 改善拖拽选择的视觉效果 */
  .cm-editor .cm-selectionMatch {
    background-color: #fef3c7 !important;
  }

  /* 改善当前行高亮 */
  .cm-activeLine {
    background-color: #f8fafc !important;
  }

  /* 改善光标线 */
  .cm-cursor {
    border-left-color: #3b82f6 !important;
    border-left-width: 2px !important;
  }

  /* 改善搜索匹配高亮 */
  .cm-searchMatch {
    background-color: #fef3c7;
    border: 1px solid #f59e0b;
  }

  .cm-searchMatch.cm-searchMatch-selected {
    background-color: #fbbf24;
    border: 1px solid #d97706;
  }

  /* 改善括号匹配 */
  .cm-matchingBracket {
    background-color: #dbeafe;
    border: 1px solid #3b82f6;
    border-radius: 2px;
  }

  /* 强制应用等宽字体到所有CodeMirror元素 */
  .cm-editor * {
    font-family: "Consolas", "Monaco", "Lucida Console", "Liberation Mono",
      "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important;
  }

  .cm-editor .cm-line,
  .cm-editor .cm-content,
  .cm-editor .cm-gutters,
  .cm-editor .cm-lineNumbers,
  .cm-editor .cm-gutterElement {
    font-family: "Consolas", "Monaco", "Lucida Console", "Liberation Mono",
      "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important;
    font-size: 13px !important;
    font-weight: normal !important;
    line-height: 1.3 !important;
    letter-spacing: 0 !important;
    font-variant-ligatures: none !important;
  }
`;a.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #586069;
  font-size: 14px;
  background-color: #f8f9fa;
`;const R=a.span`
  font-size: 10px;
  opacity: 0.7;
`,xt=({html:s,css:o,js:j,jsLanguage:f="js",importedCssPens:h=[],importedJsPens:w=[],currentPenTitle:b="当前 Pen"})=>{const[u,v]=i.useState("html"),[m,y]=i.useState(null),d=i.useRef(null),M=(e,c,p)=>{const C=[X({formatNumber:l=>l.toString()}),Y(),_(),tt({drawRangeCursor:!0}),ot(),et(),nt(),rt(),it.of([st,...at,...ct]),lt(),dt(mt),V.editable.of(!1),V.theme({"&.cm-focused .cm-selectionBackground":{backgroundColor:"#b3d4fc !important"},".cm-selectionBackground":{backgroundColor:"#c8e1ff !important"},".cm-content":{fontFamily:'"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important',fontSize:"13px !important",fontWeight:"normal !important",lineHeight:"1.3 !important",letterSpacing:"0 !important",textRendering:"auto !important",WebkitFontSmoothing:"auto !important",MozOsxFontSmoothing:"auto !important",fontVariantLigatures:"none !important"},".cm-editor .cm-line":{fontFamily:'"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important',fontSize:"13px !important",fontWeight:"normal !important",lineHeight:"1.3 !important",letterSpacing:"0 !important"},".cm-editor":{fontFamily:'"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important'},".cm-gutters":{fontFamily:'"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace !important',fontSize:"12px !important"}})],t=pt.create({doc:p,extensions:[...C,c]}),r=new V({state:t,parent:e});return y(r),r},L=()=>{const e=[];return h.forEach((c,p)=>{c.css.trim()&&(e.push("/* =========================================="),e.push(` * 导入的 CSS #${p+1}: ${c.title}`),e.push(" * ========================================== */"),e.push(c.css.trim()),e.push(""))}),o.trim()&&(e.length>0&&(e.push("/* =========================================="),e.push(` * ${b} (当前编辑)`),e.push(" * ========================================== */")),e.push(o.trim())),e.join(`
`)},z=()=>{const e=[];return w.forEach((c,p)=>{c.js.trim()&&(e.push("/* =========================================="),e.push(` * 导入的 JS #${p+1}: ${c.title}`),e.push(" * ========================================== */"),e.push(c.js.trim()),e.push(""))}),j.trim()&&(e.length>0&&(e.push("/* =========================================="),e.push(` * ${b} (当前编辑)`),e.push(" * ========================================== */")),e.push(j.trim())),e.join(`
`)},P=()=>{switch(u){case"html":return{content:s,extension:F()};case"css":return{content:L(),extension:Q()};case"js":const c=z(),p=f==="ts"?H({typescript:!0}):H();return{content:c,extension:p};default:return{content:s,extension:F()}}};i.useEffect(()=>{if(!d.current)return;m&&(m.destroy(),y(null)),d.current.innerHTML="";const{content:e,extension:c}=P();return d.current&&M(d.current,c,e),()=>{m&&m.destroy()}},[u,s,o,j,f,h,w,b]);const S=e=>{v(e)},g=h.length,k=w.length;return n.jsxs(ft,{children:[n.jsxs(ut,{children:[n.jsx(I,{active:u==="html",onClick:()=>S("html"),children:"HTML"}),n.jsxs(I,{active:u==="css",onClick:()=>S("css"),children:["CSS ",g>0&&n.jsxs(R,{children:["(",g+1,")"]})]}),n.jsxs(I,{active:u==="js",onClick:()=>S("js"),children:[f==="ts"?"TS":"JS"," ",k>0&&n.jsxs(R,{children:["(",k+1,")"]})]})]}),n.jsx(ht,{children:n.jsx(gt,{ref:d})})]})},T=a.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f6f8fa;
  overflow: hidden;
`,bt=a.div`
  padding: 12px 20px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
`,$=a.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
`,Ct=a.h1`
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
`,jt=a.p`
  color: #666;
  margin: 4px 0 0 0;
  font-size: 14px;
  line-height: 1.4;
`,wt=a.div`
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`,vt=a.div`
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`,St=a.div`
  font-size: 13px;
  color: #666;
`,kt=a.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: white;
  width: 100%;
`,Jt=()=>{const{id:s}=A(),[o,j]=i.useState(null),[f,h]=i.useState([]),[w,b]=i.useState(!0),[u,v]=i.useState(null),[m,y]=i.useState(""),[d,M]=i.useState(""),[L,z]=i.useState(""),[P,S]=i.useState(""),[g,k]=i.useState(!1),e=async(t,r)=>{try{return(await Z(t,r)).code}catch(l){return console.error(`Error compiling ${r}:`,l),t}},c=async(t,r)=>{try{return(await U(t,r)).code}catch(l){return console.error(`Error compiling ${r}:`,l),t}};i.useEffect(()=>{G().then(()=>{k(!0)}).catch(t=>{console.error("Failed to load TypeScript compiler:",t),k(!0)})},[]),i.useCallback(async()=>{try{const t=await N();h(t)}catch(t){console.error("Failed to fetch all pens:",t),h([])}},[]);const p=i.useCallback((t,r)=>{const l=(t.importedCssPenIds||[]).map(x=>r.find(J=>J.id===x)).filter(Boolean).map(x=>x.css).join(`

`),E=(t.importedJsPenIds||[]).map(x=>r.find(J=>J.id===x)).filter(Boolean).map(x=>x.js).join(`

`),B=[l,m].filter(Boolean).join(`

`),D=[E,d].filter(Boolean).join(`

`);z(B),S(D)},[m,d]),C=i.useCallback(async t=>{try{const r=t.cssLanguage||"css",l=t.jsLanguage||"js",E=await c(t.css,r);if(y(E),l==="ts"&&!g)return;const B=await e(t.js,l);M(B)}catch(r){console.error("Error during code compilation:",r),v("代码编译失败")}},[g]);return i.useEffect(()=>{(async()=>{if(s)try{b(!0),v(null);const[r,l]=await Promise.all([W(s),N().catch(()=>[])]);j(r),h(l),await C(r)}catch(r){v("无法加载代码片段"),console.error("Error fetching pen:",r)}finally{b(!1)}})()},[s,C]),i.useEffect(()=>{o&&f.length>=0&&(m||d)&&p(o,f)},[o,f,m,d,p]),i.useEffect(()=>{g&&o&&C(o)},[g,o,C]),w?n.jsx(T,{children:n.jsx($,{children:n.jsx("div",{children:"加载中..."})})}):u||!o?n.jsx(T,{children:n.jsx($,{children:n.jsx("div",{children:u||"代码片段不存在"})})}):n.jsxs(T,{children:[n.jsx(O,{styles:`
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
            `}),n.jsx(bt,{children:n.jsxs($,{children:[n.jsx(Ct,{children:o.title}),o.description&&n.jsx(jt,{children:o.description}),(o.importedCssPenIds&&o.importedCssPenIds.length>0||o.importedJsPenIds&&o.importedJsPenIds.length>0)&&n.jsxs("div",{style:{marginTop:"8px",fontSize:"12px",color:"#6a737d",display:"flex",gap:"16px"},children:[o.importedCssPenIds&&o.importedCssPenIds.length>0&&n.jsxs("span",{children:["🎨 导入了 ",o.importedCssPenIds.length," 个 CSS"]}),o.importedJsPenIds&&o.importedJsPenIds.length>0&&n.jsxs("span",{children:["⚡ 导入了 ",o.importedJsPenIds.length," 个 JS"]})]})]})}),n.jsx("div",{style:{flex:1,minHeight:0,display:"flex"},children:n.jsxs(K,{direction:"horizontal",sizes:[50,50],minSize:200,gutterSize:6,style:{display:"flex",flex:1,minHeight:0,height:"100%"},children:[n.jsx(xt,{html:o.html,css:o.css,js:o.js,jsLanguage:o.jsLanguage||"js",importedCssPens:(o.importedCssPenIds||[]).map(t=>f.find(r=>r.id===t)).filter(Boolean).map(t=>({id:t.id,title:t.title,css:t.css,js:t.js})),importedJsPens:(o.importedJsPenIds||[]).map(t=>f.find(r=>r.id===t)).filter(Boolean).map(t=>({id:t.id,title:t.title,css:t.css,js:t.js})),currentPenTitle:o.title}),n.jsxs(wt,{children:[n.jsx(vt,{children:n.jsx(St,{children:"预览"})}),n.jsx(kt,{children:n.jsx(q,{html:o.html,css:L||m,js:P||d,jsLanguage:o.jsLanguage||"js"})})]})]})})]})};export{Jt as default};

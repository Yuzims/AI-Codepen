import{u as N,r as d,j as e,L as B}from"./vendor-react-CFRVorIX.js";import{c as U,g as D}from"./penService-CdzsdC2C.js";import{U as z}from"./UserNavbar-Cs0L4GoQ.js";import{s as t}from"./emotion-styled.browser.esm-BbqDsb-3.js";import{a as H}from"./api-D_a7eN0k.js";import"./index-CQPbsDfg.js";const J=()=>{const a=H.defaults.baseURL;return typeof a=="string"&&a.length>0?a.replace(/\/$/,""):"/api"},E=a=>{const b=a.trim(),f=b.indexOf("{"),g=b.lastIndexOf("}");if(f===-1||g===-1||g<f)throw new Error("AI 返回结果不是有效的 JSON");const r=JSON.parse(b.slice(f,g+1));if(typeof r.title!="string"||typeof r.html!="string"||typeof r.css!="string"||typeof r.js!="string")throw new Error("AI 返回结果缺少必要字段");return{title:r.title.trim()||"Untitled AI Pen",html:r.html,css:r.css,js:r.js}},F=async(a,b,f)=>{const g=localStorage.getItem("token"),r=await fetch(`${J()}/ai/generate`,{method:"POST",headers:{"Content-Type":"application/json",...g?{Authorization:`Bearer ${g}`}:{}},body:JSON.stringify({prompt:a}),signal:f});if(!r.ok){let c="AI 生成失败";try{const l=await r.json();typeof(l==null?void 0:l.message)=="string"&&l.message&&(c=l.message)}catch{}throw new Error(c)}if(!r.body)throw new Error("AI 生成连接失败");const u=r.body.getReader(),i=new TextDecoder;let x="",m="";for(;;){const{done:c,value:l}=await u.read();if(c)break;for(x+=i.decode(l,{stream:!0});;){const o=x.indexOf(`

`);if(o===-1)break;const s=x.slice(0,o);x=x.slice(o+2);const w=s.split(`
`).filter(h=>h.startsWith("data:")).map(h=>h.slice(5).trim()).join(`
`);if(!w)continue;if(w==="[DONE]")return E(m);const p=JSON.parse(w);if(typeof p.error=="string"&&p.error)throw new Error(p.error);typeof p.delta=="string"&&p.delta&&(m+=p.delta,b(p.delta))}}return E(m)},Y=({onClose:a})=>{const b=N(),[f,g]=d.useState(""),[r,u]=d.useState(""),[i,x]=d.useState(null),[m,c]=d.useState(""),[l,o]=d.useState(!1),[s,w]=d.useState(!1),p=d.useRef(null),h=d.useRef(null);d.useEffect(()=>{p.current&&(p.current.scrollTop=p.current.scrollHeight)},[r]),d.useEffect(()=>()=>{var n;(n=h.current)==null||n.abort()},[]);const v=()=>{var n;(n=h.current)==null||n.abort(),a()},O=async()=>{var C;const n=f.trim();if(!n||l){n||c("请输入你想生成的效果描述");return}(C=h.current)==null||C.abort();const j=new AbortController;h.current=j,o(!0),x(null),u(""),c("");try{const y=await F(n,$=>{u(G=>G+$)},j.signal);x(y)}catch(y){if(j.signal.aborted)return;c(y instanceof Error?y.message:"AI 生成失败")}finally{h.current===j&&(h.current=null),o(!1)}},R=async()=>{if(!(!i||s)){w(!0),c("");try{const n=await U({title:i.title,html:i.html,css:i.css,js:i.js,cssLanguage:"css",jsLanguage:"js"});b(`/editor/${n.id}`,{replace:!0})}catch(n){c(n instanceof Error?n.message:"创建 Pen 失败"),w(!1)}}},L=n=>{g(n.target.value),x(null),u(""),c("")};return e.jsx(V,{onClick:v,children:e.jsxs(W,{onClick:n=>n.stopPropagation(),children:[e.jsxs(X,{children:[e.jsx(q,{children:"AI 生成代码"}),e.jsx(K,{onClick:v,disabled:s,children:"×"})]}),e.jsx(Q,{htmlFor:"ai-generate-prompt",children:"描述你想要的效果"}),e.jsx(Z,{id:"ai-generate-prompt",value:f,onChange:L,placeholder:"例如：做一个可切换明暗主题的待办事项应用，支持添加、删除和筛选任务。",disabled:l||s}),e.jsxs(_,{children:[e.jsx(ee,{type:"button",onClick:O,disabled:l||s,children:l?"生成中...":i?"重新生成":"开始生成"}),e.jsx(te,{type:"button",onClick:v,disabled:s,children:"取消"})]}),m&&e.jsx(re,{children:m}),e.jsxs(oe,{children:[e.jsx(ne,{children:"代码预览"}),i?e.jsxs(ae,{children:[e.jsxs(de,{children:[e.jsx(ce,{children:"标题"}),e.jsx(le,{children:i.title})]}),e.jsxs(k,{children:[e.jsx(P,{children:"HTML"}),e.jsx(S,{children:i.html})]}),e.jsxs(k,{children:[e.jsx(P,{children:"CSS"}),e.jsx(S,{children:i.css})]}),e.jsxs(k,{children:[e.jsx(P,{children:"JavaScript"}),e.jsx(S,{children:i.js})]})]}):r?e.jsx(se,{ref:p,children:r}):e.jsx(ie,{children:"生成结果会实时显示在这里，确认无误后可直接创建为新的 Pen。"})]}),e.jsxs(pe,{children:[e.jsx(xe,{children:i?"确认后会创建一个新的 Pen 并跳转到编辑器。":"先输入需求并生成，再确认创建。"}),e.jsx(fe,{type:"button",onClick:R,disabled:!i||l||s,children:s?"创建中...":"确认创建"})]})]})})},V=t.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 1100;
`,W=t.div`
    width: min(960px, 100%);
    max-height: calc(100vh - 48px);
    overflow: hidden;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
`,X=t.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`,q=t.h2`
    margin: 0;
    color: #1f2937;
    font-size: 20px;
    font-weight: 700;
`,K=t.button`
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: #f3f4f6;
    color: #4b5563;
    font-size: 24px;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
`,Q=t.label`
    color: #374151;
    font-size: 14px;
    font-weight: 600;
`,Z=t.textarea`
    width: 100%;
    min-height: 120px;
    resize: vertical;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.6;
    color: #1f2937;
    background: #ffffff;

    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }

    &:disabled {
        background: #f9fafb;
        cursor: not-allowed;
    }
`,_=t.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
`,ee=t.button`
    border: none;
    border-radius: 10px;
    padding: 12px 18px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
`,te=t.button`
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 12px 18px;
    background: #ffffff;
    color: #374151;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
`,re=t.div`
    border-radius: 10px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    padding: 12px 14px;
    font-size: 14px;
`,oe=t.div`
    flex: 1;
    min-height: 0;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #f8fafc;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`,ne=t.h3`
    margin: 0;
    color: #111827;
    font-size: 16px;
    font-weight: 700;
`,ie=t.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.7;
    padding: 24px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px dashed #d1d5db;
`,se=t.pre`
    flex: 1;
    min-height: 260px;
    margin: 0;
    overflow: auto;
    padding: 16px;
    border-radius: 12px;
    background: #111827;
    color: #f9fafb;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
`,ae=t.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow: auto;
`,de=t.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 12px 14px;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
`,ce=t.span`
    color: #6b7280;
    font-size: 13px;
    font-weight: 600;
`,le=t.span`
    color: #111827;
    font-size: 14px;
    font-weight: 600;
`,k=t.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`,P=t.h4`
    margin: 0;
    color: #374151;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
`,S=t.pre`
    margin: 0;
    max-height: 220px;
    overflow: auto;
    padding: 14px;
    border-radius: 12px;
    background: #111827;
    color: #f9fafb;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
`,pe=t.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`,xe=t.p`
    margin: 0;
    color: #6b7280;
    font-size: 13px;
`,fe=t.button`
    border: none;
    border-radius: 10px;
    padding: 12px 18px;
    background: #111827;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
`,I=t.div`
  min-height: 100vh;
  background: #f8f9fa;
`,A=t.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
`,ge=t.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-shrink: 0;
  gap: 16px;
  flex-wrap: wrap;
`,ue=t.h1`
  margin: 0;
  color: #333;
  font-size: 2rem;
`,he=t.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`,T=t(B)`
  padding: 12px 24px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`,M=t.button`
  padding: 12px 24px;
  background: #ffffff;
  color: #5a5fcf;
  border: 1px solid rgba(102, 126, 234, 0.35);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background: #f8f8ff;
  }
`,be=t.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`,me=t(B)`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 200px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`,we=t.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #45a049;
  }
`,je=t.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;

  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`,ye=t.h3`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
`,ve=t.p`
  margin: 0 0 16px 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`,ke=t.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`,Pe=t.div`
  color: #999;
  font-size: 0.8rem;
`,Se=t.div`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${a=>a.isPublic?"#e8f5e8":"#fff3cd"};
  color: ${a=>a.isPublic?"#2d7738":"#856404"};
`,Ce=t.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`,ze=t.div`
  font-size: 4rem;
  margin-bottom: 16px;
`,Ee=t.h3`
  margin: 0 0 8px 0;
  color: #333;
`,Ie=t.p`
  margin: 0 0 24px 0;
  color: #666;
`,Ae=t.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`,$e=()=>{const[a,b]=d.useState([]),[f,g]=d.useState(!0),[r,u]=d.useState(!1),[i,x]=d.useState(""),[m,c]=d.useState(!1);d.useEffect(()=>{(async()=>{try{const s=await D();b(s)}catch(s){console.error("Error loading pens:",s)}finally{g(!1)}})()},[]);const l=(o,s)=>{o.preventDefault();const w=`${window.location.origin}/p/${s}`;navigator.clipboard.writeText(w).then(()=>{x("分享链接已复制到剪贴板！"),u(!0),setTimeout(()=>u(!1),2e3)}).catch(p=>{console.error("复制失败:",p),x("复制失败，请手动复制链接"),u(!0),setTimeout(()=>u(!1),2e3)})};return f?e.jsxs(I,{children:[e.jsx(z,{}),e.jsx(A,{children:e.jsx("div",{style:{textAlign:"center",padding:"60px 20px"},children:"加载中..."})})]}):e.jsxs(I,{children:[e.jsx(z,{}),e.jsxs(A,{children:[e.jsxs(ge,{children:[e.jsx(ue,{children:"我的代码片段"}),e.jsxs(he,{children:[e.jsx(M,{onClick:()=>c(!0),children:"AI 生成"}),e.jsx(T,{to:"/editor",children:"✨ 创建新项目"})]})]}),a.length===0?e.jsxs(Ce,{children:[e.jsx(ze,{children:"📝"}),e.jsx(Ee,{children:"还没有代码片段"}),e.jsx(Ie,{children:"创建你的第一个代码片段，开始编程之旅吧！"}),e.jsxs(Ae,{children:[e.jsx(M,{onClick:()=>c(!0),children:"AI 生成项目"}),e.jsx(T,{to:"/editor",children:"创建第一个项目"})]})]}):e.jsx(be,{children:a.map(o=>e.jsxs(me,{to:`/editor/${o.id}`,children:[e.jsx(we,{onClick:s=>l(s,o.id),children:"🔗 分享"}),e.jsx(ye,{children:o.title}),e.jsx(ve,{children:o.description||"暂无描述"}),e.jsxs(ke,{children:[e.jsx(Pe,{children:new Date(o.updatedAt).toLocaleDateString("zh-CN")}),e.jsx(Se,{isPublic:o.isPublic,children:o.isPublic?"公开":"私有"})]})]},o.id))})]}),r&&e.jsx(je,{children:i}),m&&e.jsx(Y,{onClose:()=>c(!1)})]})};export{$e as default};

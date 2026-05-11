import{u as p,d as g,j as e}from"./vendor-react-CFRVorIX.js";import{u as x}from"./index-CQPbsDfg.js";import{s as r}from"./emotion-styled.browser.esm-BbqDsb-3.js";const f=r.div`
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 0 20px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`,u=r.div`
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
`,h=r.div`
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:hover {
        color: #0066cc;
    }
`,b=r.div`
    display: flex;
    align-items: center;
    gap: 16px;
`,m=r.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #666;
`,v=r.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(45deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
`,j=r.span`
    font-weight: 500;
    color: #333;
`,y=r.button`
    padding: 8px 16px;
    background: #fff;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    
    &:hover {
        background: #f8f9fa;
        border-color: #bbb;
        color: #333;
    }
    
    &:active {
        transform: translateY(1px);
    }
`,k=r.div`
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #666;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`,C=()=>{const s=p(),{user:o,logout:a}=x(),[t,i]=g.useState(!1),d=()=>{s("/pens")},c=async()=>{if(!t){i(!0);try{await a(),s("/login")}catch(n){console.error("登出失败:",n)}finally{i(!1)}}},l=n=>n.charAt(0).toUpperCase();return e.jsx(f,{children:e.jsxs(u,{children:[e.jsxs(h,{onClick:d,children:[e.jsx("span",{children:"🚀"}),"飞书代码编辑器"]}),e.jsxs(b,{children:[o&&e.jsxs(m,{children:[e.jsx(v,{children:l(o.username)}),e.jsx(j,{children:o.username})]}),e.jsx(y,{onClick:c,disabled:t,children:t?e.jsxs(e.Fragment,{children:[e.jsx(k,{}),"登出中..."]}):"登出"})]})]})})};export{C as U};

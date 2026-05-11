import{L as f,u as b,r as a,j as e}from"./vendor-react-CFRVorIX.js";import{u as w}from"./index-CQPbsDfg.js";import{s as t}from"./emotion-styled.browser.esm-BbqDsb-3.js";const j=t.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`,v=t.form`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`,y=t.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
`,l=t.input`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`,k=t.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`,z=t.div`
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
`,E=t(f)`
  text-align: center;
  margin-top: 20px;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`,D=()=>{const n=b(),{login:x,isAuthenticated:s}=w(),[r,u]=a.useState({email:"",password:""}),[i,g]=a.useState("");a.useEffect(()=>{s&&n("/pens")},[s,n]);const d=o=>{u({...r,[o.target.name]:o.target.value})},m=async o=>{var p,c;o.preventDefault();try{await x(r.email,r.password),n("/pens")}catch(h){g(((c=(p=h.response)==null?void 0:p.data)==null?void 0:c.message)||"登录失败")}};return e.jsx(j,{children:e.jsxs(v,{onSubmit:m,children:[e.jsx(y,{children:"登录"}),i&&e.jsx(z,{children:i}),e.jsx(l,{type:"email",name:"email",placeholder:"邮箱",value:r.email,onChange:d,required:!0}),e.jsx(l,{type:"password",name:"password",placeholder:"密码",value:r.password,onChange:d,required:!0}),e.jsx(k,{type:"submit",children:"登录"}),e.jsx(E,{to:"/register",children:"还没有账号？立即注册"})]})})};export{D as default};

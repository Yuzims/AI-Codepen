import{L as m,u as h,r as p,j as e}from"./vendor-react-CFRVorIX.js";import{register as f}from"./authService-B5PYuwQE.js";import{s as t}from"./emotion-styled.browser.esm-BbqDsb-3.js";import"./api-D_a7eN0k.js";const b=t.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`,w=t.form`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`,j=t.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
`,a=t.input`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`,v=t.button`
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
`,y=t.div`
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
`,k=t(m)`
  text-align: center;
  margin-top: 20px;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`,S=()=>{const l=h(),[r,c]=p.useState({username:"",email:"",password:""}),[s,x]=p.useState(""),o=n=>{c({...r,[n.target.name]:n.target.value})},u=async n=>{var i,d;n.preventDefault();try{await f(r),l("/login")}catch(g){x(((d=(i=g.response)==null?void 0:i.data)==null?void 0:d.message)||"注册失败")}};return e.jsx(b,{children:e.jsxs(w,{onSubmit:u,children:[e.jsx(j,{children:"注册"}),s&&e.jsx(y,{children:s}),e.jsx(a,{type:"text",name:"username",placeholder:"用户名",value:r.username,onChange:o,required:!0}),e.jsx(a,{type:"email",name:"email",placeholder:"邮箱",value:r.email,onChange:o,required:!0}),e.jsx(a,{type:"password",name:"password",placeholder:"密码",value:r.password,onChange:o,required:!0}),e.jsx(v,{type:"submit",children:"注册"}),e.jsx(k,{to:"/login",children:"已有账号？立即登录"})]})})};export{S as default};

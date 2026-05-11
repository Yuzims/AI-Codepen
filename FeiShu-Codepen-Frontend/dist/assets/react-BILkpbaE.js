const e={prefix:"react function component",body:`function \${1:ComponentName}(\${2:props}) {
	return (
		\${3}
	);
}`,description:"React function component"},t={prefix:"react arrow component",body:`const \${1:ComponentName} = (\${2:props}) => {
	return (
		\${3}
	);
}`,description:"React arrow function component"},n={prefix:"react class component",body:`class \${1:ComponentName} extends React.Component {
	render() {
		return (
			\${2}
		);
	}
}`,description:"React class component"},o={prefix:"react memo component",body:`const \${1:ComponentName} = React.memo((\${2:props}) => {
	return (
		\${3}
	);
});`,description:"React memo component"},s={prefix:"useState",body:"const [${1:state}, set${1:state}] = useState(${2:initialValue})",description:"React useState hook"},c={prefix:"useEffect",body:"useEffect(() => {\n	${1}\n}, [${2:dependencies}])",description:"React useEffect hook"},r={prefix:"useEffect empty deps",body:`useEffect(() => {
	\${1}
}, [])`,description:"React useEffect with empty dependencies"},i={prefix:"useRef",body:"const ${1:ref} = useRef(${2:initialValue})",description:"React useRef hook"},p={prefix:"useCallback",body:"const ${1:callback} = useCallback((${2:params}) => {\n	${3}\n}, [${4:dependencies}])",description:"React useCallback hook"},a={prefix:"useMemo",body:"const ${1:memoizedValue} = useMemo(() => {\n	${2}\n}, [${3:dependencies}])",description:"React useMemo hook"},d={prefix:"useContext",body:"const ${1:context} = useContext(${2:Context})",description:"React useContext hook"},u={prefix:"useReducer",body:"const [${1:state}, ${2:dispatch}] = useReducer(${3:reducer}, ${4:initialState})",description:"React useReducer hook"},m={prefix:"jsx element",body:"<${1:div}>\n	${2}\n</${1:div}>",description:"JSX element"},$={prefix:"jsx component",body:"<${1:Component} ${2:props}>\n	${3}\n</${1:Component}>",description:"JSX component"},l={prefix:"jsx with className",body:'<${1:div} className="${2:className}">\n	${3}\n</${1:div}>',description:"JSX with className"},f={prefix:"jsx with style",body:"<${1:div} style={{ ${2:styles} }}>\n	${3}\n</${1:div}>",description:"JSX with inline style"},x={prefix:"jsx input",body:'<${1:input} type="${2:text}" value={${3:value}} onChange={${4:handleChange}} />',description:"JSX input element"},b={prefix:"jsx button",body:"<${1:button} onClick={${2:handleClick}}>\n	${3}\n</${1:button}>",description:"JSX button"},y={prefix:"conditional render",body:"{${1:condition} && (\n	${2}\n)}",description:"Conditional rendering"},C={prefix:"ternary render",body:`{\${1:condition} ? (
	\${2}
) : (
	\${3}
)}`,description:"Ternary conditional rendering"},R={prefix:"map render",body:"{${1:items}.map((${2:item}, ${3:index}) => (\n	<${4:div} key={${3:index}}>\n		${5}\n	</${4:div}>\n))}",description:"Map list to JSX"},h={prefix:"event handler",body:"const handle${1:Event} = (${2:event}) => {\n	${3}\n}",description:"Event handler"},k={prefix:"event handler with callback",body:"const handle${1:Event} = useCallback((${2:event}) => {\n	${3}\n}, [${4:dependencies}])",description:"Event handler with useCallback"},v={prefix:"import React",body:"import React from 'react'",description:"Import React"},j={prefix:"import React with hook",body:"import React, { ${1:useState} } from 'react'",description:"Import React with hook"},E={prefix:"export default component",body:"export default ${1:ComponentName}",description:"Export default component"},S={prefix:"destructured props",body:"const ${1:ComponentName} = ({ ${2:props} }) => {\n	${3}\n}",description:"Destructured props component"},w={prefix:"destructure props",body:"const { ${1:prop1}, ${2:prop2} } = ${3:props}",description:"Destructure props object"},N={prefix:"destructure state",body:"const { ${1:state1}, ${2:state2} } = ${3:state}",description:"Destructure state object"},M={reactFunctionComponent:e,reactArrowComponent:t,reactClassComponent:n,reactMemoComponent:o,useState:s,useEffect:c,useEffectEmptyDeps:r,useRef:i,useCallback:p,useMemo:a,useContext:d,useReducer:u,jsxElement:m,jsxComponent:$,jsxClassName:l,jsxStyle:f,jsxInput:x,jsxButton:b,conditionalRender:y,ternaryRender:C,mapRender:R,eventHandler:h,eventHandlerCallback:k,importReact:v,importReactHook:j,exportDefaultComponent:E,destructuredProps:S,destructureProps:w,destructureState:N};export{y as conditionalRender,M as default,w as destructureProps,N as destructureState,S as destructuredProps,h as eventHandler,k as eventHandlerCallback,E as exportDefaultComponent,v as importReact,j as importReactHook,b as jsxButton,l as jsxClassName,$ as jsxComponent,m as jsxElement,x as jsxInput,f as jsxStyle,R as mapRender,t as reactArrowComponent,n as reactClassComponent,e as reactFunctionComponent,o as reactMemoComponent,C as ternaryRender,p as useCallback,d as useContext,c as useEffect,r as useEffectEmptyDeps,a as useMemo,u as useReducer,i as useRef,s as useState};

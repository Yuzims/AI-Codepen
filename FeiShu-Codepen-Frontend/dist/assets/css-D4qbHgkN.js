const e={prefix:"@media",body:"@media (${1:max-width: 768px}) {\n	${2}\n}",description:"Media query"},t={prefix:"@keyframes",body:"@keyframes ${1:animationName} {\n	0% { ${2} }\n	100% { ${3} }\n}",description:"CSS keyframes"},n={prefix:"@import",body:"@import url('${1:path}');",description:"Import CSS file"},r={prefix:"@font-face",body:`@font-face {
	font-family: '\${1:FontName}';
	src: url('\${2:path}');
}`,description:"Font face declaration"},i={prefix:"flex-center",body:`display: flex;
justify-content: center;
align-items: center;`,description:"Flexbox centering"},o={prefix:"absolute-center",body:`position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);`,description:"Absolute centering"},a={prefix:"truncate",body:`white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;`,description:"Text truncation"},s={prefix:"clearfix",body:`&::after {
	content: '';
	display: table;
	clear: both;
}`,description:"Clearfix hack"},d={prefix:"box-shadow",body:"box-shadow: ${1:0} ${2:4px} ${3:8px} ${4:rgba(0,0,0,0.1)};",description:"Box shadow"},c={prefix:"transition",body:"transition: ${1:all} ${2:0.3s} ${3:ease};",description:"CSS transition"},f={prefix:"transform",body:"transform: ${1:translate(-50%, -50%)};",description:"CSS transform"},p={prefix:"gradient",body:"background: linear-gradient(${1:to right}, ${2:#ff9a9e}, ${3:#fecfef});",description:"Linear gradient"},l={prefix:"grid-layout",body:"display: grid;\ngrid-template-columns: repeat(${1:3}, 1fr);\ngap: ${2:16px};",description:"Basic grid layout"},x={prefix:"reset",body:`* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}`,description:"CSS reset"},b={mediaQuery:e,keyframes:t,importUrl:n,fontFace:r,flexCenter:i,absoluteCenter:o,truncateText:a,clearfix:s,boxShadow:d,transition:c,transform:f,gradient:p,gridLayout:l,resetMargin:x};export{o as absoluteCenter,d as boxShadow,s as clearfix,b as default,i as flexCenter,r as fontFace,p as gradient,l as gridLayout,n as importUrl,t as keyframes,e as mediaQuery,x as resetMargin,f as transform,c as transition,a as truncateText};

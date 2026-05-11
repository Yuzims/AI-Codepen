const t={prefix:"html5",body:`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>\${1:Document}</title>
</head>
<body>
	\${2}
</body>
</html>`,description:"HTML5 boilerplate"},e={prefix:"meta charset",body:'<meta charset="UTF-8">',description:"Meta charset tag"},i={prefix:"meta viewport",body:'<meta name="viewport" content="width=device-width, initial-scale=1.0">',description:"Meta viewport tag"},n={prefix:"link css",body:'<link rel="stylesheet" href="${1:style.css}">',description:"Link stylesheet"},r={prefix:"script src",body:'<script src="${1:script.js}"><\/script>',description:"Script tag with src"},a={prefix:"form",body:'<form action="${1}" method="${2:post}">\n	${3}\n</form>',description:"Form element"},o={prefix:"fieldset",body:`<fieldset>
	<legend>\${1:Legend}</legend>
	\${2}
</fieldset>`,description:"Fieldset with legend"},s={prefix:"ul list",body:`<ul>
	<li>\${1}</li>
	<li>\${2}</li>
</ul>`,description:"Unordered list"},l={prefix:"ol list",body:`<ol>
	<li>\${1}</li>
	<li>\${2}</li>
</ol>`,description:"Ordered list"},d={prefix:"table",body:`<table>
	<thead>
		<tr>
			<th>\${1}</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>\${2}</td>
		</tr>
	</tbody>
</table>`,description:"Table structure"},c={prefix:"semantic layout",body:`<header>
	\${1}
</header>
<main>
	\${2}
</main>
<footer>
	\${3}
</footer>`,description:"Semantic HTML layout"},p={prefix:"figure",body:'<figure>\n	<img src="${1}" alt="${2}">\n	<figcaption>${3}</figcaption>\n</figure>',description:"Figure with image and caption"},m={prefix:"data attribute",body:'data-${1:attribute}="${2:value}"',description:"Data attribute"},b={prefix:"aria attribute",body:'aria-${1:label}="${2:value}"',description:"ARIA attribute"},f={html5:t,metaCharset:e,metaViewport:i,linkCss:n,scriptSrc:r,form:a,fieldset:o,ulList:s,olList:l,table:d,semanticLayout:c,figure:p,dataAttribute:m,ariaAttribute:b};export{b as ariaAttribute,m as dataAttribute,f as default,o as fieldset,p as figure,a as form,t as html5,n as linkCss,e as metaCharset,i as metaViewport,l as olList,r as scriptSrc,c as semanticLayout,d as table,s as ulList};

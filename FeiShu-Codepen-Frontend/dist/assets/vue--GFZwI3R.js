const e={prefix:"import createApp",body:"const { createApp } = Vue",description:"Import createApp from Vue"},t={prefix:"createApp",body:`const app = createApp({
	\${1}
})`,description:"Create Vue app"},o={prefix:"app mount",body:"app.mount('${1:#app}')",description:"Mount Vue app"},n={prefix:"import ref",body:"const { ref } = Vue",description:"Import ref from Vue"},i={prefix:"import reactive",body:"const { reactive } = Vue",description:"Import reactive from Vue"},r={prefix:"import computed",body:"const { computed } = Vue",description:"Import computed from Vue"},p={prefix:"import watch",body:"const { watch } = Vue",description:"Import watch from Vue"},d={prefix:"import onMounted",body:"const { onMounted } = Vue",description:"Import onMounted from Vue"},c={prefix:"import onUnmounted",body:"const { onUnmounted } = Vue",description:"Import onUnmounted from Vue"},s={prefix:"ref",body:"const ${1:count} = ref(${2:0})",description:"Vue ref"},u={prefix:"reactive",body:"const ${1:state} = reactive({\n	${2:property}: ${3:value}\n})",description:"Vue reactive"},a={prefix:"computed",body:"const ${1:computedValue} = computed(() => {\n	${2}\n})",description:"Vue computed"},m={prefix:"onMounted",body:`onMounted(() => {
	\${1}
})`,description:"Vue onMounted lifecycle"},f={prefix:"onUnmounted",body:`onUnmounted(() => {
	\${1}
})`,description:"Vue onUnmounted lifecycle"},v={prefix:"onUpdated",body:`onUpdated(() => {
	\${1}
})`,description:"Vue onUpdated lifecycle"},h={prefix:"onBeforeMount",body:`onBeforeMount(() => {
	\${1}
})`,description:"Vue onBeforeMount lifecycle"},$={prefix:"onBeforeUnmount",body:`onBeforeUnmount(() => {
	\${1}
})`,description:"Vue onBeforeUnmount lifecycle"},l={prefix:"watch",body:"watch(${1:source}, (${2:newValue}, ${3:oldValue}) => {\n	${4}\n})",description:"Vue watch"},y={prefix:"watchEffect",body:`watchEffect(() => {
	\${1}
})`,description:"Vue watchEffect"},x={prefix:"vue component",body:`const component = {
	setup() {
		\${1}
		return {
			\${2}
		}
	},
	template: \`\${3}\`
}`,description:"Vue component object"},V={prefix:"vue component simple",body:`const component = {
	setup() {
		\${1}
	},
	template: \`\${2}\`
}`,description:"Simple Vue component"},b={prefix:"template expression",body:"{{ ${1:expression} }}",description:"Vue template expression"},w={prefix:"v-if",body:'v-if="${1:condition}"',description:"Vue v-if directive"},M={prefix:"v-show",body:'v-show="${1:condition}"',description:"Vue v-show directive"},U={prefix:"v-for",body:'v-for="${1:item} in ${2:items}"',description:"Vue v-for directive"},B={prefix:"v-for with index",body:'v-for="(${1:item}, ${2:index}) in ${3:items}"',description:"Vue v-for with index"},E={prefix:"v-bind",body:'v-bind:${1:prop}="${2:value}"',description:"Vue v-bind directive"},I={prefix:"v-bind shorthand",body:':${1:prop}="${2:value}"',description:"Vue v-bind shorthand"},A={prefix:"v-on",body:'v-on:${1:click}="${2:handler}"',description:"Vue v-on directive"},C={prefix:"v-on shorthand",body:'@${1:click}="${2:handler}"',description:"Vue v-on shorthand"},S={prefix:"v-model",body:'v-model="${1:value}"',description:"Vue v-model directive"},O={prefix:"event handler",body:"const handle${1:Event} = () => {\n	${2}\n}",description:"Event handler"},R={prefix:"event handler with event",body:"const handle${1:Event} = (${2:event}) => {\n	${3}\n}",description:"Event handler with event parameter"},W={prefix:"method",body:"const ${1:methodName} = () => {\n	${2}\n}",description:"Vue method"},F={prefix:"async method",body:"const ${1:methodName} = async () => {\n	${2}\n}",description:"Vue async method"},H={prefix:"update ref",body:"${1:count}.value = ${2:newValue}",description:"Update ref value"},k={prefix:"update reactive",body:"${1:state}.${2:property} = ${3:newValue}",description:"Update reactive property"},N={importCreateApp:e,createApp:t,appMount:o,importRef:n,importReactive:i,importComputed:r,importWatch:p,importOnMounted:d,importOnUnmounted:c,ref:s,reactive:u,computed:a,onMounted:m,onUnmounted:f,onUpdated:v,onBeforeMount:h,onBeforeUnmount:$,watch:l,watchEffect:y,vueComponent:x,vueComponentSimple:V,templateExpression:b,vIf:w,vShow:M,vFor:U,vForWithIndex:B,vBind:E,vBindShorthand:I,vOn:A,vOnShorthand:C,vModel:S,eventHandler:O,eventHandlerWithEvent:R,method:W,asyncMethod:F,updateRef:H,updateReactive:k};export{o as appMount,F as asyncMethod,a as computed,t as createApp,N as default,O as eventHandler,R as eventHandlerWithEvent,r as importComputed,e as importCreateApp,d as importOnMounted,c as importOnUnmounted,i as importReactive,n as importRef,p as importWatch,W as method,h as onBeforeMount,$ as onBeforeUnmount,m as onMounted,f as onUnmounted,v as onUpdated,u as reactive,s as ref,b as templateExpression,k as updateReactive,H as updateRef,E as vBind,I as vBindShorthand,U as vFor,B as vForWithIndex,w as vIf,S as vModel,A as vOn,C as vOnShorthand,M as vShow,x as vueComponent,V as vueComponentSimple,l as watch,y as watchEffect};

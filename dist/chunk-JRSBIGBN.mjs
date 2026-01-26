var y={data:new Uint8Array(4),width:1,height:1};function h(n){return n instanceof HTMLVideoElement||n instanceof HTMLImageElement||n instanceof HTMLCanvasElement||n instanceof OffscreenCanvas}function $(n){return JSON.stringify(n,Object.keys(n).sort())}function M(n,c,a,i,t=0){let e=1/0,r=-1/0,s=1/0,o=-1/0,m=0,g=0;for(let p of a){let u=(t+c*i+p)*4,l=n[u],x=n[u+1];e=Math.min(e,l),r=Math.max(r,l),s=Math.min(s,x),o=Math.max(o,x),m+=n[u+2],g+=n[u+3]}return[(e+r)/2,(s+o)/2,m/a.length,g/a.length]}var f=null;function b(){return f||(f=import("@mediapipe/tasks-vision").then(({FilesetResolver:n})=>n.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),f}function d(n){return{historyParams:n?", framesAgo":"",fn:n?(i,t,e,r)=>{let s=e.replace(/\w+ /g,""),o=e?`${e}, int framesAgo`:"int framesAgo",m=s?`${s}, 0`:"0";return`${i} ${t}(${o}) {
${r}
}
${i} ${t}(${e}) { return ${t}(${m}); }`}:(i,t,e,r)=>`${i} ${t}(${e}) {
${r}
}`}}export{y as a,h as b,$ as c,M as d,b as e,d as f};
//# sourceMappingURL=chunk-JRSBIGBN.mjs.map
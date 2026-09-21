import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transform, loadBindings } from 'next/dist/build/swc/index.js';
await loadBindings();
const {code}=await transform(readFileSync('components/menu-item-details.tsx','utf8'),{filename:'menu-item-details.tsx',jsc:{parser:{syntax:'typescript',tsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}});

// Exercise the actual component's touch handlers with a deterministic animation clock.
function mount() {
 const effects=[],refs=[],handlers={},styles={};
 let time=0,closed=0,tween;
 const element={offsetHeight:700,style:{setProperty:(k,v)=>styles[k]=v},showModal(){},close(){},addEventListener:(k,v)=>handlers[k]=v,removeEventListener(){}};
 const react={useRef:(value)=>{const ref={current:value};refs.push(ref);return ref;},useState:()=>[0,()=>{}],useEffect:fn=>effects.push(fn)};
 const gsap={set:(target,values)=>Object.assign(target,values),killTweensOf:()=>{tween=null;},to:(target,options)=>{tween={target,options};}};
 const context={exports:{},require:(name)=>name==='react'?react:name==='gsap'?gsap:name==='react/jsx-runtime'?{jsx:()=>null,jsxs:()=>null}:{allergenNames:{}},window:{matchMedia:q=>({matches:q.includes('max-width')})},performance:{now:()=>time},document:{activeElement:null,body:{style:{}},addEventListener:(k,v)=>handlers[k]=v,removeEventListener(){}}};
 vm.runInNewContext(code,context);
 context.exports.default({item:{name:'Toast',description:'Toast',notes:[],allergens:[],prices:[],priceLabels:[]},category:{name:'Toasts',group:'food'},onClose:()=>closed++});
 refs[0].current=element;
 const finish=()=>{const t=tween;if(!t)return;tween=null;t.target.y=t.options.y;t.options.onUpdate?.();t.options.onComplete?.();};
 effects.forEach(fn=>fn());finish();
 const touch=(kind,y,ms=20)=>{time+=ms;handlers[kind]({touches:[{clientX:0,clientY:y}],target:{closest:()=>null},preventDefault(){}});};
 return {element,styles,touch,finish,closed:()=>closed,tween:()=>tween};
}

test('sheet can move completely offscreen and return before release; blur tracks progress',()=>{
 const m=mount();m.touch('touchstart',0);m.touch('touchmove',700,500);
 assert.equal(m.element.y,700);assert.equal(m.closed(),0);assert.equal(m.styles['--sheet-blur'],'0px');
 m.touch('touchmove',100,500);
 assert.equal(m.element.y,100);assert.ok(parseFloat(m.styles['--sheet-blur'])>5);
 m.touch('touchend',100);m.finish();assert.equal(m.element.y,0);assert.equal(m.closed(),0);
});
test('fast downward flick continues from current position all the way offscreen',()=>{
 const m=mount();m.touch('touchstart',0);m.touch('touchmove',60,20);m.touch('touchend',60,10);
 assert.equal(m.element.y,60);assert.equal(m.tween().options.y,702);
 m.finish();assert.equal(m.element.y,702);assert.equal(m.closed(),1);assert.equal(m.styles['--sheet-dim'],'0');
});
test('short slow drag and cancelled gesture return to open position',()=>{
 for(const ending of ['touchend','touchcancel']){
  const m=mount();m.touch('touchstart',0);m.touch('touchmove',80,500);m.touch(ending,80,200);m.finish();
  assert.equal(m.element.y,0);assert.equal(m.closed(),0);assert.equal(m.styles['--sheet-blur'],'6px');
 }
});


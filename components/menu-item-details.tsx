'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { RiCloseLine, RiArrowRightLine, RiTimeLine } from '@remixicon/react';
import { allergenNames, type MenuCategory, type MenuItem } from '@/lib/menu';

export default function ItemDetails({item,category,onClose}:{item:MenuItem;category:MenuCategory;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const closing=useRef(false);
 const motion=useRef({y:0});
 const closeRef=useRef<(velocity?:number)=>void>(()=>{});
 const scroller=useRef<HTMLDivElement>(null);
 const [variant,setVariant]=useState(0);
 const mobile=()=>window.matchMedia('(max-width: 760px)').matches;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function paint(){
  const element=dialog.current;if(!element)return;
  const progress=mobile()?Math.min(1,motion.current.y/Math.max(1,element.offsetHeight)):0;
  gsap.set(element,{y:motion.current.y,yPercent:0});
  element.style.setProperty('--sheet-dim',String(.667*(1-progress)));
  element.style.setProperty('--sheet-blur',`${6*(1-progress)}px`);
 }
 function settle(y:number,velocity=0,done?:()=>void){
  gsap.killTweensOf(motion.current);
  const remaining=Math.abs(y-motion.current.y);
  gsap.to(motion.current,{y,duration:reduced()?0:Math.max(.12,Math.min(.36,remaining/Math.max(1100,velocity*1000))),ease:'power2.out',onUpdate:paint,onComplete:done});
 }
 function close(velocity=0){
  if(closing.current)return;closing.current=true;
  const element=dialog.current;if(!element)return;
  gsap.killTweensOf(element);
  if(mobile())settle(element.offsetHeight+2,velocity,onClose);
  else gsap.to(element,{y:15,opacity:0,duration:reduced()?0:.25,onComplete:onClose});
 }
 closeRef.current=close;
 useEffect(()=>{
  const element=dialog.current;if(!element)return;
  const trigger=document.activeElement as HTMLElement|null;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';element.showModal();
  closing.current=false;
  if(mobile()){
   motion.current.y=reduced()?0:element.offsetHeight;paint();settle(0);
  }else if(!reduced())gsap.fromTo(element,{y:24,opacity:0},{y:0,opacity:1,duration:.35,ease:'power3.out'});
  return ()=>{gsap.killTweensOf(motion.current);gsap.killTweensOf(element);element.close();document.body.style.overflow=previousOverflow;trigger?.focus({preventScroll:true});};
 },[]);
 useEffect(()=>{
  const element=dialog.current;if(!element)return;
  let startX=0,startY=0,origin=0,lastY=0,lastTime=0,velocity=0,eligible=false,dragging=false;
  const start=(event:TouchEvent)=>{
   if(!mobile()||closing.current||event.touches.length!==1){eligible=false;return;}
   const target=event.target as HTMLElement;
   eligible=!target.closest('button,input,label,a')&&(!target.closest('.item-dialog-scroll')||(scroller.current?.scrollTop||0)<=0);
   if(!eligible)return;
   gsap.killTweensOf(motion.current);
   startX=event.touches[0].clientX;startY=lastY=event.touches[0].clientY;
   origin=motion.current.y;lastTime=performance.now();velocity=0;dragging=false;
  };
  const move=(event:TouchEvent)=>{
   if(!eligible||event.touches.length!==1)return;
   const point=event.touches[0],dx=point.clientX-startX,dy=point.clientY-startY;
   if(!dragging){
    if(Math.abs(dx)>Math.abs(dy)+8||dy< -8){cancel();return;}
    if(dy<=8)return;
    dragging=true;
   }
   event.preventDefault();
   const now=performance.now();
   velocity=(point.clientY-lastY)/Math.max(1,now-lastTime);
   lastY=point.clientY;lastTime=now;
   motion.current.y=Math.max(0,Math.min(element.offsetHeight+2,origin+dy));
   paint();
  };
  const end=()=>{
   if(!eligible)return;
   const releaseVelocity=performance.now()-lastTime<100?velocity:0;
   if(dragging&&(releaseVelocity>.55||(releaseVelocity>=-.2&&motion.current.y>element.offsetHeight*.35)))closeRef.current(releaseVelocity);
   else settle(0);
   eligible=false;dragging=false;
  };
  const cancel=()=>{eligible=false;dragging=false;settle(0);};
  element.addEventListener('touchstart',start,{passive:true});
  // Listen on the document so the gesture survives moving the entire sheet offscreen.
  document.addEventListener('touchmove',move,{passive:false});
  document.addEventListener('touchend',end);document.addEventListener('touchcancel',cancel);
  return ()=>{element.removeEventListener('touchstart',start);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',end);document.removeEventListener('touchcancel',cancel);};
 },[]);
 return <dialog ref={dialog} className="item-dialog" aria-labelledby="item-title" aria-describedby="item-description" onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();}}>
  <div className="sheet-handle" aria-hidden="true"/><span className="sheet-dismiss-hint">Swipe down to close</span>
  <div className="item-dialog-header"><span className="eyebrow">THE URBANIST / {category.name.toUpperCase()}</span><button onClick={()=>close()} className="item-dialog-close" aria-label="Close item details" autoFocus><RiCloseLine size={24}/></button></div>
  <div className="item-dialog-scroll" ref={scroller}><span className="item-dialog-accent"/><h2 id="item-title">{item.name}</h2><div className="item-dialog-meta"><span>{item.serving||category.name}</span>{category.hours&&<span><RiTimeLine size={16}/>{category.hours}</span>}</div>
   {item.prices.length>1&&<fieldset className="item-variants"><legend>Choose a serving to see its price</legend>{item.priceLabels.map((label,index)=><label key={label}><input type="radio" name="serving" value={index} checked={variant===index} onChange={()=>setVariant(index)}/><span>{label}</span><strong>{item.prices[index]} lei</strong></label>)}</fieldset>}
   <div className="item-detail-section"><h3>{category.group==='food'||item.description.includes('+')?'WHAT’S IN IT':'THE DETAILS'}</h3><p id="item-description">{item.description||`${item.name}${item.serving?` · ${item.serving}`:''}. Ask our people for more information.`}</p></div>
   {item.notes.length>0&&<div className="item-detail-notes">{item.notes.map(note=><p key={note}>{note}</p>)}</div>}
   <div className="item-detail-section"><h3>ALLERGENS LISTED IN THE MENU</h3>{item.allergens.length?<ul className="allergen-tags">{item.allergens.map(id=><li key={id}><span>{id}</span>{allergenNames[id]}</li>)}</ul>:<p className="allergen-unlisted">{item.notes.some(note=>note.startsWith('Listed by sauce:'))?'See the sauce-specific notes above.':'No item-specific allergen information listed. Please ask our staff.'}</p>}<p className="allergen-note">Not all ingredients are listed. Please tell our staff about any allergies or intolerances before ordering.</p></div>
  </div>
  <div className="item-dialog-footer"><div><span>PRICE</span><strong aria-live="polite">{item.prices.length?`${item.prices[variant]} lei`:'Ask at the bar'}</strong></div><button onClick={()=>close()} className="button button-dark">Back to the menu <RiArrowRightLine size={19}/></button></div>
 </dialog>;
}

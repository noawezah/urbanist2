'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { RiCloseLine, RiArrowRightLine, RiTimeLine } from '@remixicon/react';
import { allergenNames, type MenuCategory, type MenuItem } from '@/lib/menu';

export default function ItemDetails({item,category,onClose}:{item:MenuItem;category:MenuCategory;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const closing=useRef(false);
 const scroller=useRef<HTMLDivElement>(null);
 const [variant,setVariant]=useState(0);
 const mobile=()=>window.matchMedia('(max-width: 760px)').matches;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(()=>{
  const element=dialog.current;if(!element)return;
  const trigger=document.activeElement as HTMLElement|null;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';element.showModal();
  if(!reduced())gsap.fromTo(element,{y:mobile()?0:24,yPercent:mobile()?100:0,opacity:mobile()?1:0},{y:0,yPercent:0,opacity:1,duration:mobile()?.55:.35,ease:'power3.out'});
  return ()=>{gsap.killTweensOf(element);element.close();document.body.style.overflow=previousOverflow;trigger?.focus({preventScroll:true});};
 },[]);
 useEffect(()=>{
  const element=dialog.current;if(!element)return;
  let startX=0,startY=0,distance=0,eligible=false;
  const start=(event:TouchEvent)=>{
   if(!mobile()||closing.current||event.touches.length!==1){eligible=false;return;}
   const target=event.target as HTMLElement;
   eligible=!target.closest('button,input,label,a')&&(!target.closest('.item-dialog-scroll')||(scroller.current?.scrollTop||0)<=0);
   startX=event.touches[0].clientX;startY=event.touches[0].clientY;distance=0;
  };
  const move=(event:TouchEvent)=>{
   if(!eligible||event.touches.length!==1)return;
   const dx=event.touches[0].clientX-startX,dy=event.touches[0].clientY-startY;
   if(dy<0||Math.abs(dx)>Math.abs(dy)+8){cancel();return;}
   distance=dy;
   if(dy>8){event.preventDefault();gsap.set(element,{y:Math.min(dy,260)});}
   else if(dy<=8)gsap.set(element,{y:0});
  };
  const end=()=>{
   if(distance>90){close();}
   else if(distance>0){gsap.to(element,{y:0,duration:reduced()?0:.25,ease:'power3.out'});}
   eligible=false;distance=0;
  };
  const cancel=()=>{eligible=false;distance=0;gsap.to(element,{y:0,duration:reduced()?0:.2});};
  element.addEventListener('touchstart',start,{passive:true});
  element.addEventListener('touchmove',move,{passive:false});
  element.addEventListener('touchend',end);element.addEventListener('touchcancel',cancel);
  return ()=>{element.removeEventListener('touchstart',start);element.removeEventListener('touchmove',move);element.removeEventListener('touchend',end);element.removeEventListener('touchcancel',cancel);};
 },[onClose]);
 function close(){
  if(closing.current)return;closing.current=true;
  if(reduced()){onClose();return;}
  gsap.to(dialog.current,{y:mobile()?0:15,yPercent:mobile()?100:0,opacity:mobile()?1:0,duration:.3,ease:'power3.in',onComplete:onClose});
 }
 return <dialog ref={dialog} className="item-dialog" aria-labelledby="item-title" aria-describedby="item-description" onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();}}>
  <div className="sheet-handle" aria-hidden="true"/><span className="sheet-dismiss-hint">Swipe down to close</span>
  <div className="item-dialog-header"><span className="eyebrow">THE URBANIST / {category.name.toUpperCase()}</span><button onClick={close} className="item-dialog-close" aria-label="Close item details" autoFocus><RiCloseLine size={24}/></button></div>
  <div className="item-dialog-scroll" ref={scroller}><span className="item-dialog-accent"/><h2 id="item-title">{item.name}</h2><div className="item-dialog-meta"><span>{item.serving||category.name}</span>{category.hours&&<span><RiTimeLine size={16}/>{category.hours}</span>}</div>
   {item.prices.length>1&&<fieldset className="item-variants"><legend>Choose a serving to see its price</legend>{item.priceLabels.map((label,index)=><label key={label}><input type="radio" name="serving" value={index} checked={variant===index} onChange={()=>setVariant(index)}/><span>{label}</span><strong>{item.prices[index]} lei</strong></label>)}</fieldset>}
   <div className="item-detail-section"><h3>{category.group==='food'||item.description.includes('+')?'WHAT’S IN IT':'THE DETAILS'}</h3><p id="item-description">{item.description||`${item.name}${item.serving?` · ${item.serving}`:''}. Ask our people for more information.`}</p></div>
   {item.notes.length>0&&<div className="item-detail-notes">{item.notes.map(note=><p key={note}>{note}</p>)}</div>}
   <div className="item-detail-section"><h3>ALLERGENS LISTED IN THE MENU</h3>{item.allergens.length?<ul className="allergen-tags">{item.allergens.map(id=><li key={id}><span>{id}</span>{allergenNames[id]}</li>)}</ul>:<p className="allergen-unlisted">{item.notes.some(note=>note.startsWith('Listed by sauce:'))?'See the sauce-specific notes above.':'No item-specific allergen information listed. Please ask our staff.'}</p>}<p className="allergen-note">Not all ingredients are listed. Please tell our staff about any allergies or intolerances before ordering.</p></div>
  </div>
  <div className="item-dialog-footer"><div><span>PRICE</span><strong aria-live="polite">{item.prices.length?`${item.prices[variant]} lei`:'Ask at the bar'}</strong></div><button onClick={close} className="button button-dark">Back to the menu <RiArrowRightLine size={19}/></button></div>
 </dialog>;
}

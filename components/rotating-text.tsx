'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
const words = ['THE SOUND.', 'THE ART.', 'THE STREETS.', 'YOUR PEOPLE.'];
export default function RotatingText() {
 const root = useRef<HTMLSpanElement>(null);
 const animation = useRef<gsap.core.Timeline | null>(null);
 const [paused,setPaused] = useState(false);
 useEffect(() => {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',() => {
   const labels = root.current?.querySelectorAll<HTMLElement>('.rotating-word');
   if(!labels) return;
   gsap.set(labels,{yPercent:120,rotationX:-70,opacity:0});
   gsap.set(labels[0],{yPercent:0,rotationX:0,opacity:1});
   const timeline = gsap.timeline({repeat:-1});
   animation.current = timeline;
   words.forEach((_,i)=>{
    timeline.to(labels[i],{yPercent:-110,rotationX:65,opacity:0,duration:.65,ease:'power3.inOut'},'+=2.1')
     .fromTo(labels[(i+1)%words.length],{yPercent:110,rotationX:-65,opacity:0},{yPercent:0,rotationX:0,opacity:1,duration:.65,ease:'power3.inOut'},'<');
   });
  },root);
  return ()=>media.revert();
 },[]);
 return <span className="rotation-container"><span ref={root} className="rotating-text"><span className="sr-only">The sound, the art, the streets, your people.</span>{words.map((word,i)=><span key={word} className={`rotating-word ${i===0?'first':''}`} aria-hidden="true">{word}</span>)}</span><button className="rotation-pause" onClick={()=>{animation.current?.paused(!paused);setPaused(!paused);}} aria-pressed={paused}>{paused?'Play text':'Pause text'}</button></span>;
}

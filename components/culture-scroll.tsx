'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function CultureScroll() {
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
   const words=root.current!.querySelectorAll('.culture-scroll-word');
   gsap.set(words,{autoAlpha:0,rotationX:-80,yPercent:65});
   gsap.set(words[0],{autoAlpha:1,rotationX:0,yPercent:0});
   const timeline=gsap.timeline({scrollTrigger:{trigger:root.current,start:'top top',end:'bottom bottom',scrub:.6}});
   words.forEach((word,index)=>{
    if(index===0)return;
    timeline.to(words[index-1],{autoAlpha:0,rotationX:80,yPercent:-65,duration:.35},index-.4)
     .to(word,{autoAlpha:1,rotationX:0,yPercent:0,duration:.45},index-.3);
   });
   timeline.to({}, {duration:.5});
  });
  return ()=>media.revert();
 },[]);
 return <div className="culture-scroll" ref={root}>
  <div className="culture-scroll-sticky"><span className="eyebrow">ONE SHARED FREQUENCY</span><div className="culture-scroll-type" aria-label="Sound. Art. Street. Community.">{['SOUND','ART','STREET','COMMUNITY'].map(word=><span aria-hidden="true" className="culture-scroll-word" key={word}>{word}</span>)}</div><span className="culture-scroll-foot">BUCHAREST / UNDERGROUND</span></div>
 </div>;
}

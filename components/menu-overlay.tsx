'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { RiArrowRightUpLine, RiCloseLine } from '@remixicon/react';
export default function MenuOverlay() {
 const dialog = useRef<HTMLDialogElement>(null);
 const trigger = useRef<HTMLButtonElement>(null);
 const animation = useRef<gsap.core.Timeline | null>(null);
 const [open, setOpen] = useState(false);
 const oldOverflow = useRef('');
 const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(() => () => { animation.current?.kill(); document.body.style.overflow = oldOverflow.current; }, []);
 function show() {
  if (!dialog.current || dialog.current.open) return;
  oldOverflow.current = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialog.current.showModal(); setOpen(true);
  animation.current?.kill();
  const rows = dialog.current.querySelectorAll('.overlay-nav-label');
  const meta = dialog.current.querySelectorAll('.overlay-meta');
  animation.current = gsap.timeline();
  if (reduced()) { gsap.set(dialog.current, { clipPath: 'inset(0% 0% 0% 0%)' }); gsap.set([...rows,...meta],{clearProps:'all'}); return; }
  animation.current.fromTo(dialog.current, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .65, ease: 'power4.inOut' })
   .fromTo(rows, { yPercent: 120, rotation: 6 }, { yPercent: 0, rotation: 0, stagger: .075, duration: .7, ease: 'power4.out' }, .25)
   .fromTo(meta,{opacity:0,y:15},{opacity:1,y:0,duration:.4,stagger:.05},.5);
 }
 function close() {
  if (!dialog.current?.open) return;
  animation.current?.kill();
  const done = () => { dialog.current?.close(); setOpen(false); document.body.style.overflow = oldOverflow.current; trigger.current?.focus(); };
  if(reduced()){done();return;}
  animation.current = gsap.timeline({onComplete:done}).to(dialog.current,{clipPath:'inset(0% 0% 100% 0%)',duration:.5,ease:'power4.inOut'});
 }
 function go() {
  animation.current?.kill(); dialog.current?.close(); setOpen(false); document.body.style.overflow = oldOverflow.current;
 }
 return <>
  <button ref={trigger} onClick={show} className="overlay-trigger" aria-haspopup="dialog" aria-expanded={open}><span>Explore</span><span className="menu-bars" aria-hidden="true"><i/><i/></span></button>
  <dialog ref={dialog} className="menu-overlay" aria-label="Explore The Urbanist" onCancel={e => {e.preventDefault();close();}}>
   <div className="overlay-header"><span className="wordmark">URBANIST<span>SOUND HOUSE · BUCHAREST</span></span><button className="overlay-close" onClick={close}>Close <RiCloseLine size={24}/></button></div>
   <div className="overlay-body"><div className="overlay-meta"><span className="eyebrow">DIFFERENT SCENES.<br/>ONE SHARED SPACE.</span><p>Str. George Enescu 25<br/>Bucharest, Romania</p><span className="overlay-mini-mark">U.</span></div><nav aria-label="Full menu">{[{name:'THE MENU',target:'/menu',note:'01'},{name:'THE SOUND',target:'/#sound',note:'02'},{name:'THE CULTURE',target:'/#culture',note:'03'},{name:'THE PLACE',target:'/#visit',note:'04'}].map(item => <Link key={item.target} href={item.target} onClick={go}><span className="overlay-nav-label"><small>{item.note}</small><span>{item.name}</span><RiArrowRightUpLine/></span></Link>)}</nav></div>
   <div className="overlay-bottom overlay-meta"><span>COME AS YOU ARE.</span><Link href="/" onClick={go}>BACK HOME <RiArrowRightUpLine size={16}/></Link><span>44.4434° N / 26.0971° E</span></div>
  </dialog>
 </>;
}


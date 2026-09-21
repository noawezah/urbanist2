'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './sound-album.module.css';

const photos = [
 { src: '/images/3ef77a9a93b77dca66cf.png', alt: 'Custom horn speaker in violet light', depth: 12 },
 { src: '/images/ae8e340c8ff066b775de.png', alt: 'Friends dancing under violet lights', depth: 26 },
 { src: '/images/6075ad60433994b1a740.png', alt: 'Silver turntable with The Urbanist slipmat', depth: 38 },
 { src: '/images/b01130e91312070def06.png', alt: 'The Urbanist DJ booth', depth: 19 },
];

export default function SoundAlbum() {
 const root = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const element = root.current;
  if (!element) return;
  const media = gsap.matchMedia();
  media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
   const movers = Array.from(element.querySelectorAll<HTMLElement>('[data-album-photo]')).map((card, index) => ({
    x: gsap.quickTo(card, 'x', { duration: .8, ease: 'power3.out' }),
    y: gsap.quickTo(card, 'y', { duration: .8, ease: 'power3.out' }),
    depth: photos[index].depth,
   }));
   const move = (event: PointerEvent) => {
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    movers.forEach(mover => { mover.x(x * mover.depth); mover.y(y * mover.depth); });
   };
   const reset = () => movers.forEach(mover => { mover.x(0); mover.y(0); });
   element.addEventListener('pointermove', move);
   element.addEventListener('pointerleave', reset);
   return () => {
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerleave', reset);
   };
  });
  return () => media.revert();
 }, []);

 return <div ref={root} className={styles.album}>
  {photos.map((photo, index) => <div key={photo.src} className={`${styles.photo} ${styles[`photo${index + 1}`]}`} data-album-photo>
   <div className={styles.print}><img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" draggable={false}/></div>
  </div>)}
  <strong className={styles.headline}><span>GOOD PEOPLE.</span><span>LOUD NIGHTS.</span></strong>
 </div>;
}

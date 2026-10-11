'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type InstagramWindow = Window & {
 instgrm?: { Embeds: { process: () => void } };
};

export default function InstagramEmbed({ postUrl }: { postUrl: string }) {
 const container = useRef<HTMLDivElement>(null);
 const stage = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const slot = container.current, card = stage.current;
  if (!slot || !card) return;
  let frame = 0;
  let previousLayout = '';
  const fitCard = () => {
   frame = 0;
   // Instagram sets the iframe height asynchronously. Measure its unscaled
   // layout so changing the transform never feeds back into the next scale.
   const naturalHeight = card.offsetHeight;
   const heightLimit = Number.parseFloat(getComputedStyle(slot).maxHeight);
   const desktop = Number.isFinite(heightLimit);
   const scale = desktop && naturalHeight > 0 ? Math.min(1, heightLimit / naturalHeight) : 1;
   const fittedHeight = Math.ceil(naturalHeight * scale);
   const layout = `${desktop}:${slot.clientWidth}:${naturalHeight}:${scale}`;
   if (layout === previousLayout) return;
   previousLayout = layout;
   if (desktop && naturalHeight > 0) {
    slot.style.setProperty('--instagram-scale', String(scale));
    slot.style.setProperty('--instagram-height', `${fittedHeight}px`);
    slot.dataset.fitted = 'true';
   } else {
    delete slot.dataset.fitted;
    slot.style.removeProperty('--instagram-scale');
    slot.style.removeProperty('--instagram-height');
   }
   ScrollTrigger.refresh();
  };
  function scheduleFit() {
   if (!frame) frame = requestAnimationFrame(fitCard);
  }
  const observer = new ResizeObserver(scheduleFit);
  observer.observe(card);
  observer.observe(slot);
  window.addEventListener('resize', scheduleFit);
  scheduleFit();
  return () => {
   observer.disconnect();
   window.removeEventListener('resize', scheduleFit);
   cancelAnimationFrame(frame);
  };
 }, []);

 return <div className="instagram-embed" ref={container}>
  <div className="instagram-embed-stage" ref={stage}>
   <blockquote className="instagram-media" data-instgrm-permalink={postUrl} data-instgrm-version="14">
    <a href={postUrl} target="_blank" rel="noopener noreferrer">View this post on Instagram</a>
   </blockquote>
  </div>
  <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" onReady={() => {
   (window as InstagramWindow).instgrm?.Embeds.process();
  }}/>
 </div>;
}

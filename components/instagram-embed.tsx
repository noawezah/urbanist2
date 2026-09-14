'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type InstagramWindow = Window & {
 instgrm?: { Embeds: { process: () => void } };
};

export default function InstagramEmbed({ postUrl }: { postUrl: string }) {
 const container = useRef<HTMLDivElement>(null);
 useEffect(() => {
  if (!container.current) return;
  let frame = 0;
  const observer = new ResizeObserver(() => {
   cancelAnimationFrame(frame);
   frame = requestAnimationFrame(() => ScrollTrigger.refresh());
  });
  observer.observe(container.current);
  return () => { observer.disconnect(); cancelAnimationFrame(frame); };
 }, []);

 return <div className="instagram-embed" ref={container}>
  <blockquote className="instagram-media" data-instgrm-permalink={postUrl} data-instgrm-version="14">
   <a href={postUrl} target="_blank" rel="noopener noreferrer">View this post on Instagram</a>
  </blockquote>
  <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" onReady={() => {
   (window as InstagramWindow).instgrm?.Embeds.process();
  }}/>
 </div>;
}

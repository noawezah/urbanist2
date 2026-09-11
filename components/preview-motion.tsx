'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
export default function PreviewMotion() {
 useEffect(() => {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
   gsap.from('.venue-hero h1', { y: 36, opacity: 0, duration: .9, ease: 'power3.out' });
   gsap.utils.toArray<HTMLElement>('[data-venue-parallax]').forEach(image => gsap.fromTo(image, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
   gsap.utils.toArray<HTMLElement>('[data-menu-parallax]').forEach(image => gsap.fromTo(image, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: image.closest('.menu-wall'), start: 'top bottom', end: 'bottom top', scrub: 1 } }));
   gsap.from('.menu-wall-content h2', { y: 50, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: {trigger: '.menu-wall', start:'top 65%', once:true} });
  });
  return () => media.revert();
 }, []);
 return null;
}


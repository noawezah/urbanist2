'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

type SectionLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export default function SectionLink({ href, onClick, target, ...props }: SectionLinkProps) {
 function navigate(event: MouseEvent<HTMLAnchorElement>) {
  onClick?.(event);
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (target && target !== '_self')) return;

  const destination = new URL(href, window.location.href);
  if (destination.origin !== window.location.origin || destination.pathname !== window.location.pathname || destination.search !== window.location.search || !destination.hash) return;
  const section = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
  if (!section) return;

  event.preventDefault();
  if (destination.hash !== window.location.hash) {
   window.history.pushState(null, '', `${destination.pathname}${destination.search}${destination.hash}`);
  }
  section.scrollIntoView({
   behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
   block: 'start',
   inline: 'nearest',
  });
 }

 return <Link {...props} href={href} target={target} onClick={navigate}/>;
}

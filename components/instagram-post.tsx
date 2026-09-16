'use client';

import { useEffect, useState } from 'react';
import AnimatedButton from './animated-button';
import InstagramEmbed from './instagram-embed';

// Curated fallback until connected, or if Instagram is temporarily unavailable.
// Latest public post checked September 16, 2026: DJ AL*BU & IASMINA, published September 15.
const fallbackPostUrl='https://www.instagram.com/p/DdUGEuoIAOQ/';
export default function InstagramPost() {
 const [postUrl, setPostUrl] = useState(fallbackPostUrl);
 useEffect(() => {
  const controller = new AbortController();
  let pending = false;
  async function updatePost() {
   if (pending || document.visibilityState === 'hidden') return;
   pending = true;
   try {
    const response = await fetch('/api/instagram/latest', { cache: 'no-store', signal: controller.signal });
    if (!response.ok) return;
    const result = await response.json();
    if (!controller.signal.aborted && typeof result.postUrl === 'string') setPostUrl(result.postUrl);
   } catch { /* Keep the current post available during connection failures. */ }
   finally { pending = false; }
  }
  void updatePost();
  const interval = setInterval(updatePost, 60000);
  document.addEventListener('visibilitychange', updatePost);
  return () => { controller.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', updatePost); };
 }, []);
 return <div className="instagram-feature">
  <div className="instagram-feature-copy"><span className="eyebrow">STRAIGHT FROM THE FEED</span><h3>ON OUR<br/>FREQUENCY.</h3><p>Sessions, selectors, and everything in between.</p><AnimatedButton href={postUrl} external variant="outline" hoverText="Open Instagram">View the post</AnimatedButton></div>
  <InstagramEmbed key={postUrl} postUrl={postUrl}/>
 </div>;
}

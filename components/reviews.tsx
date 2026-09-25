'use client';
import { useEffect, useRef, useState } from 'react';
import { RiArrowRightLine, RiArrowRightUpLine, RiStarFill } from '@remixicon/react';
import AnimatedButton from './animated-button';
import type { GoogleReview, ReviewsFeed } from '@/lib/google-reviews-core';

export const googleReviewsUrl='https://www.google.com/maps/search/?api=1&query=The%20Urbanist%20Bucharest&query_place_id=ChIJ2buKhxX_sUAR--plcKMQrQo';
export function GoogleRating() {
 return <a className="google-rating" href={googleReviewsUrl} target="_blank" rel="noreferrer"><RiStarFill size={18}/><span>Read our Google reviews</span><RiArrowRightUpLine size={18}/></a>;
}
function ReviewCard({ review, index }: { review: GoogleReview; index: number }) {
 const [expanded,setExpanded]=useState(false);
 const [photoFailed,setPhotoFailed]=useState(false);
 const long=review.text.length>210;
 return <article className="review-card live-review-card" aria-label={`Review ${index+1} by ${review.author}`}>
  <div className="review-topline"><span className="rating-stars" aria-label={review.rating==null?'Google review':`${review.rating} out of 5 stars`}>{review.rating!=null&&Array.from({length:Math.round(review.rating)},(_,i)=><RiStarFill key={i} size={19}/>)}</span><span className="review-index">{String(index+1).padStart(2,'0')} / GOOGLE</span></div>
  {review.text?<><blockquote className={long&&!expanded?'review-clamped':''} id={`review-text-${index}`}>{review.text}</blockquote>{long&&<button className="review-expand" aria-expanded={expanded} aria-controls={`review-text-${index}`} onClick={()=>setExpanded(!expanded)}>{expanded?'Read less':'Read full review'} <RiArrowRightLine size={16}/></button>}</>:<p className="review-no-text">{review.rating!=null?`${review.rating} out of 5 stars.`:'Google review.'}<span>No written comment.</span></p>}
  <footer><div className="review-person">{review.photo&&!photoFailed?<img className="review-avatar" src={review.photo} alt="" width={48} height={48} loading="lazy" referrerPolicy="no-referrer" onError={()=>setPhotoFailed(true)}/>:<span className="review-avatar review-initial" aria-hidden="true">{review.author.charAt(0).toUpperCase()}</span>}<div>{review.authorUrl?<a href={review.authorUrl} target="_blank" rel="noreferrer"><strong>{review.author}</strong></a>:<strong>{review.author}</strong>}{review.relativeTime?<span className="review-date">{review.relativeTime}</span>:review.date?<time dateTime={review.date}>{new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(review.date))}</time>:null}</div></div><a className="review-source-link" href={review.mapsUrl||googleReviewsUrl} target="_blank" rel="noreferrer">View on Google Maps <RiArrowRightUpLine size={16}/></a></footer>
 </article>;
}
export default function Reviews() {
 const rail=useRef<HTMLDivElement>(null);
 const section=useRef<HTMLElement>(null);
 const sticky=useRef<HTMLDivElement>(null);
 const [feed,setFeed]=useState<ReviewsFeed|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState(false);
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const root=section.current, panel=sticky.current, track=rail.current;
  if(!root||!panel||!track||!feed?.reviews.length)return;
  let frame=0, distance=0;
  const update=()=>{
   const header=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'))||0;
   const start=root.getBoundingClientRect().top+window.scrollY-header;
   track.scrollLeft=Math.max(0,Math.min(distance,window.scrollY-start));
  };
  const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
  const measure=()=>{
   distance=Math.max(0,track.scrollWidth-track.clientWidth);
   root.style.setProperty('--review-section-height',`${panel.offsetHeight+distance+1}px`);
   onScroll();
  };
  const observer=new ResizeObserver(measure);
  observer.observe(panel);observer.observe(track);
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',measure);
  measure();
  void document.fonts.ready.then(measure);
  return ()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',measure);};
 },[feed]);
 useEffect(()=>{
  const controller=new AbortController(); let pending=false;
  async function load() {
   if(pending)return; pending=true;
   try {
    const response=await fetch('/api/reviews',{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw new Error('Unavailable');
    const result:ReviewsFeed=await response.json();
    if(!controller.signal.aborted){setFeed(result);setError(false);}
   } catch {if(!controller.signal.aborted)setError(true);}
   finally {pending=false;if(!controller.signal.aborted)setLoading(false);}
  }
  void load();
  const timer=setInterval(()=>{if(document.visibilityState==='visible')void load();},600000);
  return ()=>{controller.abort();clearInterval(timer);};
 },[attempt]);
 const reviews=feed?.reviews??[];
 return <section ref={section} className={`venue-section reviews-section${reviews.length?' has-review-track':''}`} aria-label="Google reviews"><div ref={sticky} className="review-sticky"><span className="eyebrow">FROM OUR PEOPLE</span><div className="venue-section-title"><h2>WORD ON<br/>THE STREET.</h2><AnimatedButton href={feed?.googleMapsUri||googleReviewsUrl} external variant="outline" hoverText="Hear it from them">Read Google reviews</AnimatedButton></div>
  <div className="review-edition"><span>RELEVANT REVIEWS</span>{feed&&(feed.averageRating!=null||feed.totalReviewCount!=null)&&<span>{feed.averageRating!=null?`${feed.averageRating.toFixed(1)} / 5 overall`:''}{feed.averageRating!=null&&feed.totalReviewCount!=null?' · ':''}{feed.totalReviewCount!=null?`${feed.totalReviewCount.toLocaleString('en-GB')} Google reviews`:''}</span>}</div>
  {loading&&!feed?<div className="review-state" role="status" aria-busy="true"><span className="review-loading-line"/>Loading words from our people…</div>:error&&!feed?<div className="review-state" role="status"><p>We couldn’t load the reviews right now.</p><button className="review-expand" onClick={()=>{setLoading(true);setError(false);setAttempt(n=>n+1);}}>Try again <RiArrowRightLine size={16}/></button><GoogleRating/></div>:reviews.length===0?<div className="review-state" role="status"><p>No five-star reviews in the results Google returned right now.</p><GoogleRating/></div>:<>
   {error&&<p className="review-refresh-note" role="status">Showing the last loaded reviews. We’ll try refreshing again shortly.</p>}
   <div className="review-carousel" ref={rail} tabIndex={0} aria-label="Five-star Google reviews; scroll down to read more" onKeyDown={event=>{if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;event.preventDefault();const card=rail.current?.firstElementChild as HTMLElement|null;window.scrollBy({top:(event.key==='ArrowRight'?1:-1)*(card?.offsetWidth||window.innerWidth),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}>{reviews.map((review,index)=><ReviewCard review={review} index={index} key={review.id}/>)}</div>
  </>}
 </div></section>;
}

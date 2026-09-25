'use client';
import { useEffect, useRef, useState } from 'react';
import { RiArrowLeftLine, RiArrowRightLine, RiArrowRightUpLine, RiStarFill } from '@remixicon/react';
import AnimatedButton from './animated-button';
import type { GoogleReview, ReviewsFeed } from '@/lib/google-reviews-core';

export const googleReviewsUrl='https://www.google.com/maps/search/?api=1&query=The%20Urbanist%20Bucharest&query_place_id=ChIJ2buKhxX_sUAR--plcKMQrQo';
export function GoogleRating() {
 return <a className="google-rating" href={googleReviewsUrl} target="_blank" rel="noreferrer"><RiStarFill size={18}/><span>Read our Google reviews</span><RiArrowRightUpLine size={18}/></a>;
}
function ReviewCard({ review, index }: { review: GoogleReview; index: number }) {
 const [expanded,setExpanded]=useState(false);
 const [photoFailed,setPhotoFailed]=useState(false);
 const long=review.text.length>420;
 return <article className="review-card live-review-card" aria-label={`Review ${index+1} by ${review.author}`}>
  <div className="review-topline"><span className="rating-stars" aria-label={review.rating==null?'Google review':`${review.rating} out of 5 stars`}>{review.rating!=null&&Array.from({length:Math.round(review.rating)},(_,i)=><RiStarFill key={i} size={19}/>)}</span><span className="review-index">{String(index+1).padStart(2,'0')} / GOOGLE</span></div>
  {review.text?<><blockquote className={long&&!expanded?'review-clamped':''} id={`review-text-${index}`}>{review.text}</blockquote>{long&&<button className="review-expand" aria-expanded={expanded} aria-controls={`review-text-${index}`} onClick={()=>setExpanded(!expanded)}>{expanded?'Read less':'Read full review'} <RiArrowRightLine size={16}/></button>}</>:<p className="review-no-text">{review.rating!=null?`${review.rating} out of 5 stars.`:'Google review.'}<span>No written comment.</span></p>}
  <footer><div className="review-person">{review.photo&&!photoFailed?<img className="review-avatar" src={review.photo} alt="" width={48} height={48} loading="lazy" referrerPolicy="no-referrer" onError={()=>setPhotoFailed(true)}/>:<span className="review-avatar review-initial" aria-hidden="true">{review.author.charAt(0).toUpperCase()}</span>}<div>{review.authorUrl?<a href={review.authorUrl} target="_blank" rel="noreferrer"><strong>{review.author}</strong></a>:<strong>{review.author}</strong>}{review.relativeTime?<span className="review-date">{review.relativeTime}</span>:review.date?<time dateTime={review.date}>{new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(review.date))}</time>:null}</div></div><a className="review-source-link" href={review.mapsUrl||googleReviewsUrl} target="_blank" rel="noreferrer">View on Google Maps <RiArrowRightUpLine size={16}/></a></footer>
 </article>;
}
export default function Reviews() {
 const rail=useRef<HTMLDivElement>(null);
 const [feed,setFeed]=useState<ReviewsFeed|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState(false);
 const [attempt,setAttempt]=useState(0);
 const [active,setActive]=useState(0);
 const [atEnd,setAtEnd]=useState(false);
 useEffect(()=>{
  const element=rail.current;if(!element)return;
  const update=()=>setAtEnd(element.scrollLeft+element.clientWidth>=element.scrollWidth-2);
  const observer=new ResizeObserver(update);observer.observe(element);update();
  element.addEventListener('scroll',update,{passive:true});
  return ()=>{observer.disconnect();element.removeEventListener('scroll',update);};
 },[feed]);
 useEffect(()=>{
  const controller=new AbortController(); let pending=false;
  async function load() {
   if(pending)return; pending=true;
   try {
    const response=await fetch('/api/reviews',{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw new Error('Unavailable');
    const result:ReviewsFeed=await response.json();
    if(!controller.signal.aborted){setFeed(result);setError(false);setActive(current=>Math.min(current,Math.max(0,result.reviews.length-1)));}
   } catch {if(!controller.signal.aborted)setError(true);}
   finally {pending=false;if(!controller.signal.aborted)setLoading(false);}
  }
  void load();
  const timer=setInterval(()=>{if(document.visibilityState==='visible')void load();},600000);
  return ()=>{controller.abort();clearInterval(timer);};
 },[attempt]);
 const reviews=feed?.reviews??[];
 const go=(direction:number)=>{
  const index=Math.max(0,Math.min(reviews.length-1,active+direction));
  const card=rail.current?.children[index] as HTMLElement|undefined;
  if(card&&rail.current)rail.current.scrollTo({left:card.offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 return <section className="venue-section reviews-section" aria-label="Google reviews"><span className="eyebrow">FROM OUR PEOPLE</span><div className="venue-section-title"><h2>WORD ON<br/>THE STREET.</h2><AnimatedButton href={feed?.googleMapsUri||googleReviewsUrl} external variant="outline" hoverText="Hear it from them">Read Google reviews</AnimatedButton></div>
  <div className="review-edition"><span>GOOGLE REVIEWS · ORDERED BY RELEVANCE</span>{feed&&(feed.averageRating!=null||feed.totalReviewCount!=null)&&<span>{feed.averageRating!=null?`${feed.averageRating.toFixed(1)} / 5 overall`:''}{feed.averageRating!=null&&feed.totalReviewCount!=null?' · ':''}{feed.totalReviewCount!=null?`${feed.totalReviewCount.toLocaleString('en-GB')} Google reviews`:''}</span>}</div>
  {loading&&!feed?<div className="review-state" role="status" aria-busy="true"><span className="review-loading-line"/>Loading words from our people…</div>:error&&!feed?<div className="review-state" role="status"><p>We couldn’t load the reviews right now.</p><button className="review-expand" onClick={()=>{setLoading(true);setError(false);setAttempt(n=>n+1);}}>Try again <RiArrowRightLine size={16}/></button><GoogleRating/></div>:reviews.length===0?<div className="review-state" role="status"><p>No Google reviews to show yet.</p><GoogleRating/></div>:<>
   {error&&<p className="review-refresh-note" role="status">Showing the last loaded reviews. We’ll try refreshing again shortly.</p>}
   <div className="review-carousel" ref={rail} tabIndex={0} aria-label="Google reviews; swipe or use the arrow buttons" onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();go(event.key==='ArrowRight'?1:-1);}}} onScroll={()=>{const element=rail.current;if(!element)return;const cards=Array.from(element.children) as HTMLElement[];setActive(cards.reduce((best,card,index)=>Math.abs(card.offsetLeft-element.scrollLeft)<Math.abs(cards[best].offsetLeft-element.scrollLeft)?index:best,0));}}>{reviews.map((review,index)=><ReviewCard review={review} index={index} key={review.id}/>)}</div>
   <div className="review-controls"><button onClick={()=>go(-1)} disabled={active===0} aria-label="Previous review"><RiArrowLeftLine/></button><span aria-live="polite">{active+1} / {reviews.length}</span><button onClick={()=>go(1)} disabled={atEnd||active>=reviews.length-1} aria-label="Next review"><RiArrowRightLine/></button></div>
  </>}
 </section>;
}

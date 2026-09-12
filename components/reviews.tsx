'use client';
import { useRef, useState } from 'react';
import { RiArrowLeftLine, RiArrowRightLine, RiArrowRightUpLine, RiStarFill } from '@remixicon/react';
import reviewData from '@/data/reviews.json';

export const googleReviewsUrl='https://www.google.com/maps?cid=769289405501663995';
type Review={author:string;rating:number;text:string;url:string;sourceDateLabel:string;checkedAt:string;userSelected:boolean};
const reviews=(reviewData as Review[]).filter(review=>review.userSelected&&review.rating>=4);

export function GoogleRating() {
 return <a className="google-rating" href={googleReviewsUrl} target="_blank" rel="noreferrer" aria-label="4.5 out of 5, 1,983 Google reviews. Read reviews on Google"><span className="rating-number">4.5</span><span className="rating-stars" aria-hidden="true">{Array.from({length:5},(_,i)=><RiStarFill key={i} size={17}/>)}</span><span>1,983 Google reviews</span><RiArrowRightUpLine size={18}/></a>;
}

export default function Reviews() {
 const rail=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(0);
 const go=(direction:number)=>{
  const index=Math.max(0,Math.min(reviews.length-1,active+direction));
  const card=rail.current?.children[index] as HTMLElement|undefined;
  if(card&&rail.current)rail.current.scrollTo({left:card.offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 return <section className="venue-section reviews-section" aria-label="Google reviews"><span className="eyebrow">FROM OUR PEOPLE</span><div className="venue-section-title"><h2>WORD ON<br/>THE STREET.</h2><a href={googleReviewsUrl} target="_blank" rel="noreferrer">Read Google reviews <RiArrowRightUpLine size={20}/></a></div>
 {reviews.length>0?<><div className="review-carousel" ref={rail} onScroll={()=>{const element=rail.current;if(!element)return;const cards=Array.from(element.children) as HTMLElement[];setActive(cards.reduce((best,card,index)=>Math.abs(card.offsetLeft-element.scrollLeft)<Math.abs(cards[best].offsetLeft-element.scrollLeft)?index:best,0));}}>{reviews.map(review=><article className="review-card" key={review.url}><span className="rating-stars" aria-label={`${review.rating} out of 5`}>{Array.from({length:review.rating},(_,i)=><RiStarFill key={i} size={18}/>)}</span><blockquote>“{review.text}”</blockquote><footer><span>{review.author}<small>Google review · translated from Romanian</small></span><a href={review.url} target="_blank" rel="noreferrer" aria-label={`Read ${review.author}'s review on Google`}><RiArrowRightUpLine/></a></footer></article>)}</div><div className="review-controls"><button onClick={()=>go(-1)} disabled={active===0} aria-label="Previous review"><RiArrowLeftLine/></button><span aria-live="polite">{active+1} / {reviews.length}</span><button onClick={()=>go(1)} disabled={active===reviews.length-1} aria-label="Next review"><RiArrowRightLine/></button></div></>:<GoogleRating/>}
 </section>;
}




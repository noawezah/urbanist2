import assert from 'node:assert/strict';
import test from 'node:test';
import { collectGoogleReviews } from '../lib/google-reviews-core.ts';
const review=(id,starRating='FIVE',day=1)=>({reviewId:String(id),starRating,reviewer:{displayName:'Guest '+id,profilePhotoUrl:'https://example.com/photo.jpg'},comment:'Actual comment '+id,createTime:'2026-01-01T00:00:00Z',updateTime:`2026-09-${String(day).padStart(2,'0')}T00:00:00Z`});
test('follows pages past non-five-star reviews and stops at 15',async()=>{
 const calls=[];
 const pages=[{reviews:Array.from({length:50},(_,i)=>review(i,'FOUR')),nextPageToken:'second',averageRating:4.5,totalReviewCount:1983},{reviews:Array.from({length:10},(_,i)=>review(i+50,'FIVE',30-i)),nextPageToken:'third'},{reviews:Array.from({length:10},(_,i)=>review(i+60,'FIVE',20-i)),nextPageToken:'unused'}];
 const result=await collectGoogleReviews(async token=>{calls.push(token);return pages[calls.length-1];});
 assert.deepEqual(calls,[undefined,'second','third']);assert.equal(result.reviews.length,15);assert.equal(result.reviews[0].id,'50');assert.equal(result.reviews[14].id,'64');assert.equal(result.totalReviewCount,1983);
});
test('empty, short, anonymous, rating-only and unsafe-photo cases',async()=>{
 assert.deepEqual((await collectGoogleReviews(async()=>({}))).reviews,[]);
 const result=await collectGoogleReviews(async()=>({reviews:[{...review('anon'),comment:undefined,reviewer:{isAnonymous:true,displayName:'Hidden',profilePhotoUrl:'https://example.com/a'}},{...review('photo'),reviewer:{displayName:'Safe',profilePhotoUrl:'javascript:bad'}},review('low','ONE'),{...review('bad'),updateTime:'invalid',createTime:'invalid'}]}));
 assert.equal(result.reviews.length,2);assert.equal(result.reviews[0].author,'Anonymous reviewer');assert.equal(result.reviews[0].text,'');assert.equal(result.reviews[0].photo,null);assert.equal(result.reviews[1].photo,null);
});
test('deduplicates and rejects repeated pagination tokens',async()=>{
 let calls=0;const result=await collectGoogleReviews(async()=>++calls===1?{reviews:[review('a')],nextPageToken:'b'}:{reviews:[review('a'),review('b')]});assert.equal(result.reviews.length,2);
 await assert.rejects(()=>collectGoogleReviews(async()=>({reviews:[],nextPageToken:'loop'})),/Repeated/);
});
test('does not publish partial results on an upstream failure',async()=>{
 let calls=0;await assert.rejects(()=>collectGoogleReviews(async()=>{if(++calls===1)return {reviews:[review('a')],nextPageToken:'b'};throw new Error('upstream failed');}));
});

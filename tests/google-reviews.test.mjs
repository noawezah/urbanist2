import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePlaceReviews } from '../lib/google-places-reviews.ts';

test('filters five-star reviews before sorting newest returned first while keeping place totals', () => {
 const raw = {
  rating: 4.7, userRatingCount: 2040, googleMapsUri: 'https://maps.google.com/place',
  reviews: Array.from({length: 6}, (_, i) => ({
   name: `places/id/reviews/${i}`, rating: 5-i%2,
   text: {text: `Review ${i}`}, publishTime: `2026-09-${String(i+1).padStart(2,'0')}T12:00:00Z`,
   relativePublishTimeDescription: '2 days ago', googleMapsUri: `https://maps.google.com/review/${i}`,
   authorAttribution: {displayName: `Guest ${i}`, photoUri: 'https://lh3.googleusercontent.com/avatar', uri: 'https://maps.google.com/profile'},
  })),
 };
 const feed = parsePlaceReviews(raw);
 assert.equal(feed.averageRating, 4.7); assert.equal(feed.totalReviewCount, 2040);
 assert.equal(feed.reviews.length, 3); assert.deepEqual(feed.reviews.map(review=>review.author), ['Guest 4','Guest 2','Guest 0']);
 assert.ok(feed.reviews.every(review=>review.rating===5)); assert.equal(feed.reviews[0].relativeTime, '2 days ago');
 assert.equal(feed.reviews[0].photo, 'https://lh3.googleusercontent.com/avatar');
 assert.equal(feed.reviews[0].mapsUrl, 'https://maps.google.com/review/4');
 assert.equal(feed.googleMapsUri, 'https://maps.google.com/place');
});

test('no returned five-star reviews keeps totals and provides an empty array', () => {
 const feed = parsePlaceReviews({rating:4.6,userRatingCount:25,googleMapsUri:'https://maps.google.com/place',reviews:[{rating:3},{rating:4}]});
 assert.deepEqual(feed.reviews,[]); assert.equal(feed.averageRating,4.6);
 assert.equal(feed.totalReviewCount,25); assert.equal(feed.googleMapsUri,'https://maps.google.com/place');
});

test('caps results at five and puts missing publication times last', () => {
 const reviews=Array.from({length:7},(_,i)=>({name:`review-${i}`,rating:5,publishTime:i===0?undefined:`2026-09-${String(i).padStart(2,'0')}T12:00:00Z`}));
 const feed=parsePlaceReviews({reviews});
 assert.deepEqual(feed.reviews.map(review=>review.id),['review-6','review-5','review-4','review-3','review-2']);
});

test('missing fields, unsafe links, rating-only and malformed dates degrade safely', () => {
 const feed = parsePlaceReviews({reviews:[{rating:5,text:{},publishTime:'not a date',authorAttribution:{photoUri:'javascript:bad',uri:'http://bad'}}]});
 assert.equal(feed.averageRating,null); assert.equal(feed.totalReviewCount,null);
 assert.equal(feed.reviews[0].author,'Google reviewer'); assert.equal(feed.reviews[0].photo,null);
 assert.equal(feed.reviews[0].authorUrl,null); assert.equal(feed.reviews[0].text,'');
 assert.equal(feed.reviews[0].date,''); assert.equal(feed.reviews[0].rating,5);
 assert.deepEqual(parsePlaceReviews({reviews:null}).reviews,[]);
});

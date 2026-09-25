import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePlaceReviews } from '../lib/google-places-reviews.ts';

test('maps Places rating, count and at most five attributed reviews', () => {
 const raw = {
  rating: 4.7, userRatingCount: 2040, googleMapsUri: 'https://maps.google.com/place',
  reviews: Array.from({length: 6}, (_, i) => ({
   name: `places/id/reviews/${i}`, rating: 5-i%2,
   text: {text: `Review ${i}`}, publishTime: '2026-09-23T12:00:00Z',
   relativePublishTimeDescription: '2 days ago', googleMapsUri: `https://maps.google.com/review/${i}`,
   authorAttribution: {displayName: `Guest ${i}`, photoUri: 'https://lh3.googleusercontent.com/avatar', uri: 'https://maps.google.com/profile'},
  })),
 };
 const feed = parsePlaceReviews(raw);
 assert.equal(feed.averageRating, 4.7); assert.equal(feed.totalReviewCount, 2040);
 assert.equal(feed.reviews.length, 5); assert.equal(feed.reviews[0].author, 'Guest 0');
 assert.equal(feed.reviews[1].rating, 4); assert.equal(feed.reviews[0].relativeTime, '2 days ago');
 assert.equal(feed.reviews[0].photo, 'https://lh3.googleusercontent.com/avatar');
 assert.equal(feed.reviews[0].mapsUrl, 'https://maps.google.com/review/0');
});

test('missing fields, unsafe links, rating-only and malformed dates degrade safely', () => {
 const feed = parsePlaceReviews({reviews:[{rating:3,text:{},publishTime:'not a date',authorAttribution:{photoUri:'javascript:bad',uri:'http://bad'}}]});
 assert.equal(feed.averageRating,null); assert.equal(feed.totalReviewCount,null);
 assert.equal(feed.reviews[0].author,'Google reviewer'); assert.equal(feed.reviews[0].photo,null);
 assert.equal(feed.reviews[0].authorUrl,null); assert.equal(feed.reviews[0].text,'');
 assert.equal(feed.reviews[0].date,''); assert.equal(feed.reviews[0].rating,3);
 assert.deepEqual(parsePlaceReviews({reviews:null}).reviews,[]);
});

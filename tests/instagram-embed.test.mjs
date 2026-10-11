import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import postcss from 'postcss';
import { transform, loadBindings } from 'next/dist/build/swc/index.js';

await loadBindings();
const compile = async file => (await transform(readFileSync(`components/${file}`, 'utf8'), {
 filename: file,
 jsc: { parser: { syntax: 'typescript', tsx: true }, transform: { react: { runtime: 'automatic' } } },
 module: { type: 'commonjs' },
})).code;
const [embedCode, postCode] = await Promise.all(['instagram-embed.tsx', 'instagram-post.tsx'].map(compile));
const jsx = (type, props, key) => ({ type, props, key });
const css = postcss.parse(readFileSync('app/globals.css', 'utf8'));
let limitRule;
css.walkRules('.venue-page .instagram-embed', rule => {
 rule.walkDecls('max-height', declaration => { limitRule = declaration; });
});
assert.match(limitRule.parent.parent.params, /min-width:\s*761px/);
const [, clearance] = limitRule.value.match(/^calc\(100svh - var\(--header-height\) - ([\d.]+)px\)$/);
const heightLimit = height => height - 76 - +clearance;
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} differs from ${expected}`);

// Run the actual effect with native, untransformed dimensions and a deterministic frame queue.
function mount({ width = 1248, height = 646, cardHeight = 1100, cardWidth = 528, postUrl = 'https://www.instagram.com/p/Example/' } = {}) {
 const effects = [], frames = new Map(), events = new Map(), styles = new Map(), writes = [];
 const viewport = { width, height };
 let nextFrame = 0, refreshes = 0, processCalls = 0, observer;
 const slot = { clientWidth: cardWidth, dataset: {}, style: {
  setProperty(name, value) { styles.set(name, value); writes.push([name, value]); },
  removeProperty(name) { styles.delete(name); writes.push([name, null]); },
 } };
 const card = { offsetHeight: cardHeight, getBoundingClientRect() {
  return { height: this.offsetHeight * Number(styles.get('--instagram-scale') || 1) };
 } };
 const browser = {
  addEventListener(name, handler) { events.set(name, handler); },
  removeEventListener(name, handler) { if (events.get(name) === handler) events.delete(name); },
  instgrm: { Embeds: { process() { processCalls++; } } },
 };
 const context = {
  exports: {}, window: browser,
  requestAnimationFrame(handler) { const id = ++nextFrame; frames.set(id, handler); return id; },
  cancelAnimationFrame(id) { frames.delete(id); },
  getComputedStyle(element) {
   assert.equal(element, slot);
   return { maxHeight: viewport.width >= 761 ? `${heightLimit(viewport.height)}px` : 'none' };
  },
  ResizeObserver: class {
   constructor(handler) { observer = this; this.handler = handler; this.targets = new Set(); }
   observe(element) { this.targets.add(element); }
   disconnect() { this.targets.clear(); }
   emit(element) { if (this.targets.has(element)) this.handler([{ target: element }]); }
  },
  require(name) {
   if (name === 'react') return { useRef: current => ({ current }), useEffect: effect => effects.push(effect) };
   if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
   if (name === 'next/script') return () => null;
   if (name === 'gsap/ScrollTrigger') return { ScrollTrigger: { refresh() { refreshes++; } } };
   throw new Error(`Unexpected import: ${name}`);
  },
 };
 vm.runInNewContext(embedCode, context);
 const rendered = context.exports.default({ postUrl });
 rendered.props.ref.current = slot;
 rendered.props.children[0].props.ref.current = card;
 const cleanups = effects.map(effect => effect());
 const flush = () => { const pending = [...frames.entries()]; frames.clear(); pending.forEach(([, callback]) => callback()); };
 const resize = (values = {}) => { Object.assign(viewport, values); events.get('resize')?.(); };
 const assertComplete = () => {
  const scale = Number(styles.get('--instagram-scale'));
  const reserved = Math.min(Number.parseFloat(styles.get('--instagram-height')), heightLimit(viewport.height));
  assert.ok(scale > 0 && scale <= 1);
  assert.ok(card.offsetHeight * scale <= reserved + 1e-8, 'the complete native card must fit inside the reserved slot');
 };
 return { slot, card, styles, writes, viewport, observer, frames, events, rendered, flush, resize, assertComplete,
  refreshes: () => refreshes, processCalls: () => processCalls, cleanup: () => cleanups.forEach(cleanup => cleanup()) };
}

test('the complete tall Instagram card fits desktop height and refits when Instagram changes native height', () => {
 for (const height of [600, 646, 720, 768, 1200]) {
  const m = mount({ height }); m.flush();
  near(Number(m.styles.get('--instagram-scale')), heightLimit(height) / 1100);
  assert.equal(m.card.offsetHeight, 1100);
  if (height === 1200) assert.equal(m.styles.get('--instagram-height'), '1084px', 'tall desktops should use the full available height instead of the old 600px cap');
  m.assertComplete();
  m.card.offsetHeight = 1800; m.observer.emit(m.card); m.flush();
  near(Number(m.styles.get('--instagram-scale')), heightLimit(height) / 1800);
  m.assertComplete();
  m.card.offsetHeight = 200; m.observer.emit(m.card); m.flush();
  assert.equal(m.styles.get('--instagram-scale'), '1');
  assert.equal(m.styles.get('--instagram-height'), '200px');
  m.assertComplete(); m.cleanup();
 }
});

test('viewport and column resize update the fit, including fractional limits with identical rounded height', () => {
 const m = mount(); m.flush();
 m.resize({ height: 645.5 }); m.flush();
 assert.equal(m.styles.get('--instagram-height'), '530px');
 near(Number(m.styles.get('--instagram-scale')), 529.5 / 1100);
 m.assertComplete();
 m.slot.clientWidth = 350; m.card.offsetHeight = 950;
 m.resize({ width: 900, height: 720 }); m.observer.emit(m.card);
 assert.equal(m.frames.size, 1, 'resize events should share one pending frame');
 m.flush(); near(Number(m.styles.get('--instagram-scale')), heightLimit(720) / 950);
 m.assertComplete();
 const count = m.refreshes();
 m.slot.clientWidth = 340; m.observer.emit(m.slot); m.flush();
 assert.equal(m.refreshes(), count + 1, 'changed column width refreshes scroll geometry');
 m.cleanup();
});

test('observer notifications caused by fitted layout do not repeatedly shrink or refresh the card', () => {
 const m = mount(); m.flush();
 const scale = m.styles.get('--instagram-scale'), writes = m.writes.length;
 for (let i = 0; i < 8; i++) {
  m.observer.emit(m.slot); m.observer.emit(m.card);
  assert.equal(m.frames.size, 1); m.flush();
 }
 assert.equal(m.styles.get('--instagram-scale'), scale);
 assert.equal(m.writes.length, writes);
 assert.equal(m.refreshes(), 1);
 assert.equal(m.frames.size, 0);
 m.cleanup();
});

test('mobile restores native flow and desktop or asynchronous loading can fit again', () => {
 const m = mount(); m.flush();
 m.resize({ width: 760 }); m.flush();
 assert.equal(m.slot.dataset.fitted, undefined);
 assert.equal(m.styles.size, 0);
 assert.equal(m.card.getBoundingClientRect().height, 1100);
 m.resize({ width: 761, height: 600 }); m.flush(); m.assertComplete();
 m.card.offsetHeight = 0; m.observer.emit(m.card); m.flush();
 assert.equal(m.slot.dataset.fitted, undefined); assert.equal(m.styles.size, 0);
 m.card.offsetHeight = 1400; m.observer.emit(m.card); m.flush(); m.assertComplete();
 m.cleanup();
 const mobile = mount({ width: 390, height: 844 }); mobile.flush();
 assert.equal(mobile.styles.size, 0); assert.equal(mobile.slot.dataset.fitted, undefined); mobile.cleanup();
});

test('cleanup cancels work and a newly keyed post measures fresh native dimensions', () => {
 const old = mount(); old.flush(); old.observer.emit(old.card);
 const count = old.refreshes(); old.cleanup();
 assert.equal(old.frames.size, 0); assert.equal(old.events.has('resize'), false); assert.equal(old.observer.targets.size, 0);
 old.observer.emit(old.card); old.resize({ height: 720 }); old.flush();
 assert.equal(old.refreshes(), count);
 const postUrl = 'https://www.instagram.com/reel/Latest/';
 const latest = mount({ postUrl, cardHeight: 1500 }); latest.flush(); latest.assertComplete();
 const blockquote = latest.rendered.props.children[0].props.children;
 assert.equal(blockquote.props['data-instgrm-permalink'], postUrl);
 assert.equal(blockquote.props.children.props.href, postUrl);
 latest.rendered.props.children[1].props.onReady(); assert.equal(latest.processCalls(), 1);
 latest.cleanup();
});

test('the async latest-post update shares one URL between the native embed, key, and post button', async () => {
 const effects = [], calls = [], embed = () => null;
 const latest = 'https://www.instagram.com/reel/Newest/';
 let state, collecting = true, intervalCleared = false;
 const context = {
  exports: {}, AbortController,
  document: { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} },
  setInterval() { return 1; }, clearInterval() { intervalCleared = true; },
  fetch: async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ postUrl: latest }) }; },
  require(name) {
   if (name === 'react') return {
    useState(initial) { state ??= initial; return [state, value => { state = value; }]; },
    useEffect(effect) { if (collecting) effects.push(effect); },
   };
   if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
   if (name === './instagram-embed') return embed;
   if (name === './animated-button') return () => null;
   throw new Error(`Unexpected import: ${name}`);
  },
 };
 vm.runInNewContext(postCode, context);
 context.exports.default(); const cleanup = effects[0](); collecting = false;
 await new Promise(resolve => setImmediate(resolve));
 const rendered = context.exports.default();
 assert.equal(rendered.props.children[1].type, embed);
 assert.equal(rendered.props.children[1].props.postUrl, latest);
 assert.equal(rendered.props.children[1].key, latest);
 assert.equal(rendered.props.children[0].props.children[3].props.href, latest);
 assert.equal(calls[0].url, '/api/instagram/latest'); assert.equal(calls[0].options.cache, 'no-store');
 cleanup(); assert.equal(calls[0].options.signal.aborted, true); assert.equal(intervalCleared, true);
});

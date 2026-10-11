import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transform, loadBindings } from 'next/dist/build/swc/index.js';

await loadBindings();
const { code } = await transform(readFileSync('components/section-link.tsx', 'utf8'), {
 filename: 'section-link.tsx',
 jsc: { parser: { syntax: 'typescript', tsx: true }, transform: { react: { runtime: 'automatic' } } },
 module: { type: 'commonjs' },
});

// Render the actual component and exercise its handler without replacing navigation logic.
function mount({ current = 'http://localhost:3000/#hero', href = '/#hero', target, reduced = false, onClick, onScroll, missing = false } = {}) {
 const calls = [], nextLink = () => null;
 const browser = {
  location: new URL(current),
  history: { pushState(_state, _unused, destination) {
   calls.push({ type: 'history', destination });
   browser.location = new URL(destination, browser.location.href);
  } },
  matchMedia: () => ({ matches: reduced }),
 };
 const context = {
  exports: {}, URL, window: browser,
  document: { getElementById(id) {
   if (missing) return null;
   return { scrollIntoView(options) { onScroll?.(); calls.push({ type: 'scroll', id, ...options }); } };
  } },
  require(name) {
   if (name === 'next/link') return nextLink;
   if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
   throw new Error(`Unexpected import: ${name}`);
  },
 };
 vm.runInNewContext(code, context);
 const rendered = context.exports.default({ href, target, onClick, children: 'Navigation' });
 function click(overrides = {}) {
  const event = {
   button: 0, defaultPrevented: false,
   metaKey: false, ctrlKey: false, shiftKey: false, altKey: false,
   preventDefault() { this.defaultPrevented = true; },
   ...overrides,
  };
  rendered.props.onClick(event);
  return event;
 }
 return { click, calls, browser, rendered, nextLink };
}

test('clicking the hero logo again returns to the hero without duplicate history entries', () => {
 const link = mount();
 assert.equal(link.click().defaultPrevented, true);
 assert.equal(link.click().defaultPrevented, true);
 assert.deepEqual(link.calls, Array(2).fill({ type: 'scroll', id: 'hero', behavior: 'smooth', block: 'start', inline: 'nearest' }));
 assert.equal(link.browser.location.hash, '#hero');
});

test('a same-page section link updates the URL and scrolls to its visible content', () => {
 const link = mount({ href: '/#culture' });
 assert.equal(link.click().defaultPrevented, true);
 assert.equal(link.browser.location.hash, '#culture');
 assert.deepEqual(link.calls, [
  { type: 'history', destination: '/#culture' },
  { type: 'scroll', id: 'culture', behavior: 'smooth', block: 'start', inline: 'nearest' },
 ]);
});

test('navigation to another page, query, or origin stays delegated to Next Link', () => {
 for (const href of ['/menu#menu-top', '/?view=menu#hero', 'https://example.com/#hero', '/menu']) {
  const link = mount({ href });
  assert.equal(link.rendered.type, link.nextLink);
  assert.equal(link.rendered.props.href, href);
  assert.equal(link.click().defaultPrevented, false);
  assert.deepEqual(link.calls, []);
 }
 const homeFromMenu = mount({ current: 'http://localhost:3000/menu#coffee', href: '/#hero' });
 assert.equal(homeFromMenu.click().defaultPrevented, false);
 assert.deepEqual(homeFromMenu.calls, []);
});

test('modifier keys, other mouse buttons, and links opening another browsing context keep native navigation', () => {
 for (const overrides of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { button: 2 }]) {
  const link = mount({ href: '/#sound' });
  assert.equal(link.click(overrides).defaultPrevented, false);
  assert.deepEqual(link.calls, []);
 }
 for (const target of ['_blank', '_parent', '_top', 'another-tab']) {
  const link = mount({ href: '/#sound', target });
  assert.equal(link.rendered.props.target, target);
  assert.equal(link.click().defaultPrevented, false);
  assert.deepEqual(link.calls, []);
 }
 assert.equal(mount({ target: '_self' }).click().defaultPrevented, true);
});

test('the overlay closes through its click callback before scrolling starts', () => {
 let overlayOpen = true;
 const link = mount({ href: '/#visit', onClick: () => { overlayOpen = false; }, onScroll: () => assert.equal(overlayOpen, false) });
 assert.equal(link.click().defaultPrevented, true);
 assert.equal(link.calls.at(-1).id, 'visit');
});

test('a consumer can cancel navigation before section handling', () => {
 const link = mount({ onClick: event => event.preventDefault() });
 assert.equal(link.click().defaultPrevented, true);
 assert.deepEqual(link.calls, []);
});

test('reduced motion preference returns to a section immediately', () => {
 const link = mount({ reduced: true });
 assert.equal(link.click().defaultPrevented, true);
 assert.equal(link.calls[0].behavior, 'instant');
});

test('a missing section target preserves Next navigation', () => {
 const link = mount({ href: '/#missing', missing: true });
 assert.equal(link.click().defaultPrevented, false);
 assert.deepEqual(link.calls, []);
});

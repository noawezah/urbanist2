import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transform, loadBindings } from 'next/dist/build/swc/index.js';

await loadBindings();
async function compile(path) {
 return (await transform(readFileSync(path, 'utf8'), {
  filename: path,
  jsc: { parser: { syntax: 'typescript', tsx: true }, transform: { react: { runtime: 'automatic' } } },
  module: { type: 'commonjs' },
 })).code;
}
const componentCode = await compile('components/menu-browser.tsx');
const menuModule = { exports: {} };
vm.runInNewContext(await compile('lib/menu.ts'), menuModule);
const categories = [
 { id: 'toasts', name: 'Toasts', group: 'food', hours: '', note: '' },
 { id: 'mains', name: 'Mains', group: 'food', hours: '', note: '' },
 { id: 'sides', name: 'Sides', group: 'food', hours: '', note: '' },
 { id: 'coffee', name: 'Coffee', group: 'cafe', hours: '', note: '' },
 { id: 'tea', name: 'Tea', group: 'cafe', hours: '', note: '' },
 { id: 'beer', name: 'Beer', group: 'bar', hours: '', note: '' },
];
const items = categories.map(cat => ({ id: `${cat.id}-item`, categoryId: cat.id, name: cat.name, description: cat.name, serving: '', prices: [20], priceLabels: [], allergens: [], notes: [] }));

// Run the real click, search, keyboard, and scroll handlers with controlled DOM geometry.
function mount({ hash = '#toasts', headerHeight = 76, stickyHeight = 120, reduced = false } = {}) {
 const state = [], refs = [], effects = [], pendingEffects = [], frames = new Map(), listeners = new Map(), calls = [];
 let stateIndex = 0, refIndex = 0, effectIndex = 0, frameId = 0, dirty = false, tree;
 const react = {
  useState(initial) {
   const index = stateIndex++;
   if (!(index in state)) state[index] = initial;
   return [state[index], value => { if (!Object.is(state[index], value)) { state[index] = value; dirty = true; } }];
  },
  useRef(initial) { const index = refIndex++; return refs[index] ||= { current: initial }; },
  useMemo(fn) { return fn(); },
  useEffect(fn, deps) {
   const index = effectIndex++, previous = effects[index];
   if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
    effects[index] = { deps, fn, cleanup: previous?.cleanup };
    pendingEffects.push(index);
   }
  },
 };
 const window = {
  scrollY: 0, location: { hash },
  matchMedia: () => ({ matches: reduced }),
  history: { pushState(_state, _unused, destination) { window.location.hash = destination; calls.push({ type: 'history', destination }); } },
  scrollTo(options) { calls.push({ type: 'page-scroll', ...options }); },
  addEventListener(name, fn) { listeners.set(name, fn); },
  removeEventListener(name, fn) { if (listeners.get(name) === fn) listeners.delete(name); },
 };
 const geometry = Object.fromEntries(categories.map((cat, index) => [cat.id, { section: 500 + index * 1000, heading: 552 + index * 1000 }]));
 const sectionNodes = Object.fromEntries(categories.map(cat => [cat.id, {
  getBoundingClientRect: () => ({ top: geometry[cat.id].section - window.scrollY }),
  querySelector: () => ({ getBoundingClientRect: () => ({ top: geometry[cat.id].heading - window.scrollY }) }),
 }]));
 const stickyNode = { get offsetHeight() { return stickyHeight; } };
 const tabNode = id => ({ offsetLeft: categories.findIndex(cat => cat.id === id) * 100, clientWidth: 80, focus: options => calls.push({ type: 'focus', id, ...options }) });
 const rail = {
  offsetLeft: 0, clientWidth: 300,
  querySelector: selector => tabNode(selector.match(/data-category="(.*?)"/)[1]),
  scrollTo: options => calls.push({ type: 'rail-scroll', ...options }),
  scrollBy: options => calls.push({ type: 'rail-pan', ...options }),
 };
 const context = {
  exports: {}, window,
  document: { getElementById: id => sectionNodes[id], querySelector: () => ({ getBoundingClientRect: () => ({ height: headerHeight }) }) },
  requestAnimationFrame(fn) { const id = ++frameId; frames.set(id, fn); return id; },
  cancelAnimationFrame(id) { frames.delete(id); },
  require(name) {
   if (name === 'react') return react;
   if (name === '@/lib/menu') return menuModule.exports;
   if (name === 'react/jsx-runtime') return { Fragment: 'fragment', jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
   if (name === '@remixicon/react') return {};
   return () => null;
  },
 };
 vm.runInNewContext(componentCode, context);
 function allNodes(node) {
  if (Array.isArray(node)) return node.flatMap(child => allNodes(child));
  if (!node?.props) return [];
  return [node, ...allNodes(node.props.children)];
 }
 const find = predicate => allNodes(tree).find(node => predicate(node.props));
 function render() {
  stateIndex = refIndex = effectIndex = 0; dirty = false;
  tree = context.exports.default({ categories, items });
  find(props => props.className === 'menu-sticky').props.ref.current = stickyNode;
  find(props => props.className === 'category-tabs').props.ref.current = rail;
 }
 function settle() {
  if (dirty) render();
  while (pendingEffects.length || frames.size || dirty) {
   for (const index of pendingEffects.splice(0)) {
    effects[index].cleanup?.();
    effects[index].cleanup = effects[index].fn();
   }
   if (dirty) render();
   const queuedFrames = [...frames.entries()];
   for (const [id, callback] of queuedFrames) { frames.delete(id); callback(); }
   if (dirty) render();
  }
 }
 render(); settle(); calls.length = 0;
 return {
  calls, window, geometry, find, settle,
  setStickyHeight(value) { stickyHeight = value; },
  click(label) { find(props => props['aria-label'] === label).props.onClick(); settle(); },
  active() { return find(props => props['aria-current'] === 'location')?.props['data-category']; },
  scroll(y) { window.scrollY = y; listeners.get('scroll')?.(); settle(); },
 };
}

test('next and previous arrows select categories and place their heading below the measured sticky controls', () => {
 const menu = mount();
 menu.setStickyHeight(146);
 menu.click('Next category');
 assert.equal(menu.active(), 'mains');
 assert.equal(menu.window.location.hash, '#mains');
 assert.deepEqual(menu.calls.find(call => call.type === 'page-scroll'), { type: 'page-scroll', top: menu.geometry.mains.heading - 76 - 146 - 12, behavior: 'smooth' });
 assert.equal(menu.calls.some(call => call.type === 'rail-pan' || call.type === 'focus'), false);
 menu.calls.length = 0;
 menu.click('Previous category');
 assert.equal(menu.active(), 'toasts');
 assert.equal(menu.window.location.hash, '#toasts');
});

test('arrows stop at group boundaries and both disable for a single-category group', () => {
 for (const [hash, boundary, opposite] of [['#toasts', 'Previous category', 'Next category'], ['#sides', 'Next category', 'Previous category']]) {
  const menu = mount({ hash });
  assert.equal(menu.find(props => props['aria-label'] === boundary).props.disabled, true);
  assert.equal(menu.find(props => props['aria-label'] === opposite).props.disabled, false);
  menu.click(boundary);
  assert.deepEqual(menu.calls, []);
 }
 const beer = mount({ hash: '#beer' });
 for (const label of ['Previous category', 'Next category']) assert.equal(beer.find(props => props['aria-label'] === label).props.disabled, true);
});

test('category arrows leave search results and restore the selected group menu', () => {
 const menu = mount();
 menu.find(props => props['aria-label'] === 'Search all food and drinks').props.onChange({ target: { value: 'Tea' } });
 menu.settle();
 assert.equal(menu.active(), undefined);
 menu.click('Next category');
 assert.equal(menu.active(), 'mains');
 assert.equal(menu.find(props => props['aria-label'] === 'Search all food and drinks').props.value, '');
 assert.equal(menu.find(props => props['aria-label'] === 'Food').props['aria-pressed'], true);
});

test('group clicks, tab clicks, and keyboard selection preserve category navigation and keyboard focus', () => {
 const menu = mount();
 menu.click('Coffee & soft drinks');
 assert.equal(menu.active(), 'coffee');
 menu.find(props => props['data-category'] === 'tea').props.onClick(); menu.settle();
 assert.equal(menu.active(), 'tea');
 let prevented = false;
 menu.find(props => props['data-category'] === 'tea').props.onKeyDown({ key: 'ArrowRight', preventDefault() { prevented = true; } }); menu.settle();
 assert.equal(prevented, true);
 assert.equal(menu.active(), 'coffee');
 assert.deepEqual(menu.calls.find(call => call.type === 'focus'), { type: 'focus', id: 'coffee', preventScroll: true });
});

test('mobile category navigation honors reduced motion and actual header and sticky-bar sizes', () => {
 const menu = mount({ headerHeight: 64, stickyHeight: 94, reduced: true });
 menu.click('Next category');
 assert.deepEqual(menu.calls.find(call => call.type === 'page-scroll'), { type: 'page-scroll', top: menu.geometry.mains.heading - 64 - 94 - 12, behavior: 'instant' });
});

test('manual scrolling activates the category when its content heading reaches the controls', () => {
 const menu = mount();
 menu.scroll(1330); // Mains heading reaches 222px, above the 228px activation threshold.
 assert.equal(menu.active(), 'mains');
 menu.scroll(1310); // Section top 190px is above threshold; heading 242px is still below it.
 assert.equal(menu.active(), 'toasts');
});

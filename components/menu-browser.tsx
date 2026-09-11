'use client';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { RiArrowRightUpLine, RiArrowLeftSLine, RiArrowRightSLine, RiSearchLine, RiCloseLine, RiTimeLine } from '@remixicon/react';
import { findMenuItems, menuGroups, priceLabel, type MenuCategory, type MenuGroup, type MenuItem } from '@/lib/menu';
import ItemDetails from './menu-item-details';

export default function MenuBrowser({ categories, items }: { categories: MenuCategory[]; items: MenuItem[] }) {
 const [group,setGroup] = useState<MenuGroup>(categories[0].group);
 const [categoryId,setCategoryId] = useState(categories[0].id);
 const [query,setQuery] = useState('');
 const [searchOpen,setSearchOpen] = useState(false);
 const [selected,setSelected] = useState<MenuItem | null>(null);
 const tabRail=useRef<HTMLDivElement>(null);
 const sticky=useRef<HTMLDivElement>(null);
 const panel=useRef<HTMLDivElement>(null);
 const search=useRef<HTMLInputElement>(null);
 const searchToggle=useRef<HTMLButtonElement>(null);
 function toggleSearch(){
  const next=!searchOpen;setSearchOpen(next);
  if(!next){setQuery('');searchToggle.current?.focus();}
  else requestAnimationFrame(()=>search.current?.focus());
 }
 const category=categories.find(cat=>cat.id===categoryId)!;
 const visibleCategories=categories.filter(cat=>cat.group===group);
 const results=useMemo(()=>query.trim()?findMenuItems(items,query):items.filter(item=>item.categoryId===categoryId),[items,query,categoryId]);
 const counts=useMemo(()=>Object.fromEntries(categories.map(cat=>[cat.id,items.filter(item=>item.categoryId===cat.id).length])),[categories,items]);
 useEffect(()=>{
  const sync=()=>{const id=window.location.hash.slice(1);const found=categories.find(cat=>cat.id===id)||categories[0];if(found){setGroup(found.group);setCategoryId(found.id);setQuery('');}};
  sync();window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);
  return ()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
 },[categories]);
 useEffect(()=>{
  const rail=tabRail.current;
  const tab=rail?.querySelector<HTMLElement>(`[data-category="${categoryId}"]`);
  if(rail&&tab) rail.scrollTo({left:tab.offsetLeft-rail.offsetLeft-rail.clientWidth/2+tab.clientWidth/2,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 },[categoryId]);
 function choose(id:string){
  const next=categories.find(cat=>cat.id===id);if(!next)return;
  setCategoryId(id);setGroup(next.group);setQuery('');
  window.history.pushState(null,'',`#${id}`);
  if(sticky.current&&panel.current){
   const header=document.querySelector('.public-header')?.getBoundingClientRect().height||88;
   if(panel.current.getBoundingClientRect().top<header+sticky.current.offsetHeight){
    window.scrollTo({top:window.scrollY+panel.current.getBoundingClientRect().top-header-sticky.current.offsetHeight,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   }
  }
 }
 function tabKey(event:KeyboardEvent<HTMLButtonElement>,index:number){
  let next=index;
  if(event.key==='ArrowRight')next=(index+1)%visibleCategories.length;
  else if(event.key==='ArrowLeft')next=(index-1+visibleCategories.length)%visibleCategories.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=visibleCategories.length-1;
  else return;
  event.preventDefault();choose(visibleCategories[next].id);
  tabRail.current?.querySelector<HTMLButtonElement>(`[data-category="${visibleCategories[next].id}"]`)?.focus({preventScroll:true});
 }
 function scrollTabs(direction:number){tabRail.current?.scrollBy({left:direction*280,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 return <>
  <div className="menu-sticky" ref={sticky}>
   <div className="menu-control-row"><div className="menu-groups" role="group" aria-label="Menu sections">{menuGroups.filter(g=>categories.some(c=>c.group===g.id)).map(g=><button key={g.id} className={group===g.id&&!query.trim()?'is-active':''} aria-label={g.label} aria-pressed={group===g.id&&!query.trim()} onClick={()=>choose(categories.find(c=>c.group===g.id)!.id)}><span className="group-full-label">{g.label}</span><span className="group-short-label" aria-hidden="true">{g.id==='cafe'?'Café & soft':g.label}</span></button>)}</div><button ref={searchToggle} className="menu-search-toggle" aria-label={searchOpen?'Close menu search':'Search the menu'} aria-expanded={searchOpen} aria-controls="menu-search-field" onClick={toggleSearch}>{searchOpen?<RiCloseLine size={20}/>:<RiSearchLine size={20}/>}</button><div className={`menu-search ${searchOpen?'is-open':''}`} id="menu-search-field"><RiSearchLine size={19}/><input ref={search} type="search" aria-label="Search all food and drinks" placeholder="Find your favourite" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'&&searchOpen){e.preventDefault();toggleSearch();}}}/>{query&&<button onClick={()=>{setQuery('');search.current?.focus();}} aria-label="Clear search"><RiCloseLine size={18}/></button>}</div></div>
   <div className="category-control"><button className="tab-scroll" onClick={()=>scrollTabs(-1)} aria-label="Scroll categories left"><RiArrowLeftSLine size={22}/></button><div className="category-tabs" ref={tabRail} role="tablist" aria-label={`${menuGroups.find(g=>g.id===group)?.label} categories`}>{visibleCategories.map((cat,i)=><button key={cat.id} id={`tab-${cat.id}`} role="tab" aria-selected={categoryId===cat.id&&!query.trim()} aria-controls="menu-items-panel" tabIndex={categoryId===cat.id?0:-1} data-category={cat.id} onKeyDown={e=>tabKey(e,i)} onClick={()=>choose(cat.id)}>{cat.name}<span>{String(counts[cat.id]).padStart(2,'0')}</span></button>)}</div><button className="tab-scroll" onClick={()=>scrollTabs(1)} aria-label="Scroll categories right"><RiArrowRightSLine size={22}/></button></div>
  </div>
  <div className="menu-results" ref={panel}>
   <div className="menu-category-heading"><div><span className="eyebrow">{query.trim()?'ACROSS THE WHOLE MENU':menuGroups.find(g=>g.id===group)?.label.toUpperCase()}</span><h2>{query.trim()?'Your search.':category.name}<span>({results.length})</span></h2></div>{!query.trim()&&<div className="category-description">{category.hours&&<span className="serving-hours"><RiTimeLine size={16}/>{category.hours}</span>}{category.note&&<p>{category.note}</p>}</div>}</div>
   <p className={`menu-result-announcement ${query.trim()?'has-query':''}`} aria-live="polite">{query.trim()?`${results.length} ${results.length===1?'match':'matches'} for “${query.trim()}”`:'Tap a dish for ingredients and details.'}</p>
   <div role={query.trim()?'region':'tabpanel'} id="menu-items-panel" aria-labelledby={query.trim()?undefined:`tab-${categoryId}`} aria-label={query.trim()?'Search results':undefined} tabIndex={0} className="menu-item-grid">
    {results.map(item=><button key={item.id} className="menu-item" aria-haspopup="dialog" aria-label={`${item.name}, ${priceLabel(item)}. View details`} onClick={()=>setSelected(item)}><span className="menu-item-top"><span className="menu-item-name">{item.name}</span><span className="menu-item-price">{priceLabel(item)}</span></span>{query.trim()&&<span className="menu-item-category">{categories.find(c=>c.id===item.categoryId)?.name}</span>}<span className="menu-item-description">{item.description||item.serving||'Discover the details.'}</span><span className="menu-item-bottom"><span>{item.serving||categories.find(c=>c.id===item.categoryId)?.hours||categories.find(c=>c.id===item.categoryId)?.name}</span><span className="item-open"><span>Details</span><RiArrowRightUpLine size={20}/></span></span></button>)}
   </div>
   {!results.length&&<div className="menu-empty"><h3>NOTHING ON THAT FREQUENCY.</h3><p>Try a drink, a dish, or an ingredient.</p><button className="button button-dark" onClick={()=>{setQuery('');search.current?.focus();}}>Clear search <RiCloseLine size={18}/></button></div>}
  </div>
  <div className="menu-house-notes"><div><span className="eyebrow">A NOTE FROM THE KITCHEN</span><p>Food allergies or intolerances?<br/>Please talk to our people before ordering.</p></div><div><p>Ingredients and allergens shown are those listed in our menu. Not all ingredients are listed. No substitutions or alterations.</p><span>ALL PRICES IN ROMANIAN LEI · ORDER AT THE BAR</span></div></div>
  {selected&&<ItemDetails key={selected.id} item={selected} category={categories.find(c=>c.id===selected.categoryId)!} onClose={()=>setSelected(null)}/>}
 </>;
}


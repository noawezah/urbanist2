'use client';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { RiArrowRightUpLine, RiArrowLeftSLine, RiArrowRightSLine, RiSearchLine, RiCloseLine, RiTimeLine } from '@remixicon/react';
import { findMenuItems, menuGroups, priceLabel, type MenuCategory, type MenuGroup, type MenuItem } from '@/lib/menu';
import ItemDetails from './menu-item-details';
import CategoryIcon from './menu-category-icon';

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
 const visibleCategories=categories.filter(cat=>cat.group===group);
 const results=useMemo(()=>query.trim()?findMenuItems(items,query):items,[items,query]);
 const counts=useMemo(()=>Object.fromEntries(categories.map(cat=>[cat.id,items.filter(item=>item.categoryId===cat.id).length])),[categories,items]);
 useEffect(()=>{
  const sync=()=>{const id=window.location.hash.slice(1);const found=categories.find(cat=>cat.id===id)||categories[0];if(found){setGroup(found.group);setCategoryId(found.id);setQuery('');}};
  sync();window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);
  return ()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
 },[categories]);
 useEffect(()=>{
  if(query.trim())return;
  let frame=0;
  const update=()=>{
   frame=0;
   const offset=(document.querySelector('.public-header')?.getBoundingClientRect().height||76)+(sticky.current?.offsetHeight||0)+32;
   let active=categories[0];
   for(const cat of categories){const section=document.getElementById(cat.id);if(section&&section.getBoundingClientRect().top<=offset)active=cat;}
   setCategoryId(active.id);setGroup(active.group);
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);
  return ()=>{window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);cancelAnimationFrame(frame);};
 },[categories,query]);
 useEffect(()=>{
  const rail=tabRail.current;
  const tab=rail?.querySelector<HTMLElement>(`[data-category="${categoryId}"]`);
  if(rail&&tab) rail.scrollTo({left:tab.offsetLeft-rail.offsetLeft-rail.clientWidth/2+tab.clientWidth/2,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 },[categoryId]);
 function choose(id:string){
  const next=categories.find(cat=>cat.id===id);if(!next)return;
  setCategoryId(id);setGroup(next.group);setQuery('');
  window.history.pushState(null,'',`#${id}`);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const target=document.getElementById(id);
   const header=document.querySelector('.public-header')?.getBoundingClientRect().height||76;
   if(target)window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-header-(sticky.current?.offsetHeight||0)-20,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }));
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
   <div className="menu-control-row"><div className="menu-groups" role="group" aria-label="Menu sections">{menuGroups.filter(g=>categories.some(c=>c.group===g.id)).map(g=><button key={g.id} className={group===g.id&&!query.trim()?'is-active':''} aria-label={g.label} aria-pressed={group===g.id&&!query.trim()} onClick={()=>choose(categories.find(c=>c.group===g.id)!.id)}><CategoryIcon id={g.id}/><span className="group-full-label">{g.label}</span><span className="group-short-label" aria-hidden="true">{g.id==='cafe'?'Café & soft':g.label}</span></button>)}</div><button ref={searchToggle} className="menu-search-toggle" aria-label={searchOpen?'Close menu search':'Search the menu'} aria-expanded={searchOpen} aria-controls="menu-search-field" onClick={toggleSearch}>{searchOpen?<RiCloseLine size={20}/>:<RiSearchLine size={20}/>}</button><div className={`menu-search ${searchOpen?'is-open':''}`} id="menu-search-field"><RiSearchLine size={19}/><input ref={search} type="search" aria-label="Search all food and drinks" placeholder="Find your favourite" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'&&searchOpen){e.preventDefault();toggleSearch();}}}/>{query&&<button onClick={()=>{setQuery('');search.current?.focus();}} aria-label="Clear search"><RiCloseLine size={18}/></button>}</div></div>
   <div className="category-control"><button className="tab-scroll" onClick={()=>scrollTabs(-1)} aria-label="Scroll categories left"><RiArrowLeftSLine size={22}/></button><div className="category-tabs" ref={tabRail} role="navigation" aria-label={`${menuGroups.find(g=>g.id===group)?.label} categories`}>{visibleCategories.map((cat,i)=><button key={cat.id} id={`tab-${cat.id}`} aria-current={categoryId===cat.id&&!query.trim()?'location':undefined} aria-controls={cat.id} data-category={cat.id} onKeyDown={e=>tabKey(e,i)} onClick={()=>choose(cat.id)}><CategoryIcon id={cat.id}/>{cat.name}<span>{String(counts[cat.id]).padStart(2,'0')}</span></button>)}</div><button className="tab-scroll" onClick={()=>scrollTabs(1)} aria-label="Scroll categories right"><RiArrowRightSLine size={22}/></button></div>
  </div>
  <div className="menu-results" ref={panel}>
   <p className="menu-result-announcement" aria-live="polite">{query.trim()?`${results.length} matches for “${query.trim()}”`:'The whole menu. Scroll to explore, or jump to a category.'}</p>
   {categories.map(cat=>{
    const dishes=results.filter(item=>item.categoryId===cat.id);
    if(!dishes.length)return null;
    return <section className="menu-category-section" id={cat.id} key={cat.id} aria-labelledby={`heading-${cat.id}`}>
     <div className="menu-category-heading"><div><span className="eyebrow">{menuGroups.find(g=>g.id===cat.group)?.label}</span><h2 id={`heading-${cat.id}`}><CategoryIcon id={cat.id} size={30}/>{cat.name}<span>({dishes.length})</span></h2></div><div className="category-description">{cat.hours&&<span className="serving-hours"><RiTimeLine size={16}/>{cat.hours}</span>}{cat.note&&<p>{cat.note}</p>}</div></div>
     <div className="menu-item-grid">
      {dishes.map(item=><button key={item.id} className="menu-item" aria-haspopup="dialog" aria-label={`${item.name}, ${priceLabel(item)}. View details`} onClick={()=>setSelected(item)}><span className="menu-item-top"><span className="menu-item-name">{item.name}</span><span className="menu-item-price">{priceLabel(item)}</span></span><span className="menu-item-description">{item.description||item.serving||'Discover the details.'}</span><span className="menu-item-bottom"><span>{item.serving||cat.hours||cat.name}</span><span className="item-open"><span>Details</span><RiArrowRightUpLine size={20}/></span></span></button>)}
     </div>
    </section>;
   })}
   {!results.length&&<div className="menu-empty"><h3>NOTHING ON THAT FREQUENCY.</h3><p>Try a drink, a dish, or an ingredient.</p><button className="button button-dark" onClick={()=>{setQuery('');search.current?.focus();}}>Clear search <RiCloseLine size={18}/></button></div>}
  </div>
  <div className="menu-house-notes"><div><span className="eyebrow">A NOTE FROM THE KITCHEN</span><p>Food allergies or intolerances?<br/>Please talk to our people before ordering.</p></div><div><p>Ingredients and allergens shown are those listed in our menu. Not all ingredients are listed. No substitutions or alterations.</p><span>ALL PRICES IN ROMANIAN LEI · ORDER AT THE BAR</span></div></div>
  {selected&&<ItemDetails key={selected.id} item={selected} category={categories.find(c=>c.id===selected.categoryId)!} onClose={()=>setSelected(null)}/>}
 </>;
}



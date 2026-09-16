import { RiRestaurantLine, RiCupLine, RiCake3Line, RiLeafLine, RiBeerLine, RiDrinksLine, RiFireLine, RiSunLine, RiBowlLine, RiWaterFlashLine } from '@remixicon/react';

// Original category-specific drawings on the same 24px grid as Remix.
const paths:Record<string,string>={
 'beer-bottles':'M9 3h6m-5 0v5l-3 4v9h10v-9l-3-4V3M7 14h10M7 18h10',
 shots:'m7 6 2 15h6l2-15ZM8 11h8',
 whiskey:'m4 5 1.5 16h13L20 5ZM5 14h14M8 8l4-1 1 4-4 1Zm6 3 3-1 1 3-3 1Z',
 wines:'M7 3h10l1 7a6 6 0 0 1-12 0ZM6 9h12M12 16v5m-4 0h8',
 cocktails:'M3 6h18l-9 10ZM12 16v5m-4 0h8M5 9h14m-5-3 4-4',
 'urbanist-specials':'m6 9 2 12h9l2-12ZM7 14h11M14 9l2-7M6 2l.8 2.2L9 5l-2.2.8L6 8l-.8-2.2L3 5l2.2-.8Z',
 gin:'M6 6h12v4a6 6 0 0 1-12 0ZM12 16v5m-4 0h8M17 6a3 3 0 1 0-3 3',
 rum:'M8 3h8M6 5h12q3 7 0 15H6Q3 12 6 5ZM5 9h14M5 16h14M9 5q-2 7 0 15m6-15q2 7 0 15',
 vodka:'M10 2h4v6l3 3v10H7V11l3-3ZM7 13h10M10 17h4',
 tequila:'M3 11h8l-1 10H4ZM4 15h6M17 21V5m0 9c-4 0-4-5-4-5m4 8c4 0 4-5 4-5',
 aperitif:'M6 8h12v3a6 6 0 0 1-12 0ZM6 11h12M12 17v4m-4 0h8M15 8a4 4 0 1 1 6-4l-4 4m1-6v3',
 'other-spirits':'m8 3-2 7a6 6 0 0 0 12 0l-2-7ZM6 10h12M12 16v5m-4 0h8',
 mixers:'M8 2h8M9 2v5l-2 3v11h10V10l-2-3V2M7 13h10M10 16h1m2 2h1',
 'iced-coffee':'M5 7h14l-2 14H7ZM4 7h16M12 7l3-5M7 12h10m-8 2 3-1 1 3-3 1Z',
 'raw-juice':'m7 10 1 11h9l1-11ZM13 10l3-8M6 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 0v8M2 7h8',
 'soft-drinks':'M9 3h6q2 0 2 2v14q0 2-2 2H9q-2 0-2-2V5q0-2 2-2ZM7 7h10M7 17h10M10 5h4m-2 4-2 4h4l-2 3',
};
export default function CategoryIcon({id,size=20}:{id:string;size?:number}) {
 if(paths[id])return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[id]}/></svg>;
 const Icon=id==='sweets'?RiCake3Line:id==='eggs'?RiSunLine:id==='mains'?RiFireLine:id==='sides'?RiBowlLine:/tea|matcha/.test(id)?RiLeafLine:/coffee|cafe/.test(id)?RiCupLine:id==='beer-on-tap'?RiBeerLine:id==='energy-drinks'?RiWaterFlashLine:id==='bar'?RiDrinksLine:RiRestaurantLine;
 return <Icon size={size} aria-hidden="true"/>;
}


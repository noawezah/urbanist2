import { RiRestaurantLine, RiCupLine, RiGobletLine, RiCake3Line, RiLeafLine, RiBeerLine, RiDrinksLine, RiFireLine, RiSunLine, RiBowlLine, RiWaterFlashLine } from '@remixicon/react';

export default function CategoryIcon({ id, size=20 }: { id:string; size?:number }) {
 const Icon = id==='sweets'?RiCake3Line:id==='eggs'?RiSunLine:id==='loaded-fries'?RiFireLine:id==='sides'?RiBowlLine:
 /tea|matcha/.test(id)?RiLeafLine:/coffee|cafe/.test(id)?RiCupLine:/beer/.test(id)?RiBeerLine:
 /energy/.test(id)?RiWaterFlashLine:/juice|soft|mixers/.test(id)?RiDrinksLine:
 /food|toast/.test(id)?RiRestaurantLine:RiGobletLine;
 return <Icon size={size} aria-hidden="true"/>;
}

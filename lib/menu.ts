import source from '@/data/menu.json';
export type MenuGroup = 'food' | 'cafe' | 'bar';
export type MenuCategory = { id: string; name: string; group: MenuGroup; hours: string; note: string };
export type MenuItem = { id: string; categoryId: string; name: string; description: string; serving: string; prices: number[]; priceLabels: string[]; allergens: number[]; notes: string[] };
export const menuCategories = source.categories as MenuCategory[];
export const menuItems: MenuItem[] = source.items.map(({ sourceText: _source, ...item }) => item);
export const menuGroups: { id: MenuGroup; label: string }[] = [{id:'food',label:'Food'},{id:'cafe',label:'Coffee & soft drinks'},{id:'bar',label:'Bar'}];
export const allergenNames: Record<number,string> = {1:'Gluten',2:'Crustaceans',3:'Eggs',4:'Fish',5:'Peanuts',6:'Soy',7:'Milk (including lactose)',8:'Nuts',9:'Celery',10:'Mustard',11:'Sesame',12:'Sulphur dioxide & sulphites',13:'Lupin',14:'Molluscs'};
export function priceLabel(item: MenuItem) { return item.prices.length ? `${item.prices.join(' / ')} lei` : 'Ask at the bar'; }
export function findMenuItems(items: MenuItem[], query: string) {
 const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
 return items.filter(item => terms.every(term => normalize(`${item.name} ${item.description}`).includes(term)));
}

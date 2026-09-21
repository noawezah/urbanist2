import 'server-only';
import source from '@/data/menu.json';
import type { MenuCategory, MenuItem } from './menu';

export const menuCategories = source.categories as MenuCategory[];
export const menuItems: MenuItem[] = source.items.map(item => ({
 id: item.id, categoryId: item.categoryId, name: item.name,
 description: item.description, serving: item.serving, prices: item.prices,
 priceLabels: item.priceLabels, allergens: item.allergens, notes: item.notes,
}));

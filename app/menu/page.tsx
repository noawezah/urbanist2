import MenuBrowser from '@/components/menu-browser';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { menuCategories, menuItems } from '@/lib/menu';
export const metadata = { title: 'Food & Drinks Menu — The Urbanist, Bucharest', description: 'Explore specialty coffee, breakfast, loaded fries, cocktails and more at The Urbanist. Prices, ingredients, portions and allergen details.' };
export default function MenuPage() {
 return <div className="menu-page"><a className="skip-link" href="#main">Skip to menu</a><SiteHeader active="menu"/><main id="main" className="menu-main"><div className="menu-intro"><div><span className="eyebrow">THE URBANIST / FOOD & DRINKS</span><h1>GOOD<br className="menu-title-break"/> TASTE<span>.</span></h1></div><div className="menu-intro-copy"><p>From your first coffee<br/>to your next favourite.</p><span>KITCHEN CLOSES AT 21:00.<br/>ORDER AT THE BAR.</span></div></div><MenuBrowser categories={menuCategories} items={menuItems}/></main><SiteFooter/></div>;
}


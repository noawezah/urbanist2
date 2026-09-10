import Link from 'next/link';
import MenuOverlay from './menu-overlay';
export default function SiteHeader({ active }: { active?: 'menu' }) {
 return <header className="venue-header public-header">
  <Link href="/" className="wordmark" aria-label="The Urbanist home">URBANIST<span>SOUND HOUSE · BUCHAREST</span></Link>
  <nav aria-label="Main navigation"><Link href="/#sound">Sound</Link><Link href="/#culture">Culture</Link><Link href="/menu" className={active === 'menu' ? 'current' : ''} aria-current={active === 'menu' ? 'page' : undefined}>The menu</Link><Link href="/#visit">Find us</Link></nav>
  <div className="site-header-actions"><Link className="mobile-menu-link" href="/menu">The menu</Link><MenuOverlay/></div>
 </header>;
}

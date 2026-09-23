import Link from 'next/link';
import MenuOverlay from './menu-overlay';
export default function SiteHeader({ active }: { active?: 'menu' }) {
 return <header className="venue-header public-header">
  <Link href="/" className="wordmark" aria-label="The Urbanist home"><img className="official-wordmark" src="/images/48eeef8d2645f99b4e44.svg" alt="URBANIST" width="196" height="33"/></Link>
  <nav aria-label="Main navigation"><Link href="/#sound">Sound</Link><Link href="/#culture">Culture</Link><Link href="/menu" className={active === 'menu' ? 'current' : ''} aria-current={active === 'menu' ? 'page' : undefined}>The menu</Link><Link href="/#visit">Find us</Link></nav>
  <div className="site-header-actions"><Link className="mobile-menu-link" href="/menu">The menu</Link><MenuOverlay/></div>
 </header>;
}

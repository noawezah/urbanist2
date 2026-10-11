import SectionLink from './section-link';
import MenuOverlay from './menu-overlay';
export default function SiteHeader({ active }: { active?: 'menu' }) {
 return <header className="venue-header public-header">
  <SectionLink href="/#hero" className="wordmark" aria-label="The Urbanist home"><img className="official-wordmark" src="/images/48eeef8d2645f99b4e44.svg" alt="URBANIST" width="196" height="33"/></SectionLink>
  <nav aria-label="Main navigation"><SectionLink href="/#sound">Sound</SectionLink><SectionLink href="/#culture">Culture</SectionLink><SectionLink href="/menu#menu-top" className={active === 'menu' ? 'current' : ''} aria-current={active === 'menu' ? 'page' : undefined}>The menu</SectionLink><SectionLink href="/#visit">Find us</SectionLink></nav>
  <div className="site-header-actions"><SectionLink className="mobile-menu-link" href="/menu#menu-top">The menu</SectionLink><MenuOverlay/></div>
 </header>;
}

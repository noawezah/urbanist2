import Link from 'next/link';
import { RiArrowRightUpLine } from '@remixicon/react';
export default function SiteFooter() {
 return <footer className="venue-footer"><span className="eyebrow">COME AS YOU ARE.</span><div>URBANIST</div><p><span>STR. GEORGE ENESCU 25 / BUCHAREST</span><Link href="/menu">THE MENU <RiArrowRightUpLine size={15}/></Link><a href="https://www.instagram.com/theurbanistbucharest/" target="_blank" rel="noreferrer">INSTAGRAM <RiArrowRightUpLine size={15}/></a><a href="https://www.facebook.com/www.TheUrbanist.ro/" target="_blank" rel="noreferrer">FACEBOOK <RiArrowRightUpLine size={15}/></a></p><address className="footer-contact"><a href="tel:+40740429335"><span className="footer-contact-label">PHONE</span><span>0740 429 335</span></a><a href="mailto:a@theurbanist.ro"><span className="footer-contact-label">EMAIL</span><span>a@theurbanist.ro</span></a></address></footer>;
}



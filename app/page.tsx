import CultureScroll from '@/components/culture-scroll';
import Reviews, { GoogleRating } from '@/components/reviews';
import SoundAlbum from '@/components/sound-album';
import InstagramPost from '@/components/instagram-post';
import PreviewMotion from '@/components/preview-motion';
import AnimatedButton from '@/components/animated-button';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';

export default function HomePage() {
 return <div className="venue-page"><PreviewMotion/><a className="skip-link" href="#main">Skip to content</a><SiteHeader/>
  <main id="main" className="venue-main">
   <section className="venue-hero">
    <div className="venue-kicker"><span>STR. GEORGE ENESCU 25</span><span>COFFEE. CULTURE. AFTER HOURS.</span></div>
    <h1>A PLACE<br/>IN BETWEEN</h1>
   <section id="menu" className="menu-wall hero-menu-panel"><div className="menu-wall-image"><img src="/images/9f9b032853b1290cc298.png" alt="Reflective five-bar steel texture" data-menu-parallax/></div><div className="menu-wall-shade"/><div className="menu-wall-content"><span className="eyebrow">FOOD FOR THE SOUL / SOMETHING TO SIP</span><h2>FOLLOW<br/>YOUR<br/>APPETITE<span>.</span></h2><p>First coffee. Something good.<br/>One more reason to stay.</p><AnimatedButton href="/menu" variant="light" hoverText="Find your favourite">Explore the menu</AnimatedButton></div><div className="menu-wall-bottom"><span>SPECIALTY COFFEE / FOOD / DRINKS</span><span>ORDER AT THE BAR. TALK TO OUR PEOPLE.</span></div></section>
    <div className="venue-intro"><p>For the ones making noise.<br/>And the ones finding their people.</p><span>Underground culture. The energy of the city.<br/>Different scenes. One shared space.</span></div>
    <div className="hero-review"><GoogleRating/></div>
   </section>

   <section id="sound" className="venue-section sound-section"><span className="eyebrow">01 / SOUND</span><div className="venue-section-title"><h2>FOLLOW<br/>THE SOUND.</h2><p>From the first record to the last track.<br/>A space for live sessions, selectors,<br/>and the people who come to listen.</p></div><SoundAlbum/><InstagramPost/></section>
   <section id="culture" className="venue-section culture-section"><span className="eyebrow">02 / CULTURE</span><div className="venue-section-title"><h2>UNDERGROUND<br/>CULTURE<span className="violet-period">.</span></h2><p className="culture-statement">Street culture.<br/>Shared space.</p></div><div className="culture-interior"><img src="/images/514e7560fe64de7e88e5.png" alt="Crowd beneath the vaulted ceiling in violet light" width="1143" height="1376" loading="lazy" data-venue-parallax/><span>SOUND HOUSE / BUCHAREST</span></div></section>
   <CultureScroll/>
   <Reviews/>
   <section id="visit" className="venue-section visit-section"><span className="eyebrow">03 / THE PLACE</span><div className="venue-section-title"><h2>YOU KNOW<br/>WHERE.</h2><div><p><strong>Urbanist Sound House</strong><br/>Str. George Enescu nr. 25<br/>Bucharest, Romania</p><AnimatedButton href="https://www.google.com/maps/search/?api=1&query=The+Urbanist+Strada+George+Enescu+25+Bucharest" external hoverText="See you there">Get directions</AnimatedButton></div></div><iframe className="venue-map" title="The Urbanist — Strada George Enescu 25, Bucharest" src="https://maps.google.com/maps?q=The%20Urbanist%20Strada%20George%20Enescu%2025%20Bucharest&amp;z=16&amp;output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><div className="visit-details"><div><span>DOORS OPEN</span><p>Monday / 17:00<br/>Tuesday–Sunday / 10:00</p></div><div><span>FROM THE KITCHEN</span><p>Mains & sides from 14:00<br/><strong>Kitchen closes at 21:00.</strong></p><AnimatedButton href="/menu" variant="outline" hoverText="Take a look">Food & drinks</AnimatedButton></div></div></section>
  </main><SiteFooter/>
 </div>;
}





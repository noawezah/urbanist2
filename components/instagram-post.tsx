import AnimatedButton from './animated-button';

// Latest unpinned post visible on the official profile, checked 2026-09-14.
// Update this permalink when a newer post is selected; this is not an API feed.
const postUrl='https://www.instagram.com/p/DdMTYXSIU3d/';
export default function InstagramPost() {
 return <div className="instagram-feature">
  <div className="instagram-feature-copy"><span className="eyebrow">STRAIGHT FROM THE FEED</span><h3>ON OUR<br/>FREQUENCY.</h3><p>Sessions, selectors, and everything in between.</p><AnimatedButton href={postUrl} external variant="outline" hoverText="Open Instagram">View the post</AnimatedButton></div>
  <iframe className="instagram-embed" src={`${postUrl}embed/`} title="The Urbanist Instagram post — September 12, 2026" loading="lazy" allow="encrypted-media; fullscreen" referrerPolicy="strict-origin-when-cross-origin"/>
 </div>;
}

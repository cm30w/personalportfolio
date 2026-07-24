import BlurPanel from '../components/BlurPanel';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

export default function Home() {
  return (
    <div className="page">
      <BlurPanel style={{ position: 'absolute', left: 96, top: 240 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.15em' }}>
          <h1 className="heading-hello">
            hello!
          </h1>
          <StarDecal size={90} style={{ position: 'absolute', left: '100%', top: 'calc(-0.2em - 10px)', marginLeft: '0.1em', zIndex: 6 }} />
        </div>

        <p className="subheading" style={{ marginBottom: '0.4em' }}>
          i'm claire :)
        </p>

        <div className="body-text">
          <ul>
            <li>cs @ university of waterloo</li>
            <li>reels creator</li>
            <li>art enthusiast</li>
          </ul>
        </div>

        <SocialBar className="social-bar--footer" />
      </BlurPanel>
    </div>
  );
}

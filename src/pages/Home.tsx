import BlurPanel from '../components/BlurPanel';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

export default function Home() {
  return (
    <div className="page page--home">
      <BlurPanel className="home-panel">
        <div className="home-title-wrap">
          <h1 className="heading-hello">
            hello!
          </h1>
          <StarDecal
            size={90}
            style={{ position: 'absolute', left: '100%', top: 'calc(-0.2em - 10px)', marginLeft: '0.1em', zIndex: 6 }}
          />
        </div>

        <p className="subheading" style={{ marginBottom: '0.25em' }}>
          i'm claire :)
        </p>

        <p className="home-tagline">
          I build creative, interactive software experiences.
        </p>

        <div className="body-text">
          <ul>
            <li>cs @ university of waterloo</li>
            <li>looking for <b>winter 2027 internships</b></li>
            <li>reels creator</li>
            <li>art enthusiast</li>
          </ul>
        </div>

        <SocialBar className="social-bar--footer" />

        <p className="home-fish-hint">try to catch the fish!</p>
      </BlurPanel>
    </div>
  );
}

import BlurPanel from '../components/BlurPanel';
import ScrollPage from '../components/ScrollPage';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

export default function Hobbies() {
  return (
    <ScrollPage className="page--projects">
      <div className="section-heading" style={{ marginBottom: '0.12em' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h2 className="heading-section">hobbies</h2>
          <StarDecal size={90} style={{ position: 'absolute', left: '100%', top: 'calc(-0.2em - 10px)', marginLeft: '0.1em', zIndex: 6 }} />
        </div>
      </div>

      <BlurPanel>
        <div className="body-text hobbies-text">
          <p>
            Non-technical interests / hobbies (talk to me about them):
          </p>
          <p>
            WORK IN PROGRESS
          </p>
          <ul>
            <li>
              <strong>Illustration</strong>
            </li>
            <li>
              <strong>Hip Hop</strong>
            </li>
            <li>
              <strong>Video Games</strong>
            </li>
            <li>
              <strong>Competitive Debate</strong>
            </li>
            <li>
              <strong>Tetris</strong>
            </li>
            <li>
              <strong>Roblox</strong>
            </li>
            <li>
              <strong>My Cat</strong>
            </li>
            <li>
              <strong>Meowl</strong>
            </li>
            <li>
              <strong>Apothecary Diaries</strong>
            </li>
          </ul>
        </div>
      </BlurPanel>

      <SocialBar className="social-bar--footer" />
    </ScrollPage>
  );
}

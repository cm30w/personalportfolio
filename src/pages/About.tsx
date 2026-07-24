import BlurPanel from '../components/BlurPanel';
import ScrollPage from '../components/ScrollPage';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

export default function About() {
  return (
    <ScrollPage className="page--projects">
      <div className="section-heading" style={{ marginBottom: '0.12em' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h2 className="heading-section">
            about me
          </h2>
          <StarDecal size={90} style={{ position: 'absolute', left: '100%', top: 'calc(-0.2em - 10px)', marginLeft: '0.1em', zIndex: 6 }} />
        </div>
      </div>

      <BlurPanel>
        <div className="body-text about-text">
          <p>
            Hi, I'm Claire! I'm a computer science student at the University of
            Waterloo. I like building things end-to-end: writing the code, and
            making sure people actually use what gets built. Alongside my
            technical work, I've led growth initiatives for tech companies and organizations,
            helping drive millions of views, which has given me a solid
            read on both the technical and audience side of a product.
          </p>
          <p>
            I take ownership seriously and throw myself 100% into my commitments.
            Whether that's running community initiatives, leading marketing campaigns,
            or managing a project from start to finish,
            I show up, follow through, and communicate clearly with the people I
            work with.
          </p>
          <p>
            Outside of coursework and projects, I'm involved in competitive
            debate, visual arts, and content creation, which keep me
            comfortable presenting ideas, working under deadlines, and adapting
            quickly, which carry over directly into how I work on a team.
          </p>
          <p>
            I'm especially drawn to projects with a real user at
            the other end of them, though I'm just as comfortable in a typical
            B2B/SaaS environment solving practical, ambiguous problems.
          </p>
        </div>
      </BlurPanel>

      <SocialBar className="social-bar--footer" />
    </ScrollPage>
  );
}

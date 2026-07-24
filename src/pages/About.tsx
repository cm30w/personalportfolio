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
            hi, i'm claire! I'm a computer science student at the university of
            waterloo. i like building things end-to-end: writing the code, and
            making sure people actually use what gets built. alongside my
            technical work, i've led growth initiatives for tech companies and organizations,
            helping drive tens of millions of views, which has given me a solid
            read on both the technical and audience side of a product.
          </p>
          <p>
            i take ownership seriously and throw myself 100% into my commitments.
            whether that's running community initiatives, leading marketing campaigns, 
            or managing a project from start to finish,
            i show up, follow through, and communicate clearly with the people i
            work with.
          </p>
          <p>
            outside of coursework and projects, i'm involved in competitive
            debate, visual arts, and content creation, which keep me
            comfortable presenting ideas, working under deadlines, and adapting
            quickly, which carry over directly into how i work on a team.
          </p>
          <p>
            if it weren't for CS, i'd probably be working at a cat shelter. :3
            or pursuing an architecture / illustration degree. or content management.
            but until then, i'm especially drawn to projects with a real user at
            the other end of them, though i'm just as comfortable in a typical
            b2b/saas environment solving practical, ambiguous problems.
            </p>
        </div>
      </BlurPanel>

      <SocialBar className="social-bar--footer" />
    </ScrollPage>
  );
}

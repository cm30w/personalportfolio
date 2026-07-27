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
          Hi, I'm Claire, a computer science student at the University of
          Waterloo. I like building things end-to-end; designing an API,
          wiring up a React frontend, and getting the small UX details right
          so people can actually click through and use what gets built.
        </p>
        <p>
          I'm comfortable across the stack, but I especially like turning
          ambiguous problems into a clear technical plan: what to build first,
          how the pieces should talk to each other, and what "done" actually
          looks like.
        </p>
        <p>
          I take ownership seriously. Whether that's leading frontend design
          for the Waterloo Computer Science Club, co-founding a hackathon, or
          managing a project from start to finish, I show up, follow through,
          and communicate clearly with the people I work with.
        </p>
        <p>
          Outside of coursework and projects, I debate competitively and take
          on marketing and community initiatives, which have strengthened my
          communication, adaptability, and ability to perform under pressure,
          skills that carry over directly into how I work on a team.
        </p>
          <p>
            (hobbies page coming soon)
          </p>
        </div>
      </BlurPanel>

      <SocialBar className="social-bar--footer" />
    </ScrollPage>
  );
}

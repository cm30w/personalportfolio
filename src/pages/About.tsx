import BlurPanel from '../components/BlurPanel';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

export default function About() {
  return (
    <div className="page page--scroll page--projects">
      <BlurPanel>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.4em' }}>
          <h2 className="heading-section">
            about me
          </h2>
          <StarDecal size={44} style={{ position: 'absolute', left: '100%', top: '-0.3em', marginLeft: '0.15em' }} />
        </div>

        <div className="body-text about-text">
          <p>
            if you're a recruiter, hi, my name is claire, I like to maximize
            shareholder profits and scale businesses with AI-powered solutions.
            I also do growth for startups, accumulating tens of millions of views.
          </p>
          <p>
            if you're not a recruiter, welcome to my website. i'm claire, a second
            year at the university of waterloo. I have a LOT of hobbies, ranging from
            competitive debate, visual arts, hip hop, nail art, making reels, watching
            anime, video games, etc. unfortunately, none of my hobbies are very
            profitable, which is how i ended up here.
          </p>
          <p>
            if i didn't have to support my family, I would probably work at a cat
            shelter. :3
          </p>
          <p>
            my passions in cs lie within working on projects that i would personally
            use, but i'm not opposed to working on the typical b2b saas and solving
            leetcode for quick dopamine hits.
          </p>
        </div>
      </BlurPanel>

      <SocialBar className="social-bar--footer" />
    </div>
  );
}

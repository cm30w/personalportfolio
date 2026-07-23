import BlurPanel from '../components/BlurPanel';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

interface Project {
  title: string;
  description: string;
  tags: string[];
  url?: string;
}

const projects: Project[] = [
  {
    title: 'personal website',
    description: 'this website! boid fish simulation + WebGL water ripple.',
    tags: ['React', 'TypeScript', 'WebGL', 'Canvas2D'],
    url: 'https://github.com/',
  },
  {
    title: 'project two',
    description: 'small project description here! something cool.',
    tags: ['Python', 'ML'],
  },
  {
    title: 'project three',
    description: 'small project description here! something fun.',
    tags: ['HTML', 'JavaScript'],
  },
  {
    title: 'project four',
    description: 'small project description here! even cooler.',
    tags: ['React', 'Node.js'],
  },
];

export default function Projects() {
  return (
    <div className="page page--scroll page--projects">
      <div className="section-heading" style={{ position: 'relative', display: 'inline-block', marginBottom: '0.4em' }}>
        <h2 className="heading-section">
          projects
        </h2>
        <StarDecal size={44} style={{ position: 'absolute', left: '100%', top: '-0.3em', marginLeft: '0.15em' }} />
      </div>

      <BlurPanel>
        <div className="project-grid">
          {projects.map((p) => (
            <div className="project-card" key={p.title}>
              <div className="project-card-preview" />
              <div className="project-card-body">
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card-title"
                  >
                    {p.title}
                  </a>
                ) : (
                  <h3 className="project-card-title">{p.title}</h3>
                )}
                <div className="tag-row">
                  {p.tags.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
                <p className="project-card-desc">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </BlurPanel>

      <SocialBar className="social-bar--footer" />
    </div>
  );
}

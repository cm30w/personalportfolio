import BlurPanel from '../components/BlurPanel';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

interface Role {
  title: string;
  org: string;
  period: string;
  bullets: string[];
}

const current: Role[] = [
  {
    title: 'web design lead',
    org: 'uw computer science club',
    period: 'present',
    bullets: [
      'run team to make class profile design assets for website',
      'improve website UX and visual identity',
    ],
  },
  {
    title: 'reels creator',
    org: '@realloclaire',
    period: 'may 2023 – present',
    bullets: [
      'started making reels in may — 15k+ followers in tech humor niche',
      'learned social media algorithms and growth strategies',
    ],
  },
];

const previous: Role[] = [
  {
    title: 'assistant vice president',
    org: 'uw computer science club',
    period: 'prev term',
    bullets: [
      'managed marketing, graphics, webcom',
      'content with bunch of views (stats later)',
    ],
  },
  {
    title: 'organizer + founding team',
    org: 'nrg hacks',
    period: 'prev term',
    bullets: [
      'founded our own hackathon',
    ],
  },
  {
    title: 'math tutor',
    org: 'mathnasium',
    period: 'summer 2023',
    bullets: [
      'babysat a bunch of kids',
      'got arithmetic mogged by some geniuses',
    ],
  },
  {
    title: 'competitive debater',
    org: 'various tournaments',
    period: 'high school',
    bullets: [
      'hella awards stack',
    ],
  },
];

export default function Work() {
  return (
    <div className="page page--scroll page--projects">
      <div className="section-heading" style={{ position: 'relative', display: 'inline-block', marginBottom: '0.35em' }}>
        <h2 className="heading-section">work</h2>
        <StarDecal size={44} style={{ position: 'absolute', left: '100%', top: '-0.3em', marginLeft: '0.15em' }} />
      </div>

      <BlurPanel>
        <section className="work-section">
          <h3 className="work-section-heading">currently:</h3>
          {current.map((r) => (
            <RoleBlock key={r.title + r.org} role={r} />
          ))}
        </section>
      </BlurPanel>

      <BlurPanel>
        <section className="work-section">
          <h3 className="work-section-heading">previously:</h3>
          {previous.map((r) => (
            <RoleBlock key={r.title + r.org} role={r} />
          ))}
        </section>
      </BlurPanel>

      <SocialBar className="social-bar--footer" />
    </div>
  );
}

function RoleBlock({ role }: { role: Role }) {
  return (
    <div className="role-block">
      <p className="role-title">
        {role.title}{' '}
        <span className="role-org">@ {role.org}</span>
      </p>
      <p className="role-period">{role.period}</p>
      <ul className="body-text role-bullets">
        {role.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

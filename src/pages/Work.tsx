import BlurPanel from '../components/BlurPanel';
import ScrollPage from '../components/ScrollPage';
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
    period: 'sept 2025 – present',
    bullets: [
      'lead a team of 5 designers to deliver the 2026 class profile, owning design from brief to launch',
      'established design system and workflow standards to keep the team aligned across concurrent workstreams',
    ],
  },
  {
    title: 'content creator',
    org: 'realloclaire',
    period: 'may 2023 – present',
    bullets: [
      'grew an audience of 15k+ followers producing tech-humor content from scratch',
      'developed practical expertise in platform algorithms and audience growth strategy',
    ],
  },
];

const previous: Role[] = [
  {
    title: 'assistant vice president',
    org: 'uw computer science club',
    period: 'jan 2026 – apr 2026',
    bullets: [
      'oversaw the events, web development, graphics, and marketing teams, driving cross-functional accountability week-over-week',
      "grew the club's instagram by 120,000+ cumulative views, with 4 reels averaging 30k+ views each — a 7.5x lift over prior benchmarks",
    ],
  },
  {
    title: 'ugc creator',
    org: 'quizlet',
    period: 'apr 2026',
    bullets: [
      'produced user-generated content for Quizlet, generating 10M+ views within a single month',
    ],
  },
  {
    title: 'organizer + founding team',
    org: 'nrg hacks',
    period: 'prev term',
    bullets: [
      "co-founded and organized a student-run hackathon supporting the school's cs program",
      'raised over $1,000 for the program and grew the event into an annual fixture, drawing ~50 teams from across the region',
    ],
  },
  {
    title: 'math instructor',
    org: 'mathnasium',
    period: 'aug 2024 – aug 2025',
    bullets: [
      'taught students topics ranging from basic arithmetic to high school calculus',
      'adapted teaching methods to individual learning styles to drive measurable comprehension gains',
    ],
  },
  {
    title: 'competitive debater',
    org: 'national & international tournaments',
    period: '2023 – 2025',
    bullets: [
      'semifinalist, harvard world schools debating championship (top 4 of 78 teams, 2025)',
      'finalist, hart house open (top 4 of 180 teams, 2024)',
      'semifinalist, mcgill hst open (2023)',
      'semifinalist & 4th open speaker, cusid hst (2023)',
      '4th open speaker, western hst (of 396 speakers, 2023)',
    ],
  },
];

export default function Work() {
  return (
    <ScrollPage className="page--projects">
      <div className="section-heading" style={{ marginBottom: '0.105em' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h2 className="heading-section">work</h2>
          <StarDecal size={90} style={{ position: 'absolute', left: '100%', top: 'calc(-0.2em - 10px)', marginLeft: '0.1em', zIndex: 6 }} />
        </div>
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
    </ScrollPage>
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

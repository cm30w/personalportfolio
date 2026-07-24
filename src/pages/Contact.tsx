import BlurPanel from '../components/BlurPanel';
import ScrollPage from '../components/ScrollPage';
import StarDecal from '../layers/StarDecal';

interface ContactEntry {
  label: string;
  value: string;
  href: string;
}

const entries: ContactEntry[] = [
  { label: 'work', value: 'c842wang@uwaterloo.ca', href: 'mailto:c842wang@uwaterloo.ca' },
  { label: 'social / partnerships', value: 'claire45452@gmail.com', href: 'mailto:claire45452@gmail.com' },
  { label: 'github', value: 'github.com/', href: 'https://github.com/cm30w' },
  { label: 'linkedin', value: 'linkedin.com/in/', href: 'https://www.linkedin.com/in/claire-wang-33067b252/' },
  { label: 'pixiv (art)', value: 'pixiv.net/users/', href: 'https://www.pixiv.net/en/users/61091823' },
  { label: 'instagram', value: '@realloclaire', href: 'https://www.instagram.com/realloclaire/' },
];

export default function Contact() {
  return (
    <ScrollPage className="page--projects">
      <div className="section-heading" style={{ marginBottom: '0.105em' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h2 className="heading-section">contact me</h2>
          <StarDecal size={90} style={{ position: 'absolute', left: '100%', top: 'calc(-0.2em - 10px)', marginLeft: '0.1em', zIndex: 6 }} />
        </div>
      </div>

      <BlurPanel className="blur-panel--fit">
        <section className="work-section">
          {entries.map((e) => (
            <ContactBlock key={e.label} entry={e} />
          ))}
        </section>
      </BlurPanel>
    </ScrollPage>
  );
}

function ContactBlock({ entry }: { entry: ContactEntry }) {
  return (
    <div className="role-block">
      <p className="role-title">{entry.label}</p>
      <a
        href={entry.href}
        target="_blank"
        rel="noopener noreferrer"
        className="body-text contact-link"
      >
        {entry.value}
      </a>
    </div>
  );
}

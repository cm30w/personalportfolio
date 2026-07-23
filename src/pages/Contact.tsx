import BlurPanel from '../components/BlurPanel';
import StarDecal from '../layers/StarDecal';

interface ContactEntry {
  label: string;
  value: string;
  href: string;
}

const entries: ContactEntry[] = [
  { label: 'work', value: 'c842wang@uwaterloo.ca', href: 'mailto:c842wang@uwaterloo.ca' },
  { label: 'social / partnerships', value: 'claire45452@gmail.com', href: 'mailto:claire45452@gmail.com' },
  { label: 'github', value: 'github.com/', href: 'https://github.com/' },
  { label: 'linkedin', value: 'linkedin.com/in/', href: 'https://linkedin.com/in/' },
  { label: 'pixiv (art)', value: 'pixiv.net/users/', href: 'https://pixiv.net/users/' },
  { label: 'instagram', value: '@realloclaire', href: 'https://instagram.com/' },
];

export default function Contact() {
  return (
    <div className="page page--scroll page--projects">
      <BlurPanel>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.35em' }}>
          <h2 className="heading-section">contact me</h2>
          <StarDecal size={44} style={{ position: 'absolute', left: '100%', top: '-0.3em', marginLeft: '0.15em' }} />
        </div>

        <section className="work-section">
          {entries.map((e) => (
            <ContactBlock key={e.label} entry={e} />
          ))}
        </section>
      </BlurPanel>
    </div>
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

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import BlurPanel from '../components/BlurPanel';
import ScrollPage from '../components/ScrollPage';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

interface Project {
  title: string;
  date: string;
  description: string;
  highlights: string[];
  tags: string[];
  preview: string;
  url?: string;
}

function previewUrl(filename: string) {
  return `${import.meta.env.BASE_URL}project-previews/${encodeURIComponent(filename)}`;
}

const projects: Project[] = [
  {
    title: 'personal website',
    date: 'jul 2026',
    description:
      'This site — a WebGL water surface and Canvas2D boid fish school I built from scratch in React and TypeScript.',
    highlights: [
      'Built WebGL ripple compositing over a live fish texture',
      'Implemented boid flocking with cursor avoidance',
      'Coded custom animations without external physics libraries',
    ],
    tags: ['React', 'TypeScript', 'WebGL', 'Canvas2D'],
    preview: previewUrl('personal website.png'),
    url: 'https://github.com/cm30w/personalportfolio',
  },
  {
    title: 'nimbus',
    date: 'jul 2026',
    description:
      'Team project translating voice and visual intent into precise drone actions with on-device and cloud ML.',
    highlights: [
      'Contributor — voice/intent pipeline from speech to structured flight JSON',
      'Integrated ElevenLabs STT with a fine-tuned intent LLM',
    ],
    tags: ['Swift', 'Python', 'Robotics', 'iOS'],
    preview: previewUrl('nimbus.png'),
    url: 'https://devpost.com/software/nimbus-n9x04s',
  },
  {
    title: 'dancetracker',
    date: 'jul 2026',
    description:
      'Browser dance practice app that scores webcam pose against a reference video in real time.',
    highlights: [
      'Ran MediaPipe pose tracking fully client-side',
      'Scored 8 joint angles per second into a 0–10 accuracy metric',
      'Built sync adjustment and custom MP4 upload flows',
    ],
    tags: ['React', 'TypeScript', 'Computer Vision', 'Tailwind CSS'],
    preview: previewUrl('dance tracker.png'),
    url: 'https://github.com/cm30w/dancetracker',
  },
  {
    title: 'worktracker',
    date: 'jun 2026',
    description:
      'Cross-platform Electron desktop app combining tasks, pomodoro timing, and optional Spotify Connect.',
    highlights: [
      'Built reusable React components with shared state across views',
      'Integrated Spotify Connect alongside a local music player',
      'Implemented fully customizable theming',
    ],
    tags: ['Electron', 'React', 'TypeScript', 'Desktop'],
    preview: previewUrl('work tracker.png'),
    url: 'https://github.com/cm30w/worktracker',
  },
  {
    title: 'boid',
    date: 'jan 2026',
    description:
      'Browser flocking simulation where local separation, alignment, and cohesion produce emergent group motion.',
    highlights: [
      'Implemented classic boid rules from scratch on HTML5 canvas',
      'Tuned neighbor radius and weights for stable flocking',
      'Avoided external physics libraries',
    ],
    tags: ['JavaScript', 'Canvas2D', 'Algorithms'],
    preview: previewUrl('boid.png'),
    url: 'https://github.com/cm30w/boid',
  },
  {
    title: 'multi-fx',
    date: 'mar 2025',
    description:
      'Contributor on a team real-time audio effects stack applying distortion, chorus, and delay to live mic input.',
    highlights: [
      'Contributor — React frontend controlling live effect parameters',
      'Wired UI to a low-latency Python/FastAPI audio backend',
      'Handled real-time mic streaming with PyAudio',
    ],
    tags: ['Python', 'React', 'FastAPI', 'Audio Processing'],
    preview: previewUrl('multifx.png'),
    url: 'https://github.com/sborishchev/multi-fx',
  },
];

function ProjectCard({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const teaserRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const body = bodyRef.current;
    const header = headerRef.current;
    const tags = tagsRef.current;
    const teaser = teaserRef.current;
    if (!card || !body || !header || !tags || !teaser) return;

    const syncCollapsedHeight = () => {
      const style = getComputedStyle(body);
      const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const headerGap = parseFloat(getComputedStyle(header).marginBottom) || 0;
      const tagsMargin = parseFloat(getComputedStyle(tags).marginTop) || 0;
      const teaserMargin = parseFloat(getComputedStyle(teaser).marginTop) || 0;
      const collapsed =
        padY +
        header.offsetHeight +
        headerGap +
        tagsMargin +
        tags.scrollHeight +
        teaserMargin +
        teaser.offsetHeight;
      card.style.setProperty('--collapsed-h', `${Math.ceil(collapsed)}px`);
    };

    syncCollapsedHeight();
    const ro = new ResizeObserver(syncCollapsedHeight);
    ro.observe(card);
    ro.observe(tags);
    ro.observe(teaser);
    return () => ro.disconnect();
  }, [project]);

  useEffect(() => {
    if (!isExpanded) return;

    const onPointerDown = (e: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isExpanded]);

  const onCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a.project-card-title')) return;

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      ref={cardRef}
      className={`project-card${isExpanded ? ' is-expanded' : ''}`}
      onClick={onCardClick}
    >
      <div
        className="project-card-preview"
        style={{ backgroundImage: `url(${project.preview})` }}
      />
      <div className="project-card-body" ref={bodyRef}>
        <div className="project-card-header" ref={headerRef}>
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card-title"
            >
              {project.title}
            </a>
          ) : (
            <h3 className="project-card-title">{project.title}</h3>
          )}
          <span className="project-card-date">{project.date}</span>
        </div>
        <div className="project-card-details">
          <div className="tag-row" ref={tagsRef}>
            {project.tags.map((t) => (
              <span className="tag" key={t}>{t}</span>
            ))}
          </div>
          <p className="project-card-teaser" ref={teaserRef}>{project.description}</p>
          <div className="project-card-desc">
            <p>{project.description}</p>
            <ul className="project-highlights">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <ScrollPage className="page--projects">
      <div className="section-heading" style={{ marginBottom: '0.12em' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h2 className="heading-section">
            projects
          </h2>
          <StarDecal size={90} style={{ position: 'absolute', left: '100%', top: 'calc(-0.2em - 10px)', marginLeft: '0.1em', zIndex: 6 }} />
        </div>
      </div>

      <BlurPanel>
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
      </BlurPanel>

      <SocialBar className="social-bar--footer" />
    </ScrollPage>
  );
}

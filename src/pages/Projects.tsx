import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import BlurPanel from '../components/BlurPanel';
import ScrollPage from '../components/ScrollPage';
import SocialBar from '../components/SocialBar';
import StarDecal from '../layers/StarDecal';

interface Project {
  title: string;
  date: string;
  description: string;
  tags: string[];
  url?: string;
}

const projects: Project[] = [
  {
    title: 'personal website',
    date: 'jul 2026',
    description: 'This site itself. A canvas boid simulation drives a fish school across the background. A WebGL layer renders responsive water ripples. Built with React and TypeScript on Vite, animations coded from scratch.',
    tags: ['React', 'TypeScript', 'WebGL', 'Canvas2D'],
    url: 'https://github.com/cm30w/personalportfolio',
  },
  {
    title: 'nimbus',
    date: 'jul 2026',
    description: 'A voice-controlled, self-driving drone built with a team. A Swift iOS app captures voice commands and sends flight instructions. A Python backend handles autonomous navigation. Explores voice control paired with real-time flight logic.',
    tags: ['Swift', 'Python', 'Robotics', 'iOS'],
    url: 'https://github.com/Raymond1134/Nimbus',
  },
  {
    title: 'dancetracker',
    date: 'jul 2026',
    description: 'A browser dance practice app comparing your webcam movement to a reference video. Uses MediaPipe pose tracking client-side, scoring 8 joint angles each second into a 0-10 accuracy score. Supports custom MP4 uploads and sync adjustment.',
    tags: ['React', 'TypeScript', 'Computer Vision', 'Tailwind CSS'],
    url: 'https://github.com/cm30w/dancetracker',
  },
  {
    title: 'worktracker',
    date: 'jun 2026',
    description: 'A cross-platform desktop app with a task list, pomodoro timer, and integrated music player with optional Spotify Connect. Built with Electron, React, and TypeScript. Fully customizable theme. Ships as a native Windows installer.',
    tags: ['Electron', 'React', 'TypeScript', 'Desktop'],
    url: 'https://github.com/cm30w/worktracker',
  },
  {
    title: 'boid',
    date: 'jan 2026',
    description: 'A browser boid flocking simulation. Each boid follows three local rules - separation, alignment, cohesion - producing emergent group movement. Built with vanilla JavaScript and HTML5 canvas, no external physics libraries.',
    tags: ['JavaScript', 'Canvas2D', 'Algorithms'],
    url: 'https://github.com/cm30w/boid',
  },
  {
    title: 'multi-fx',
    date: 'mar 2025',
    description: 'A real-time audio effects app applying distortion, chorus, and delay to live mic input. Python (PyAudio, FastAPI) processes audio with low latency, controlled from a React frontend. Built as a team project.',
    tags: ['Python', 'React', 'FastAPI', 'Audio Processing'],
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
    // Title links navigate; don't toggle expand when following them.
    if ((e.target as HTMLElement).closest('a.project-card-title')) return;

    // Fine pointers use CSS :hover; only toggle for coarse/touch.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      ref={cardRef}
      className={`project-card${isExpanded ? ' is-expanded' : ''}`}
      onClick={onCardClick}
    >
      <div className="project-card-preview" />
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
          <p className="project-card-desc">{project.description}</p>
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

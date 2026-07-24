import { useEffect, useRef, useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import FishCanvas from './layers/FishCanvas';
import type { FishCanvasHandle } from './layers/FishCanvas';
import WaterCanvas from './layers/WaterCanvas';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import Projects from './pages/Projects';
import Contact from './pages/Contact';

const NAV_ITEMS = [
  { to: '/', label: 'home', shortLabel: 'home', end: true },
  { to: '/about', label: 'about me', shortLabel: 'about' },
  { to: '/work', label: 'work', shortLabel: 'work' },
  { to: '/projects', label: 'projects', shortLabel: 'projects' },
  { to: '/contact', label: 'contact', shortLabel: 'contact' },
] as const;

function currentNavLabel(pathname: string): string {
  const match = NAV_ITEMS.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );
  return match?.shortLabel ?? 'home';
}

function SiteNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <nav ref={navRef} className={`nav${open ? ' nav--open' : ''}`}>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav-toggle-label">{currentNavLabel(location.pathname)}</span>
        <span className="nav-toggle-chevron" aria-hidden="true" />
      </button>

      <div id="nav-menu" className="nav-links" role="list">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : undefined} role="listitem">
            <span className="nav-label-desktop">{item.label}</span>
            <span className="nav-label-mobile">{item.shortLabel}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function AppShell() {
  const fishRef = useRef<FishCanvasHandle>(null);

  return (
    <>
      <ScrollToTop />

      {/* Layer 0: Water ripple (WebGL) — owns background + distorts fish */}
      <WaterCanvas fishRef={fishRef} />

      {/* Layer 0 (offscreen): Fish boids — renders to canvas exposed via ref */}
      <FishCanvas ref={fishRef} />

      {/* Layer 3+: Nav + page content */}
      <SiteNav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/work" element={<Work />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}

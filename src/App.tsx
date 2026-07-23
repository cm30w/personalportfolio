import { useRef } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import FishCanvas from './layers/FishCanvas';
import type { FishCanvasHandle } from './layers/FishCanvas';
import WaterCanvas from './layers/WaterCanvas';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import Projects from './pages/Projects';
import Contact from './pages/Contact';

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
      <nav className="nav">
        <NavLink to="/" end>home</NavLink>
        <NavLink to="/about">about me</NavLink>
        <NavLink to="/work">work</NavLink>
        <NavLink to="/projects">projects</NavLink>
        <NavLink to="/contact">contact</NavLink>
      </nav>

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

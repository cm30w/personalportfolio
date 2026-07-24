import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// #region agent log
const __dbg = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string) => {
  fetch('http://127.0.0.1:7691/ingest/46a1531e-b5f7-424f-853f-c4ad2f0a24ce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cde014' },
    body: JSON.stringify({ sessionId: 'cde014', location, message, data, timestamp: Date.now(), hypothesisId }),
  }).catch(() => {});
};
window.addEventListener('error', (e) => {
  __dbg('main.tsx:error', 'window error', { msg: e.message, src: e.filename, line: e.lineno }, 'H2');
});
window.addEventListener('unhandledrejection', (e) => {
  __dbg('main.tsx:rejection', 'unhandled rejection', { reason: String(e.reason) }, 'H2');
});
__dbg('main.tsx:boot', 'app boot', {
  href: window.location.href,
  baseUrl: import.meta.env.BASE_URL,
  hash: window.location.hash,
}, 'H1');
// #endregion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// #region agent log
__dbg('main.tsx:mounted', 'react root rendered', { rootExists: !!document.getElementById('root') }, 'H2');
// #endregion

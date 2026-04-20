
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Production Debugging: Log any top-level initialization errors
  window.addEventListener('error', (event) => {
    console.error('GLOBAL ERROR CAPTURED:', event.error);
    const root = document.getElementById('root');
    if (root && root.innerHTML === '') {
      root.innerHTML = `<div style="padding: 20px; color: white; background: #991b1b; font-family: sans-serif;">
        <h1 style="font-size: 1.25rem;">Application Initialization Failed</h1>
        <p style="font-size: 0.875rem;">${event.error?.message || 'Unknown Error'}</p>
        <p style="font-size: 0.75rem; opacity: 0.8;">Check the browser console for details.</p>
      </div>`;
    }
  });

  createRoot(document.getElementById("root")!).render(<App />);
  
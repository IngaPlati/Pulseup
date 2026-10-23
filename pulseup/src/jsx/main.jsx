import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import '../css/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'The root element was not found. Make sure index.html contains <div id="root"></div>.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

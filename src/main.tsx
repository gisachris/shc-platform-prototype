/**
 * Frontend entry point for the React application.
 *
 * This file mounts the root App component into the DOM and loads the global stylesheet.
 * It is the browser bootstrap point for the entire SHC interface.
 */

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

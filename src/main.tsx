import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DriveProvider } from './contexts/DriveContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DriveProvider>
      <App />
    </DriveProvider>
  </StrictMode>,
);

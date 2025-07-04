import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import App from './App.tsx';
import './index.css';

// Configure Chonky
setChonkyDefaults({ iconComponent: ChonkyIconFA });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
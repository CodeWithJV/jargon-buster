import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { TermProvider } from './context/TermContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TermProvider>
        <App />
      </TermProvider>
    </AuthProvider>
  </StrictMode>
);

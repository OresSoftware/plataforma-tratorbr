// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Aplicativo from "./pages/Aplicativo";
import ContatoPage from "./pages/ContatoPage";
import AjudaPage from "./pages/AjudaPage";
import TermosEPolitica from './pages/TermosEPoliticaPage';
import AdminLoginPage from './admin-gestao/AdminLoginPage';
import AdminDashboardPage from './admin-gestao/AdminDashboardPage';
import AdminIpsPage from './admin-gestao/AdminIpsPage';
import ExcluirContaPage from './pages/ExcluirContaPage';
import SobreNosPage from './pages/SobreNosPage';

import TitleManager from "./TitleManager";
import CookieConsent from "./components/CookieConsent";
import Analytics from "./components/Analytics";
import { MobileMenuProvider } from "./contexts/MobileMenuContext";
import AdminContatoPage from './admin-gestao/AdminContatoPage';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useEffect } from 'react';


function ScrollToHashElement() {
  const { hash } = useLocation();
  const action = useNavigationType(); // 'PUSH' | 'REPLACE' | 'POP' (reload/back/forward)

  useEffect(() => {
    // Só rola ao hash quando a navegação foi por Link/navigate (PUSH/REPLACE).
    if (hash && (action === 'PUSH' || action === 'REPLACE')) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash, action]);

  return null;
}

function App() {
  return (
    <MobileMenuProvider>
      <Router>
        <TitleManager />
        <ScrollToHashElement />
        <Routes>
          {/* Páginas Públicas */}
          <Route path="/" element={<Aplicativo />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/politicasdeprivacidade.html" element={<TermosEPolitica />} />
          <Route path="/ajuda" element={<AjudaPage />} />
          <Route path="/excluir-conta" element={<ExcluirContaPage />} />
          <Route path="/sobre-nos" element={<SobreNosPage />} />

          {/* Área Administrativa */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/ips" element={<AdminIpsPage />} />
          <Route path="/admin/contato" element={<AdminContatoPage />} />
          

          {/* Redirecionamentos */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
        <CookieConsent />
        <Analytics />
      </Router>
    </MobileMenuProvider>
  );
}

export default App;


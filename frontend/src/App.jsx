// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Aplicativo from "./pages/Aplicativo";
import ContatoPage from "./pages/ContatoPage";
import AjudaPage from "./pages/AjudaPage";
import TermosEPolitica from './pages/TermosEPoliticaPage';
import PlanoseCreditos from './pages/TermosCreditoePlanos';
import AdminLoginPage from './admin-gestao/AdminLoginPage';
import AdminDashboardPage from './admin-gestao/AdminDashboardPage';
import AdminIpsPage from './admin-gestao/AdminIpsPage';
import ExcluirContaPage from './pages/ExcluirContaPage';
import SobreNosPage from './pages/SobreNosPage';
import SobreApp from './pages/SobreApp';
import HomePage from "./pages/HomePage";
import AnunciosPage from "./pages/AnunciosPage";
import AvaliacaoPage from "./pages/AvaliacaoPage";
import AdminAvaliacoesPage from './admin-gestao/AdminAvaliacoesPage';

import TitleManager from "./TitleManager";
import CookieConsent from "./components/CookieConsent";
import Analytics from "./components/Analytics";
import StructuredDataAdvanced from "./components/StructuredDataAdvanced";
import { MobileMenuProvider } from "./contexts/MobileMenuContext";
import AdminContatoPage from './admin-gestao/AdminContatoPage';
import AdminEnterprisesPage from './admin-gestao/AdminEnterprisesPage';
import AdminUsersPage from './admin-gestao/AdminUsersPage';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useEffect } from 'react';


function ScrollToHashElement() {
  const { hash } = useLocation();
  const action = useNavigationType();

  useEffect(() => {
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
        {/* Sitelinks */}
        <StructuredDataAdvanced />

        <TitleManager />
        <ScrollToHashElement />
        <Routes>
          {/* Páginas Públicas */}
          <Route path="/" element={<HomePage/>} />
          <Route path="/anuncios" element={<AnunciosPage />} />
          <Route path="/aplicativo" element={<Aplicativo />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/politicasdeprivacidade.html" element={<TermosEPolitica />} />
          <Route path="/planos-creditos" element={<PlanoseCreditos />} />
          <Route path="/ajuda" element={<AjudaPage />} />
          <Route path="/excluir-conta" element={<ExcluirContaPage />} />
          <Route path="/quem-somos" element={<SobreNosPage />} />
          <Route path="/sobre-app" element={<SobreApp />} />
          <Route path="/avaliar" element={<AvaliacaoPage />} />
          

          {/* Área Administrativa */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/ips" element={<AdminIpsPage />} />
          <Route path="/admin/contato" element={<AdminContatoPage />} />
          <Route path="/admin/empresas" element={<AdminEnterprisesPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          <Route path="/admin/avaliacoes" element={<AdminAvaliacoesPage />} />


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

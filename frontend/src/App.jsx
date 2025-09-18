// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Aplicativo from "./pages/Aplicativo";
import ContatoPage from "./pages/ContatoPage";
import AjudaPage from "./pages/AjudaPage";
import PoliticaPrivacidadePage from "./pages/PoliticaPrivacidadePage";
import TermosUsoPage from './pages/TermosUsoPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminIpsPage from './pages/AdminIpsPage';
import ExcluirContaPage from './pages/ExcluirContaPage';
import SobreNosPage from './pages/SobreNosPage';

import TitleManager from "./TitleManager";
import CookieConsent from "./components/CookieConsent";
import Analytics from "./components/Analytics";
import { MobileMenuProvider } from "./contexts/MobileMenuContext";


function App() {
  return (
    <MobileMenuProvider>
      <Router>
        <TitleManager />
        <Routes>
          {/* Páginas Públicas */}
          <Route path="/" element={<Aplicativo />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/termos-e-politicas" element={<TermosEPolitica />} />
          <Route path="/ajuda" element={<AjudaPage />} />
          <Route path="/excluir-conta" element={<ExcluirContaPage />} />
          <Route path="/sobre-nos" element={<SobreNosPage />} />

          {/* Área Administrativa */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/ips" element={<AdminIpsPage />} />

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


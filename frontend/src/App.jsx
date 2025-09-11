// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Aplicativo from "./pages/Aplicativo";
import ContatoPage from "./pages/ContatoPage";
import DuvidasPage from "./pages/DuvidasPage";
import PoliticaPrivacidadePage from "./pages/PoliticaPrivacidadePage";
import TermosUsoPage from './pages/TermosUsoPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminIpsPage from './pages/AdminIpsPage';

import TitleManager from "./TitleManager";

function App() {
  return (
    <Router>
      <TitleManager />
      <Routes>
        {/* Páginas Públicas */}
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/" element={<Aplicativo />} />
        <Route path="/contato" element={<ContatoPage />} />
        <Route path="/politica-privacidade" element={<PoliticaPrivacidadePage />} />
        <Route path="/termos-uso" element={<TermosUsoPage />} />

        {/* Páginas do TratorBR */}
        <Route path="/admin/duvidas" element={<DuvidasPage />} />

        {/* Área Administrativa */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/ips" element={<AdminIpsPage />} />

        {/* Redirecionamentos */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


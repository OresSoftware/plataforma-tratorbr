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
import AdminFuncionariosPage from './admin-gestao/AdminFuncionariosPage';
import Cadastro from './pages-auth/CadastroPage';
import Entrar from './pages-auth/LoginPage';

import TitleManager from "./TitleManager";
import CookieConsent from "./components/CookieConsent";
import Analytics from "./components/Analytics";
import { MobileMenuProvider } from "./contexts/MobileMenuContext";
import AdminContatoPage from './admin-gestao/AdminContatoPage';
import AdminEnterprisesPage from './admin-gestao/AdminEnterprisesPage';
import AdminUsersPage from './admin-gestao/AdminUsersPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import ProtectedRoute from './components/ProtectedRoute';
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

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <TitleManager />
      <ScrollToHashElement />
      <Routes>

        {/* Páginas Públicas */}
        <Route path="/" element={<Aplicativo />} />
        <Route path="/contato" element={<ContatoPage />} />
        <Route path="/politicasdeprivacidade.html" element={<TermosEPolitica />} />
        <Route path="/planos-creditos" element={<PlanoseCreditos />} />
        <Route path="/ajuda" element={<AjudaPage />} />
        <Route path="/excluir-conta" element={<ExcluirContaPage />} />
        <Route path="/quem-somos" element={<SobreNosPage />} />
        <Route path="/sobre-app" element={<SobreApp />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/cadastrar" element={<Cadastro />} />

        {/* Área Administrativa */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredPermission="dashboard" key={location.pathname}>
              <AdminDashboardPage key={location.pathname} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredPermission="dashboard" key={location.pathname}>
              <AdminDashboardPage key={location.pathname} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/ips"
          element={
            <ProtectedRoute requireMaster={true} key={location.pathname}>
              <AdminIpsPage key={location.pathname} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/contato"
          element={
            <ProtectedRoute requiredPermission="contatos" key={location.pathname}>
              <AdminContatoPage key={location.pathname} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/empresas"
          element={
            <ProtectedRoute requiredPermission="empresas" key={location.pathname}>
              <AdminEnterprisesPage key={location.pathname} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute requiredPermission="usuarios" key={location.pathname}>
              <AdminUsersPage key={location.pathname} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/funcionarios"
          element={
            <ProtectedRoute requireMaster={true} key={location.pathname}>
              <AdminFuncionariosPage key={location.pathname} />
            </ProtectedRoute>
          } 
        />

        {/* Página de Acesso Negado */}
        <Route path="/admin/acesso-negado" element={<AccessDeniedPage />} />

        {/* Redirecionamento padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}

function App() {
  return (
    <MobileMenuProvider>
      <Router>

        <AppRoutes />

        <CookieConsent />
        <Analytics />
      </Router>
    </MobileMenuProvider>
  );
}

export default App;

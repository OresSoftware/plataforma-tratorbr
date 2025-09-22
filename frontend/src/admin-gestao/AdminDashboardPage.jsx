// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Menu, X, LayoutDashboard, Users, MapPin, LogOut, MessageCircleQuestion } from "lucide-react";
import './style/AdminDashboardPage.css';

function AdminDashboardPage() {
  const [metricas, setMetricas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // dados do admin salvos no login
  const admin = JSON.parse(localStorage.getItem('adminData') || '{}');
  const isMaster = admin?.role === 'master';

  // helper para destacar o item atual do menu
  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const metricasRes = await axios.get('http://localhost:3001/api/admin/dashboard/metricas', config);
      setMetricas(metricasRes.data);
      setError('');

    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      } else {
        setError('Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Botão hamburger (mobile) */}
      <button
        className="hamburger-btn"
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar (fixa no desktop; off-canvas no mobile) */}
      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
        {/* Fechar (mobile) */}
        <button
          className="close-sidebar"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        >
          <X size={22} />
        </button>

        <div className="sidebar-header">
          <h1>TRATOR BR</h1>
          <p>Sistema Interno</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard className="nav-icon" size={22} />
            Dashboard
          </button>

          {isMaster && (
            <button
              className={`nav-item ${isActive('/admin/ips') ? 'active' : ''}`}
              onClick={() => navigate('/admin/ips')}
            >
              <MapPin className="nav-icon" size={22} />
              IP de Acesso
            </button>
          )}

          <button
            className={`nav-item ${isActive('/admin/contato') ? 'active' : ''}`}
            onClick={() => navigate('/admin/contato')}
          >
            <MessageCircleQuestion className="nav-icon" size={22} />
            Contatos
          </button>
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut className="nav-icon" size={22} />
          Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          <h1>Dashboard</h1>

          {error && (
            <div className="error-banner">
              {error}
              <button onClick={carregarDados}>Tentar novamente</button>
            </div>
          )}

          {/* Métricas Simplificadas */}
          <div className="metricas-grid-simple">
            <div className="metrica-card">
              <h3>Admins Cadastrados</h3>
              <div className="metrica-valor">{metricas.adminsIpsCadastrados || 0}</div>
              <p className="metrica-desc">IPs cadastrados</p>
            </div>

            <div className="metrica-card">
              <h3>Admins Online</h3>
              <div className="metrica-valor">{metricas.adminsOnline || 0}</div>
              <p className="metrica-desc">Últimas 24h</p>
            </div>

            <div className="metrica-card">
              <h3>Contatos Pendentes</h3>
              <div className="metrica-valor">{metricas.contatosPendentes || 0}</div>
              <p className="metrica-desc">Aguardando resposta</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;

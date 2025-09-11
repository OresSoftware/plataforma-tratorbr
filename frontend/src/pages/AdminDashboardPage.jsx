import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboardPage.css';
import { Menu, X, LayoutDashboard, MapPin, LogOut, MessageCircle, Mail } from "lucide-react";

function AdminDashboardPage() {
  const [metricas, setMetricas] = useState({});
  const [pendencias, setPendencias] = useState({});
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

      const [metricasRes, pendenciasRes] = await Promise.all([
        axios.get('http://localhost:3001/api/admin/dashboard/metricas', config),
        axios.get('http://localhost:3001/api/admin/dashboard/pendencias', config)
      ]);

      setMetricas(metricasRes.data);
      setPendencias(pendenciasRes.data);
      setError('');

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      } else {
        setError('Erro ao carregar dados do dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1>TratorBR - Admin</h1>
        </div>
        <div className="header-right">
          <span className="admin-name">Olá, {admin.username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Sidebar */}
        <nav className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-menu">
            <li className={isActive('/admin/dashboard') ? 'active' : ''}>
              <button onClick={() => navigate('/admin/dashboard')}>
                <LayoutDashboard size={20} />
                Dashboard
              </button>
            </li>
            
            {isMaster && (
              <li className={isActive('/admin/ips') ? 'active' : ''}>
                <button onClick={() => navigate('/admin/ips')}>
                  <MapPin size={20} />
                  Gerenciar IPs
                </button>
              </li>
            )}
            
            <li className={isActive('/admin/contatos') ? 'active' : ''}>
              <button onClick={() => navigate('/admin/contatos')}>
                <Mail size={20} />
                Contatos
              </button>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="dashboard-main">
          {error && <div className="error-message">{error}</div>}
          
          <div className="dashboard-grid">
            {/* Métricas Principais */}
            <div className="metrics-section">
              <h2>Métricas do Sistema</h2>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">
                    <Mail size={24} />
                  </div>
                  <div className="metric-info">
                    <h3>Total de Contatos</h3>
                    <p className="metric-value">{metricas.totalContatos || 0}</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="metric-info">
                    <h3>IPs Autorizados</h3>
                    <p className="metric-value">{metricas.totalIpsAutorizados || 0}</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div className="metric-info">
                    <h3>Contatos Recentes</h3>
                    <p className="metric-value">{metricas.contatosRecentes || 0}</p>
                    <small>Últimos 7 dias</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendências */}
            <div className="pendencias-section">
              <h2>Pendências</h2>
              <div className="pendencias-grid">
                <div className="pendencia-card">
                  <div className="pendencia-info">
                    <h3>Contatos Não Lidos</h3>
                    <p className="pendencia-count">{pendencias.contatos || 0}</p>
                  </div>
                  {pendencias.contatos > 0 && (
                    <button 
                      className="action-btn"
                      onClick={() => navigate('/admin/contatos')}
                    >
                      Ver Contatos
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status do Sistema */}
            <div className="status-section">
              <h2>Status do Sistema</h2>
              <div className="status-card">
                <div className="status-indicator active"></div>
                <p>{metricas.status || 'Sistema Ativo'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardPage;


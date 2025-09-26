// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from "../lib/api";
import AdminLayout from '../components/AdminLayout';
import './style/AdminDashboardPage.css';

function AdminDashboardPage() {
  const [metricas, setMetricas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Se você ainda quiser checar o token localmente, pode manter:
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      // Cliente central já injeta Authorization. Basta chamar:
      const { data } = await api.get('/admin/dashboard/metricas');
      setMetricas(data);
      setError('');
    } catch (err) {
      // Se você usa axiosGuard/redirect de 401 global, isso aqui pode ser só setError
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

  return (
    <AdminLayout>
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
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              <p>Carregando...</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboardPage;

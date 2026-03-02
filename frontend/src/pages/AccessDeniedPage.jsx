import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/AccessDeniedPage.css';
import { AlertCircle, LogOut } from 'lucide-react';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se está autenticado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="access-denied-icon">
          <AlertCircle size={64} />
        </div>
        
        <h1 className="access-denied-title">Acesso Negado</h1>
        
        <p className="access-denied-message">
          Você não tem permissão para acessar nenhuma página do sistema.
        </p>

        <p className="access-denied-description">
          Entre em contato com o administrador para solicitar acesso às páginas necessárias.
        </p>

        <div className="access-denied-actions">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
            Sair
          </button>
        </div>

        <div className="access-denied-info">
          <p>
            <strong>Código de erro:</strong> 403 - Acesso Proibido
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;

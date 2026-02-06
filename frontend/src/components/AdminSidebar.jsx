import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, MapPin, LogOut, MessageCircleQuestion, Building2, Users, Star } from "lucide-react";
import './style/AdminSidebar.css';

const AdminSidebar = ({ menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('adminData') || '{}');
  const isMaster = admin?.role === 'master';
  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const handleBackdropClick = () => {
      if (menuOpen) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('click', handleBackdropClick);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleBackdropClick);
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen, setMenuOpen]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <button className={`hamburger-btn ${menuOpen ? 'menu-open' : ''}`} aria-label="Abrir menu" aria-expanded={menuOpen} onClick={(e) => { e.stopPropagation(); setMenuOpen(true); }}>
        <Menu size={24} />
      </button>

      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-sidebar" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
          <X size={22} />
        </button>

        <div className="sidebar-header">
          <h1>TRATOR BR</h1>
          <p>Sistema Interno</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('/admin/dashboard')}
          >
            <LayoutDashboard className="nav-icon" size={22} />
            Dashboard
          </button>

          {/* {isMaster && (
            <button
              className={`nav-item ${isActive('/admin/ips') ? 'active' : ''}`}
              onClick={() => handleMenuItemClick('/admin/ips')}
            >
              <MapPin className="nav-icon" size={22} />
              IP de Acesso
            </button>
          )} */}

          <button
            className={`nav-item ${isActive('/admin/usuarios') ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('/admin/usuarios')}
          >
            <Users className="nav-icon" size={22} />
            Usuários APP
          </button>

          <button
            className={`nav-item ${isActive('/admin/empresas') ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('/admin/empresas')}
          >
            <Building2 className="nav-icon" size={22} />
            Empresas
          </button>

          <button
            className={`nav-item ${isActive('/admin/contato') ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('/admin/contato')}
          >
            <MessageCircleQuestion className="nav-icon" size={22} />
            Contatos
          </button>

          <button
            className={`nav-item ${isActive('/admin/avaliacoes') ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('/admin/avaliacoes')}
          >
            <Star className="nav-icon" size={22} />
            Avaliações
          </button>
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut className="nav-icon" size={22} />
          Sair
        </button>
      </aside>
    </>
  );
};

export default AdminSidebar;

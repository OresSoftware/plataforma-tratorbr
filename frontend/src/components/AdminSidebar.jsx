import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, MessageCircleQuestion, Building2, Users, User, FileText, BarChart3 } from "lucide-react";
import { getAdminAllowedPages } from '../utils/adminNavigation';
import './style/AdminSidebar.css';

const AdminSidebar = ({ menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('adminData') || '{}');
  const [avatarErrored, setAvatarErrored] = useState(false);
  const [enterpriseLogoErrored, setEnterpriseLogoErrored] = useState(false);
  const isActive = (path) => location.pathname.startsWith(path);
  const allowedPages = getAdminAllowedPages(admin);
  const displayName = [admin?.firstname || admin?.nome, admin?.lastname || admin?.sobrenome]
    .filter(Boolean)
    .join(' ') || admin?.enterprise_fantasia || 'Usuário';
  const displayEmail = admin?.email || admin?.username || 'Sem e-mail';
  const displayGroup = admin?.user_group_name || 'Grupo não informado';
  const displayEnterprise =
    admin?.enterprise_fantasia ||
    admin?.enterprise_razao ||
    'Empresa não informada';
  const displayMatrix = useMemo(() => {
    const matrixId = Number(admin?.enterprise_matriz_id || 0);
    const enterpriseId = Number(admin?.enterprise_id || 0);
    const matrixName =
      admin?.enterprise_matriz_fantasia ||
      admin?.enterprise_matriz_razao ||
      '';

    if (!matrixId || matrixId === enterpriseId || !matrixName) {
      return '';
    }

    return matrixName;
  }, [
    admin?.enterprise_id,
    admin?.enterprise_matriz_fantasia,
    admin?.enterprise_matriz_id,
    admin?.enterprise_matriz_razao,
  ]);
  const avatarUrl = useMemo(() => {
    if (!admin?.user_id || !admin?.image) return '';

    const imagePath = String(admin.image).trim();
    if (!imagePath) return '';

    return `/images/fotos/${admin.user_id}/${imagePath}`;
  }, [admin?.image, admin?.user_id]);
  const enterpriseLogoUrl = useMemo(() => {
    const logoFile = String(
      admin?.enterprise_image_logo || admin?.enterprise_image_logo_site || ''
    ).trim();

    if (!logoFile) return '';

    const onlyFile = logoFile.split('/').pop();
    if (!onlyFile) return '';

    return `/images/manufacturer/${onlyFile}`;
  }, [admin?.enterprise_image_logo, admin?.enterprise_image_logo_site]);

  useEffect(() => {
    setAvatarErrored(false);
  }, [avatarUrl]);

  useEffect(() => {
    setEnterpriseLogoErrored(false);
  }, [enterpriseLogoUrl]);

  const hasPermission = (pageKey) => {
    if (!admin) return false;
    return allowedPages.some(p => p === pageKey || p?.page_key === pageKey);
  };

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
      <button
        className={`hamburger-btn ${menuOpen ? 'menu-open' : ''}`} aria-label="Abrir menu" aria-expanded={menuOpen}
        onClick={(e) => { e.stopPropagation(); setMenuOpen(true); }}>
        <Menu size={24} />
      </button>

      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-sidebar" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
          <X size={22} />
        </button>

        <div className="sidebar-header">
          <h1>TRATORBR</h1>
          <p>Painel Administrativo</p>
        </div>

        <nav className="sidebar-nav">
          
          {hasPermission('growth') && (
            <button className={`nav-item ${isActive('/admin/growth') ? 'active' : ''}`} onClick={() => handleMenuItemClick('/admin/growth')}>
              <BarChart3 className="nav-icon" size={22} />
              Growth TratorBR
            </button>
          )}

          {hasPermission('dashboard') && (
            <button className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={() => handleMenuItemClick('/admin/dashboard')}>
              <LayoutDashboard className="nav-icon" size={22} />
              Dashboard
            </button>
          )}

          {hasPermission('usuarios') && (
            <button className={`nav-item ${isActive('/admin/avaliacoes/tabelabr') ? 'active' : ''}`} onClick={() => handleMenuItemClick('/admin/avaliacoes/tabelabr')}>
              <FileText className="nav-icon" size={22} />
              TabelaBR
            </button>
          )}

          {hasPermission('usuarios') && (
            <button className={`nav-item ${isActive('/admin/avaliacoes/checkbr') ? 'active' : ''}`} onClick={() => handleMenuItemClick('/admin/avaliacoes/checkbr')}>
              <FileText className="nav-icon" size={22} />
              CheckBR
            </button>
          )}

          {hasPermission('empresas') && (
            <button className={`nav-item ${isActive('/admin/empresas') ? 'active' : ''}`} onClick={() => handleMenuItemClick('/admin/empresas')}>
              <Building2 className="nav-icon" size={22} />
              Empresas
            </button>
          )}

          {hasPermission('usuarios') && (
            <button className={`nav-item ${isActive('/admin/usuarios') ? 'active' : ''}`} onClick={() => handleMenuItemClick('/admin/usuarios')}>
              <Users className="nav-icon" size={22} />
              Usuários
            </button>
          )}

          {hasPermission('contatos') && (
            <button className={`nav-item ${isActive('/admin/contato') ? 'active' : ''}`} onClick={() => handleMenuItemClick('/admin/contato')}>
              <MessageCircleQuestion className="nav-icon" size={22} />
              Contatos
            </button>
          )}

        </nav>

        <div className="sidebar-user-info">
          {enterpriseLogoUrl && !enterpriseLogoErrored && (
            <div className="sidebar-entity-card sidebar-company-card">
              <div className="sidebar-enterprise-logo" aria-hidden="true">
                <img
                  src={enterpriseLogoUrl}
                  alt={displayEnterprise}
                  onError={() => setEnterpriseLogoErrored(true)}
                />
              </div>
              <div className="entity-details">
                <span className="user-enterprise">{displayEnterprise}</span>
                {displayMatrix && (
                  <span className="user-matrix">Matriz: {displayMatrix}</span>
                )}
              </div>
            </div>
          )}

          {!enterpriseLogoUrl || enterpriseLogoErrored ? (
            <div className="sidebar-company-fallback">
              <span className="user-enterprise">{displayEnterprise}</span>
              {displayMatrix && (
                <span className="user-matrix">Matriz: {displayMatrix}</span>
              )}
            </div>
          ) : null}

          <div className="sidebar-entity-card sidebar-user-row">
            <div className="sidebar-user-avatar" aria-hidden="true">
              {avatarUrl && !avatarErrored ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  onError={() => setAvatarErrored(true)}
                />
              ) : (
                <User size={22} />
              )}
            </div>

            <div className="entity-details user-details">
              <span className="user-name">{displayName}</span>
              <span className="user-email">{displayEmail}</span>
              <span className="user-group">{displayGroup}</span>
            </div>
          </div>
        </div>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut className="nav-icon" size={22} />
          Sair
        </button>
      </aside>
    </>
  );
};

export default AdminSidebar;

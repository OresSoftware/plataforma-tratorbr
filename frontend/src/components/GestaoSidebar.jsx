import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User, Settings } from "lucide-react";
import { logoutUsuario } from '../services/apiUserAuth';
import './style/GestaoSidebar.css';


const GestaoSidebar = ({ menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('appUserData') || '{}');
  const isActive = (path) => location.pathname.startsWith(path);
  const [isRotating, setIsRotating] = useState(false);
  const nomeUsuario = userData?.firstname || 'Usuário';
  const empresaUsuario = userData?.enterprise_fantasia || userData?.enterprise_razao || 'Gestão';

  const construirUrlLogo = (caminhoRelativo) => {
    if (!caminhoRelativo) return '';

    if (caminhoRelativo.startsWith('http')) {
      return caminhoRelativo;
    }

    const caminho = caminhoRelativo.startsWith('/') ? caminhoRelativo : '/' + caminhoRelativo;

    return `https://app.tratorbr.com${caminho}`;
  };

  const logoEmpresa = construirUrlLogo(userData?.enterprise_image_logo_site);
  const logoRepresentada = construirUrlLogo(userData?.representada_image_logo_site);
  const fotoPerfil = construirUrlLogo(userData?.image_logo_site);
  const logosIguais = logoEmpresa === logoRepresentada;
  const mostrarLogoEmpresa = !!logoEmpresa && !logosIguais;
  const mostrarLogoRepresentada = !!logoRepresentada && !logosIguais;
  const mostrarUmaLogo = !!logoEmpresa && logosIguais;


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
    logoutUsuario();
    navigate('/entrar');
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleGoToProfile = () => {
    setIsRotating(true);

    setTimeout(() => {
      navigate('/gestao/perfil');
      setMenuOpen(false);
      setIsRotating(false);
    }, 600);
  };


  return (
    <>
      <button
        className={`hamburger-btn ${menuOpen ? 'menu-open' : ''}`} aria-label="Abrir menu" aria-expanded={menuOpen}
        onClick={(e) => { e.stopPropagation(); setMenuOpen(true); }}>
        <Menu size={24} />
      </button>

      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`gestao-sidebar ${menuOpen ? 'is-open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-sidebar" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
          <X size={22} />
        </button>

        <div className="sidebar-header">

          <button type="button" id='back' className="back-button back-button" style={{ justifyContent: 'space-between', marginBottom: '2rem', color: 'rgba(244, 244, 244, 0.81)', fontWeight: '400' }} onClick={() => navigate('/')} aria-label="Voltar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar ao Inicio
          </button>

          <div className="sidebar-headers">
            <div>
              <h1>TRATORBR</h1>
              <p>Sistema de Gestão</p>
            </div>

            <div className="sidebar-logos">
              {mostrarUmaLogo && (
                <img src={logoEmpresa} alt="Logo da Empresa" className="sidebar-logo"
                  onError={(e) => { console.error('Erro ao carregar logo:', logoEmpresa); e.target.style.display = 'none'; }} />
              )}

              {mostrarLogoEmpresa && (
                <img src={logoEmpresa} alt="Logo da Empresa" className="sidebar-logo"
                  onError={(e) => { console.error('Erro ao carregar logo:', logoEmpresa); e.target.style.display = 'none'; }} />
              )}

              {mostrarLogoRepresentada && (
                <img src={logoRepresentada} alt="Logo da Representada" className="sidebar-logo"
                  onError={(e) => { console.error('Erro ao carregar logo:', logoRepresentada); e.target.style.display = 'none'; }} />
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${isActive('/gestao') ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('/gestao')}
          >
            <LayoutDashboard className="nav-icon" size={22} />
            Dashboard
          </button>
        </nav>

        <div className="sidebar-user-section">
          <div className="sidebar-user-info">
            {fotoPerfil ? (
              <img src={fotoPerfil} alt={nomeUsuario} className="user-avatar"
                onError={(e) => { console.error('Erro ao carregar foto de perfil:', fotoPerfil); e.target.style.display = 'none'; }}
              />
            ) : (
              <User size={20} />
            )}
            <div className="user-details">
              <span className="user-username">{nomeUsuario}</span>
              <span className="user-name">{empresaUsuario}</span>
            </div>
          </div>

          <button className={`settings-button ${isRotating ? 'rotating' : ''}`} onClick={handleGoToProfile} aria-label="Ir para perfil" title="Configurações do Perfil">
            <Settings size={20} />
          </button>
        </div>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut className="nav-icon" size={22} />
          Sair
        </button>
      </aside>
    </>
  );
};


export default GestaoSidebar;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Função para lidar com o clique no botão "Quero Revender"
  const handleQueroRevender = (e) => {
    e.preventDefault(); // Impede o comportamento padrão do link
    
    const token = localStorage.getItem('token');
    
    if (token) {
      // Usuário logado - vai direto para cadastro
      navigate('/tornar-revendedor');
    } else {
      // Usuário não logado - vai para login com redirect
      navigate('/login?redirect=/tornar-revendedor');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Botão do menu móvel */}
        <button className="menu-toggle" onClick={toggleMobileMenu} aria-label="Abrir menu de navegação">
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="0" y1="6" x2="19" y2="6"></line>
              <line x1="0" y1="12" x2="30" y2="12"></line>
              <line x1="0" y1="18" x2="12" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link to="/" className="logo" aria-label="Trator BR — Início">
          <span className="logo-mark" aria-hidden="true">
            <img src="/logo-site.png" alt="Trator BR — Negócios Agrícolas" className="logo-img" />
          </span>
        </Link>

        {/* Menu de Navegação (oculto em telas pequenas) */}
        <nav className="nav-menu">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Início</Link>
          <Link to="/contato" className={`nav-link ${isActive('/contato')}`}>Contato</Link>
          {/* <Link to="/aplicativo" className={`nav-link ${isActive('/aplicativo')}`}>Aplicativo</Link> */}
          {/* O menu dropdown Tratorbr */}
          <div className="nav-dropdown">
            <button className={`nav-link dropdown-btn`}>Tratorbr
              <span className="profile-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </button>
            <div className="dropdown-menu">
              <Link to="/admin/duvidas" className="dropdown-item">Dúvidas</Link>
              <Link to="#" className="dropdown-item">Sobre Nós</Link>
            </div>
          </div>
          
        </nav>

        {/* Área de Usuário Simplificada */}
        <div className="user-area">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><img src="/footer/instagram.png" alt="Instagram" /></a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer"><img src="/footer/whatsapp.png" alt="WhatsApp" /></a>
          {/* <Link to="/admin/login" className="admin-btn">
            Área Admin
          </Link> */}
        </div>

        {/*(Mobile) */}
        <div className={`mobile-menu-container ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            {/* Logo dentro do menu lateral */}
            <Link to="/" className="logo-mobile-menu" aria-label="Trator BR — Início" onClick={toggleMobileMenu}>
              <img src="/logo-site.png" alt="Trator BR — Negócios Agrícolas" className="logo-img" />
            </Link>
            {/* Botão de fechar o menu */}
            <button className="close-menu" onClick={toggleMobileMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <nav className="mobile-nav-menu">
            <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>Início</Link>
           
            <div className="mobile-dropdown-item">
              <button className="mobile-dropdown-btn">Tratorbr</button>
              {/* O conteúdo do dropdown pode ser adicionado aqui, se necessário */}
              <Link to="/admin/duvidas" className="mobile-nav-link" onClick={toggleMobileMenu}>Dúvidas</Link>
            </div>
            <Link to="/contato" className="mobile-nav-link" onClick={toggleMobileMenu}>Contato</Link>
            
          </nav>
          <div className="mobile-menu-actions">
            <a href="https://wa.me/seunumerodetelefone" className="whatsapp-btn" target="_blank" rel="noopener noreferrer"> Fale com a gente
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <image href="/iconwhats.svg" x="2" y="2" height="20" width="20" />
              </svg>
            </a>
            <Link to="/admin/login" className="login-btn-mobile" onClick={toggleMobileMenu}>
              Área Admin
            </Link>
          </div>
        </div>
        {/* Adiciona um overlay para fechar o menu ao clicar fora dele */}
        {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>}
      </div>
    </header>
  );
};

export default Header;


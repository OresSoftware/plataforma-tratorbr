import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import CalendlyLinkHeader from "../components/CalendlyLink-header";
import './style/Header.css';

const Header = () => {
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenu();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-container">
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

        <Link to="/" className="logo" aria-label="Trator BR — Início">
          <span className="logo-mark" aria-hidden="true">
            <img src="/logo-site.png" alt="Trator BR — Negócios Agrícolas" className="logo-img" />
          </span>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => window.scrollTo(0, 0)}>Início</Link>
          <Link to="/contato" className={`nav-link ${isActive('/contato')}`} onClick={() => window.scrollTo(0, 0)}>Contato</Link>

          <div className="nav-dropdown">
            <button className={`nav-link dropdown-btn`}>Tratorbr
              <span className="profile-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </button>
            <div className="dropdown-menu">
              <Link to="/ajuda" className="dropdown-item" onClick={() => window.scrollTo(0, 0)}>Ajuda</Link>
              <Link to="/sobre-app" className="dropdown-item" onClick={() => window.scrollTo(0, 0)}>Sobre App</Link>
              <Link to="/quem-somos" className="dropdown-item" onClick={() => window.scrollTo(0, 0)}>Quem Somos</Link>
            </div>
          </div>
        </nav>

        <div className="user-area">
          <Link to="/cadastrar" className="admin-btn">
            Cadastre-se
          </Link> 

          <Link to="/entrar" id="login" className="admin-btn">
            Acessar Conta
          </Link> 

          {/* <div className="admin-btn">
            <CalendlyLinkHeader />
          </div> */}

          <div className="admin-suporte">
            <a href="https://api.whatsapp.com/send?phone=5543991895458&text=Olá,%20poderia%20me%20ajudar%20com%20o%20aplicativo?" target="_blank" rel="noopener noreferrer"><img src="/footer/suporte.png" alt="WhatsApp" />
              <span className="admin-suporte-texto">Suporte</span>
            </a>
          </div>
        </div>

        {/*MOBILE MENU */}
        <div className={`mobile-menu-container ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <Link to="/" className="logo-mobile-menu" aria-label="Trator BR — Início" onClick={toggleMobileMenu}>
              <img src="/logo-site.png" alt="Trator BR — Negócios Agrícolas" className="logo-img" />
            </Link>

            <button className="close-menu" onClick={toggleMobileMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <nav className="mobile-nav-menu">
            <Link to="/" className="mobile-nav-link" onClick={() => { toggleMobileMenu(); window.scrollTo(0, 0); }}>Início</Link>

            <div className={`mobile-dropdown-item ${open ? "active" : ""}`}>
              <button className="mobile-dropdown-btn" onClick={() => setOpen(!open)}>
                Tratorbr
                <span className={`arrow ${open ? "rotate" : ""}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color='#15383E'>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </button>

              <Link to="/ajuda" className="mobile-nav-link" onClick={() => { toggleMobileMenu(); window.scrollTo(0, 0); }}>Ajuda</Link>
              <Link to="/sobre-app" className="mobile-nav-link" onClick={() => { toggleMobileMenu(); window.scrollTo(0, 0); }}>Sobre App</Link>
              <Link to="/quem-somos" className="mobile-nav-link" onClick={() => { toggleMobileMenu(); window.scrollTo(0, 0); }}>Quem Somos</Link>
            </div>
            <Link to="/contato" className="mobile-nav-link" onClick={() => { toggleMobileMenu(); window.scrollTo(0, 0); }}>Contato</Link>

          </nav>
          <div className="mobile-menu-actions">
            {/* <Link to="/admin/login" className="login-btn-mobile" onClick={toggleMobileMenu}>
              Acessar Painel
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, verticalAlign: 'middle' }}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </Link> */}

            <div className="login-btn-mobile">
              <CalendlyLinkHeader />
            </div>

            <a href="https://wa.me/5543991895458" className="whatsapp-btn-header" target="_blank" rel="noopener noreferrer" style={{}}> Fale com a gente
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <image href="/iconwhats.svg" x="2" y="2" height="22" width="22" />
              </svg>
            </a>

          </div>
        </div>

        {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>}
      </div>
    </header>
  );
};

export default Header;


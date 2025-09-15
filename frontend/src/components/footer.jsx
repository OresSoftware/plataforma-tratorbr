import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';


const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Left Section */}
        <div className='footer-left'>
        <div className="footer-section">
          <ul className="footer-links">
            <li><Link to="/contato" onClick={() => window.scrollTo(0, 0)}>Contato</Link></li>
            <li><Link to="#" onClick={() => window.scrollTo(0, 0)}>Área do Gestor</Link></li>
            <li><Link to="/ajuda" onClick={() => window.scrollTo(0, 0)}>Central de ajuda</Link></li>
          </ul>
        </div>

        {/* Middle-Left Section */}
        <div className="footer-section-dois">
          <ul className="footer-links">
            <li><Link to="/" onClick={() => window.scrollTo(0, 0)}>APP</Link></li>
            <li><Link to="/excluir-conta" onClick={() => window.scrollTo(0, 0)}>Excluir Conta</Link></li>
            <li><Link to="/sobre-nos" onClick={() => window.scrollTo(0, 0)}>Sobre a TratorBR</Link></li>
          </ul>
        </div>
        </div>
        
        
        {/* Center Section */}
        <div className="footer-center">
          <img src= "/footer/footer-logo.png" alt="TratorBR Logo" className="tratorbr-logo" />
          <div className='separacao'></div>
          <div className="social-media">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><img src="/footer/linkedin.png" alt="LinkedIn" /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><img src="/footer/facebook.png" alt="Facebook" /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><img src="/footer/instagram.png" alt="Instagram" /></a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer"><img src="/footer/whatsapp.png" alt="WhatsApp" /></a>
          </div>
        </div>

        {/* Right Section */}
        <div className="footer-right">
          <h4 className="app-title">Baixe nosso aplicativo</h4>
          <div className="app-buttons">
            <a href="#ios-app" className="app-button">
              <img src= "/imagens-aplicativo/baixar-apple.png" alt="iOS" />
            </a>
            <a href="#android-app" className="app-button">
              <img src= "/imagens-aplicativo/baixar-android.png" alt="Android" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>Copyright © 2025. Todos os direitos reservados para TratorBR</p>
        <span>•</span>
        <Link to="/politica-privacidade" onClick={() => window.scrollTo(0, 0)}>Privacidade</Link>
        <span>•</span>
        <Link to="/termos-uso" onClick={() => window.scrollTo(0, 0)}>Termos</Link>
      </div>
    </footer>
  );
};

export default Footer;
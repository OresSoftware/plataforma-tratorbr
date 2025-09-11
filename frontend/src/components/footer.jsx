import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';


const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Left Section */}
        <div className="footer-section">
          <ul className="footer-links">
            <li><Link to="/contato">Contato</Link></li>
            <li><Link to="#">Área do Gestor</Link></li>
            <li><Link to="/admin/duvidas">Central de ajuda</Link></li>
          </ul>
        </div>

        {/* Middle-Left Section */}
        <div className="footer-section-dois">
          <ul className="footer-links">
            <li><Link to="/">APP</Link></li>
            <li><Link to="/admin/duvidas">Dúvidas</Link></li>
            <li><Link to="/">Sobre a TratorBR</Link></li>
          </ul>
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
        <Link to="/termos-uso">Termos de Uso - Politicas</Link>
      </div>
    </footer>
  );
};

export default Footer;
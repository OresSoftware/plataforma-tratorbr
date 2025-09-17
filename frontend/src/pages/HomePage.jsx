import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/footer';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <main className="home-content">
        <div className="hero-section">
          <h1>TratorBR</h1>
          <p>Sistema simplificado para informações e contato</p>
          
          <div className="navigation-cards">
            <Link to="/aplicativo" className="nav-card">
              <h3>Aplicativo</h3>
              <p>Informações sobre o aplicativo TratorBR</p>
            </Link>
            
            <Link to="/contato" className="nav-card">
              <h3>Contato</h3>
              <p>Entre em contato conosco</p>
            </Link>
            
            <Link to="/admin/duvidas" className="nav-card">
              <h3>Dúvidas</h3>
              <p>Perguntas frequentes</p>
            </Link>
          </div>
          
          <div className="footer-links">
            <Link to="/termos-uso">Termos de Uso</Link>
            <Link to="/politica-privacidade">Política de Privacidade</Link>
            <Link to="/admin/login">Área Administrativa</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;


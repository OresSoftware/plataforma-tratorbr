import React from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import './style/footer.css';


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const adminAreaUrl =
    window.location.hostname === 'tratorbr.com'
      ? 'https://tratorbr.com/admin'
      : 'https://tratorbradmin.oressoftware.com/admin';

  return (
    <footer className="footer-container">
      <div className="footer-content">

        {/* Left Section */}
        <div className='footer-left'>
          <div className="footer-section">
            <ul className="footer-links">
              <li className='footer-titulo'>Empresa</li>
              <li><Link to="/contato#contato" onClick={() => window.scrollTo(0, 0)}>Contato</Link></li>
              <li><Link to="/quem-somos" onClick={() => window.scrollTo(0, 0)}>Sobre nós</Link></li>
              {/* <li><Link to="/excluir-conta" onClick={() => window.scrollTo(0, 0)}>Excluir Conta</Link></li> */}
              {/* <li><Link to="#" onClick={() => window.scrollTo(0, 0)}>Área do Gestor</Link></li> */}
              <li><Link to="/ajuda" onClick={() => window.scrollTo(0, 0)}>Central de ajuda</Link></li>
              <li>
                <a href={adminAreaUrl} target="_blank" rel="noopener noreferrer">Painel Administrativo</a>
              </li>
            </ul>
          </div>

          {/* Middle-Left Section */}
          <div className="footer-section-dois">
            <ul className="footer-links">
              <li className='footer-titulo'>Recursos</li>
              <li><Link to="/sobre-app" onClick={() => window.scrollTo(0, 0)}>Sobre o App</Link></li>
              <li><Link to="/planos-creditos" onClick={() => window.scrollTo(0, 0)}>Planos e Créditos</Link></li>
              <li><Link smooth to="/#app-contato">Baixar o aplicativo</Link></li>
              <li><Link to="/#agendamento" onClick={() => window.scrollTo(0, 0)}>Agendar Demonstração</Link></li>
            </ul>
          </div>
        </div>


        {/* Center Section */}
        <div className="footer-center">
          <img src="/footer/footer-logo.png" alt="TratorBR Logo" className="tratorbr-logo" />
          <div className='separacao'></div>
          <div className="social-media">
            <a href="https://www.linkedin.com/company/trator-br/posts/?feedView=all" target="_blank" rel="noopener noreferrer"><img src="/footer/linkedin.png" alt="LinkedIn" /></a>
            {/* <a href="https://www.facebook.com/profile.php?id=61569540673369&locale=pt_BR" target="_blank" rel="noopener noreferrer"><img src="/footer/facebook.png" alt="Facebook" /></a> */}
            <a href="https://www.instagram.com/tratorbr.oficial/" target="_blank" rel="noopener noreferrer"><img src="/footer/instagram.png" alt="Instagram" /></a>
            <a href="https://api.whatsapp.com/send?phone=5543991895458&text=Olá,%20poderia%20me%20ajudar?" target="_blank" rel="noopener noreferrer"><img src="/footer/whatsapp.png" alt="WhatsApp" /></a>
          </div>
        </div>

        {/* Right Section */}
        <div className="footer-right">
          <h4 className="app-title">Baixe nosso aplicativo</h4>
          <div className="app-buttons">
            <a href="https://apps.apple.com/br/app/tratorbr/id6748466764" className="app-button" target='_blank' rel='external'>
              <img style={{ opacity: 1 }} src="/imagens-aplicativo/baixar-apple.png" alt="iOS" />
            </a>
            <a href="https://play.google.com/store/apps/details?id=br.com.tratorbr.TratorBR&pcampaignid=web_share" className="app-button" target='_blank' rel='external'>
              <img src="/imagens-aplicativo/baixar-android.png" alt="Android" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>{`Copyright © ${currentYear}. Todos os direitos reservados ao TratorBR`}</p>
        <span>•</span>
        <Link to="/politicasdeprivacidade.html" onClick={() => window.scrollTo(0, 0)}>Termos e Políticas</Link>
      </div>
    </footer>
  );
};

export default Footer;

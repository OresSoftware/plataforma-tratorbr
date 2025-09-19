import React from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';
import WhatsappFlutuante from '../components/WhatsappFlutuante';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import './SobreNosPage.css';

const SobreNosPage = () => {
  return (
    <div className="sobre-nos-page">
      <Header />

      {/* Hero Section */}
      <section className="hero-section-sobre">
        <div className="hero-container-sobre">
          <div className="hero-content-sobre">
            <h1 className="hero-title-sobre">Sobre a TratorBR</h1>
            <p className="hero-description-sobre">
              A TratorBR é a mais completa plataforma de negócios voltada ao agronegócio, especializada em soluções digitais para máquinas agrícolas. Unimos tecnologia, inovação e confiabilidade para conectar marcas, concessionários, revendedores, leiloeiras e agricultores em um só lugar.
            </p>
          </div>
          <div className="hero-visual-sobre">
            <div className="hero-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3>Inovação</h3>
              <p>Tecnologia de ponta para o campo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="historia-section">
        <div className="container-sobre">
          <div className="content-grid">
            <div className="visual-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Produtores Atendidos</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">50k+</div>
                  <div className="stat-label">Hectares Gerenciados</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Suporte Disponível</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">99%</div>
                  <div className="stat-label">Satisfação dos Clientes</div>
                </div>
              </div>
            </div>
            <div className="text-content">
              <h2 className="section-title">Nossa História</h2>
              <p className="section-description">
                Fundada com o propósito de transformar a forma como o mercado de máquinas agrícolas se conecta, a TratorBR nasceu para simplificar processos e criar oportunidades reais de negócios. Desde o início, nossa jornada foi pautada pela inovação e pela credibilidade.
              </p>
              <p className="section-description">
                Com foco em desenvolver soluções acessíveis e tecnológicas, reunimos informações, dados e recursos que auxiliam agricultores, concessionários e revendedores a tomar decisões seguras e estratégicas. Nossa história é marcada pelo compromisso em unir pessoas e marcas, viabilizando negócios de forma ágil e confiável.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="valores-section">
        <div className="container-sobre">
          <h2 className="section-title-center">Nossos Pilares</h2>
          <div className="valores-grid">
            <div className="valor-card">
              <div className="valor-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3 className="valor-title">Missão</h3>
              <p className="valor-description">
                Democratizar o acesso à tecnologia no agronegócio, oferecendo
                ferramentas simples e eficazes para otimizar a gestão rural.
              </p>
            </div>
            <div className="valor-card">
              <div className="valor-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="valor-title">Visão</h3>
              <p className="valor-description">
                Ser a principal plataforma de gestão agrícola do Brasil,
                conectando tecnologia e tradição rural.
              </p>
            </div>
            <div className="valor-card">
              <div className="valor-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </div>
              <h3 className="valor-title">Valores</h3>
              <p className="valor-description">
                Inovação, simplicidade, confiabilidade e compromisso com
                o desenvolvimento sustentável do agronegócio brasileiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais - ORDEM MODIFICADA PARA MOBILE */}
      <section className="diferenciais-section">
        <div className="container-sobre">
          <div className="content-grid-reverse">
            {/* TEXTO MOVIDO PARA PRIMEIRO - aparecerá antes dos ícones no mobile */}
            <div className="text-content">
              <h2 className="section-title">Por que escolher a TratorBR?</h2>
              <p className="section-description">
                A TratorBR se destaca por oferecer uma plataforma tecnológica completa, que vai além das transações: entregamos acesso a dados, análises, ferramentas e soluções que fortalecem toda a cadeia do agronegócio. Nossos produtos foram desenvolvidos para atender diferentes perfis de clientes, de agricultores a grandes concessionárias.
              </p>
              <p className="section-description">
                Combinamos inovação, segurança e agilidade em um ambiente digital confiável. Ao escolher a TratorBR, você garante suporte especializado e parcerias que geram valor, conectando oportunidades e viabilizando negócios de forma prática e eficiente.
              </p>
            </div>
            {/* ÍCONES AGORA VÊM DEPOIS NO HTML */}
            <div className="visual-content-diferenciais">
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h4>Interface Intuitiva</h4>
                    <p>Design pensado para facilitar o uso no campo</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h4>Tecnologia em Nuvem</h4>
                    <p>Acesse seus dados de qualquer lugar</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <circle cx="12" cy="16" r="1" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h4>Segurança Total</h4>
                    <p>Seus dados protegidos com criptografia avançada</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h4>Relatórios Inteligentes</h4>
                    <p>Insights valiosos para tomada de decisão</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container-sobre">
          <div className="cta-content">
            <h2 className="cta-title">Pronto para revolucionar sua gestão rural?</h2>
            <p className="cta-description">
              Junte-se a centenas de produtores que já transformaram
              sua gestão com a TratorBR.
            </p>
            <div className="cta-buttons">
              <Link to="/#recursos" className='btn-primary'>
                Conhecer APP
              </Link>
              <a href="/contato" className="btn-secondary">
                Falar Conosco
              </a>
            </div>
          </div>
        </div>
      </section>
      <WhatsappFlutuante />
      <VoltarAoTopoBtn />
      <Footer />
    </div>
  );
};

export default SobreNosPage;


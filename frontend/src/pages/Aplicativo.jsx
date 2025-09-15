import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import { obterPlanos, gerarUrlWhatsApp, prepararDadosPagamento } from '../services/planosService';
import './Aplicativo.css';
import appIphone from '/imagens-aplicativo/baixar-android.png';
import appAndroid from '/imagens-aplicativo/baixar-apple.png';
import iphone01 from '/imagens-aplicativo/iphone15-01.png';
import iphone02 from '/imagens-aplicativo/iphone15-02.png';
import iphone03 from '/imagens-aplicativo/iphone-03.png';
import imgApp from '/imagens-aplicativo/imagem-app.png';
import ano from '/imagens-aplicativo/01.png';
import avaliador from '/imagens-aplicativo/02.png';
import checklist from '/imagens-aplicativo/03-1.png';
import off from '/imagens-aplicativo/03.png';
import img_um from '/imagens-aplicativo/img1.png';
import img_dois from '/imagens-aplicativo/img2.png';
import iph15 from '/imagens-aplicativo/iph15.png';
import WhatsappFlutuante from '../components/WhatsappFlutuante';


const PlanosPage = () => {
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [faqAberto, setFaqAberto] = useState(null);


  const planos = obterPlanos();

  const handleAssinarPlano = (plano) => {
    setPlanoSelecionado(plano);
    setMostrarFormulario(true);
  };

  const handleEnviarWhatsApp = () => {
    if (!planoSelecionado) return;

    const url = gerarUrlWhatsApp(planoSelecionado, dadosUsuario);
    window.open(url, '_blank');

    // Fechar formulário após envio
    setMostrarFormulario(false);
    setDadosUsuario({ nome: '', email: '', telefone: '' });
    setPlanoSelecionado(null);
  };

  const handleAssinarDireto = (plano) => {
    // Para assinatura direta sem formulário (dados mínimos)
    const url = gerarUrlWhatsApp(plano);
    window.open(url, '_blank');
  };

  const handleFecharFormulario = () => {
    setMostrarFormulario(false);
    setPlanoSelecionado(null);
    setDadosUsuario({ nome: '', email: '', telefone: '' });
  };

  const toggleFaq = (index) => {
    setFaqAberto(faqAberto === index ? null : index);
  };

  const faqData = [
    {
      pergunta: "Como funciona o sistema de avaliação de máquinas?",
      resposta: "Nosso sistema utiliza tecnologia avançada para avaliar de forma eficiente o valor da sua máquina. Útil para o concessionário que precisa receber um usado na venda de um novo, e útil para o produtor que precisa comprar um maquinário novo."
    },
    {
      pergunta: "O app funciona sem internet?",
      resposta: "Sim! O app da TratorBR funciona também offline, permitindo que você registre dados, acompanhe atividades e gerencie sua operação mesmo sem internet. Quando o sinal voltar, tudo se sincroniza automaticamente."
    },
    {
      pergunta: "Quais máquinas estão no banco de dados?",
      resposta: "Nosso Banco de Dados é o maior e mais completo do Brasil, contendo praticamente todas as marcas e modelos de máquinas agrícolas comercializadas no Brasil."
    },
    {
      pergunta: "Como posso cancelar minha assinatura?",
      resposta: "Você pode cancelar sua assinatura a qualquer momento entrando em contato conosco via WhatsApp ou email. Não há taxas de cancelamento e o processo é simples e rápido."
    },
    {
      pergunta: "Há suporte técnico disponível?",
      resposta: "Sim, oferecemos suporte técnico completo para todos os nossos usuários. Nossa equipe está disponível via WhatsApp, email e telefone para ajudar com qualquer dúvida ou problema técnico."
    }
  ];

  return (
    <div className="planos-page">
      <Header />

      {/* Hero Section */}
      <section className="section-trator">
        <div className="text-content">
          <div className="logo-container">
            <img src={imgApp} alt="Logo Trator BR" />
            <h1>TratorBR</h1>
          </div>

          <h2>Conectando o campo à tecnologia</h2>

          <p>Com o app TratorBR, agricultores e concessionários ganham uma nova{" "}<br />forma de se conectar, negociar, e gerenciar suas máquinas com <br />eficiência e agilidade. Tudo na palma da mão.</p>

          <div className='botoesApp'>
          <button className='entrarGestor'><img src="" alt="" />Entrar</button>
          <button className='suporteApp'>Suporte</button>
          </div>
        </div>

        <div className="phones">
          <img src={iph15} alt="Tela App TratorBR Web" />
        </div>
      </section>

      {/* Download Section */}
      <section className="download-section">
        <div className="download-container">
          <h2 className="download-title">BAIXE AGORA</h2>
          <p className="download-subtitle">Clique e baixe nas principais lojas.</p>
          <div className="download-buttons">
            <a href="https://play.google.com/store/apps/details?id=br.com.tratorbr.TratorBR&pcampaignid=web_share" className="download-btn google-play" target='_blank' rel='external'>
              <img src={appIphone} alt="Baixar no Google Play" />
            </a>
            <a href="#" className="download-btn app-store">
              <img src={appAndroid} alt="Baixar na App Store" />
            </a>
          </div>
        </div>
      </section>
      <img src={iphone02} alt="TratorBR App" className="phone-app-image" />

      {/* Recursos Section */}
      <section className="recursos-section">
        <div className="recursos-container">
          <h2 className="recursos-title">RECURSOS</h2>
          <div className='divsoria'></div>
          <div className="recursos-grid-figma">
            <div className="recurso-card-figma">
              <div className="recurso-icon-figma">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#15383E" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="recurso-titulo-figma">Descubra o Ano</h3>
              <p className="recurso-texto-figma">
                A solução para quem tem dúvidas sobre o ano de fabricação da sua máquina de trabalho.
              </p>
            </div>

            <div className="recurso-card-figma">
              <div className="recurso-icon-figma">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L9 7V9C9 10.1 9.9 11 11 11V13H13V11C14.1 11 15 10.1 15 9H21ZM12 13.5C7 13.5 2.73 16.39 2 21H22C21.27 16.39 17 13.5 12 13.5Z" fill="#15383E"/>
                </svg>
              </div>
              <h3 className="recurso-titulo-figma">Avaliações Precisas</h3>
              <p className="recurso-texto-figma">
                Tecnologia que avalia sua máquina com eficiência e o valor que ela merece.
              </p>
            </div>

            <div className="recurso-card-figma">
              <div className="recurso-icon-figma">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C7.58 3 4 4.79 4 7V17C4 19.21 7.58 21 12 21S20 19.21 20 17V7C20 4.79 16.42 3 12 3ZM18 17C18 17.5 15.87 19 12 19S6 17.5 6 17V14.77C7.61 15.55 9.72 16 12 16S16.39 15.55 18 14.77V17ZM18 12.45C16.7 13.4 14.42 14 12 14C9.58 14 7.3 13.4 6 12.45V9.64C7.47 10.47 9.61 11 12 11C14.39 11 16.53 10.47 18 9.64V12.45ZM12 9C8.13 9 6 7.5 6 7S8.13 5 12 5S18 6.5 18 7S15.87 9 12 9Z" fill="#15383E"/>
                </svg>
              </div>
              <h3 className="recurso-titulo-figma">Maior Banco de Dados</h3>
              <p className="recurso-texto-figma">
                O maior e mais completo do Brasil, reunindo praticamente todas as marcas e modelos de máquinas agrícolas.
              </p>
            </div>

            <div className="recurso-card-figma">
              <div className="recurso-icon-figma">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 9L12 2L23 9L12 16L1 9Z" stroke="#15383E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 16L12 23L23 16" stroke="#15383E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 12L12 19L23 12" stroke="#15383E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="recurso-titulo-figma">Maior Banco de Dados</h3>
              <p className="recurso-texto-figma">
                O maior e mais completo do Brasil, reunindo praticamente todas as marcas e modelos de máquinas agrícolas.
              </p>
            </div>

            <div className="recurso-card-figma">
              <div className="recurso-icon-figma">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#15383E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="#15383E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="recurso-titulo-figma">Plataforma Segura</h3>
              <p className="recurso-texto-figma">
                Seus dados estão sempre protegidos com segurança e confiabilidade.
              </p>
            </div>

            <div className="recurso-card-figma">
              <div className="recurso-icon-figma">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#15383E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="recurso-titulo-figma">Suporte Especializado</h3>
              <p className="recurso-texto-figma">
                Acesso a especialistas em máquinas agrícolas para tirar dúvidas e orientações.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section className="planos-section">
        <div className="planos-container">
          <h2 className="planos-title">PLANOS</h2>
          <div className="planos-grid">
            {planos.map((plano) => (
              <div key={plano.id} className={`plano-card ${plano.popular ? 'plano-popular' : ''}`}>
                {plano.popular && <div className="popular-badge">Popular</div>}
                <h3 className="plano-titulo">{plano.titulo}</h3>
                <div className="plano-preco">
                  <span className="preco-valor">R${plano.preco}</span>
                  <span className="preco-periodo">/{plano.duracao}</span>
                </div>
                <ul className="plano-caracteristicas">
                  {plano.caracteristicas.map((caracteristica, index) => (
                    <li key={index}>{caracteristica}</li>
                  ))}
                </ul>
                <button
                  className="plano-btn"
                  onClick={() => handleAssinarPlano(plano)}
                >
                  Assinar Agora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Context Images Section */}
      <section className="context-section">
        <div className="context-container">
          <div className="context-grid">
            <div className="context-item">
              <img src={img_um} alt="Trator no campo" className="context-image" />
              <div className="context-overlay">
                <p>Conectamos o melhor preço e qualidade, gerencia suas análises
                  de um só lugar e ainda te dá a certeza de todas as informações do seu estoque no
                  campo.</p>
                <button className="context-btn">Saiba mais</button>
              </div>
            </div>
            <div className="context-item">
              <img src={img_dois} alt="Agricultor trabalhando" className="context-image" />
              <div className="context-overlay">
                <p>Venda suas máquinas no preço de mercado, encontre
                  concessionários perto de você e negocie com segurança direto no
                  app.</p>
                <button className="context-btn">Saiba mais</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - IGUAL À PÁGINA DE AJUDA */}
      <section className="faq-section">
        <div className="faq-container">
          <h2 className="faq-title">DÚVIDAS FREQUENTES</h2>
          <div className='divsoria'></div>
          <div className="faq-grid-ajuda">
            {faqData.map((item, index) => (
              <div key={index} className="faq-card-ajuda">
                <button 
                  className={`faq-question-ajuda ${faqAberto === index ? 'active' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="faq-question-text-ajuda">{item.pergunta}</span>
                  <span className={`faq-icon-ajuda ${faqAberto === index ? 'rotated' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </button>
                
                {/* Introdução - só aparece quando fechado */}
                <div className={`faq-intro-ajuda ${faqAberto === index ? 'hidden' : 'visible'}`}>
                  <p>{item.resposta.substring(0, 120)}...</p>
                </div>
                
                {/* Resposta detalhada - só aparece quando aberto */}
                <div className={`faq-answer-ajuda ${faqAberto === index ? 'open' : ''}`}>
                  <div className="faq-answer-content-ajuda">
                    <p>{item.resposta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-section-ajuda">
            <div className="contact-horizontal-ajuda">
              <div className="contact-text-ajuda">
                <h2>Você está com alguma dúvida que não foi sanada em cima?</h2>
                <p>Nosso time de especialistas está pronto para te atender.</p>
              </div>
              <a href="https://wa.me/5543999999999" className="whatsapp-btn-ajuda" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z"/>
                </svg>
                Fale com a gente
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer App Section */}
      <section className="footer-app-section">
        <div className="footer-app-container">
          <div className="footer-app-content">
            <h2 className="footer-app-title">TratorBR - APP</h2>
            <p className="footer-app-description">
              Baixe agora e venha viver essa experiência
              junto com a gente!!!
            </p>
            <div className="footer-app-features">
              <div className="feature-item">✅ Série e Ano</div>
              <div className="feature-item">✅ Avaliador</div>
              <div className="feature-item">✅ Maior Banco de Dados</div>
              <div className="feature-item">✅ Online & Offline</div>
            </div>
            <div className="footer-app-buttons">
              <button className="footer-btn ios">Baixar para iOS</button>
              <button className="footer-btn android">Baixar para Android</button>
            </div>
          </div>
          <div className="footer-app-phone">
            <img src={iphone03} alt="TratorBR App" className="footer-phone-image" />
          </div>
        </div>
      </section>

      {/* Modal de Formulário */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Finalizar Assinatura</h3>
              <button className="modal-close" onClick={handleFecharFormulario}>×</button>
            </div>

            {planoSelecionado && (
              <div className="plano-resumo">
                <h4>Plano Selecionado: {planoSelecionado.titulo}</h4>
                <p>Valor: R$ {planoSelecionado.preco} / {planoSelecionado.duracao}</p>
              </div>
            )}

            <form className="formulario-dados" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <input
                  type="text"
                  id="nome"
                  value={dadosUsuario.nome}
                  onChange={(e) => setDadosUsuario({ ...dadosUsuario, nome: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={dadosUsuario.email}
                  onChange={(e) => setDadosUsuario({ ...dadosUsuario, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  value={dadosUsuario.telefone}
                  onChange={(e) => setDadosUsuario({ ...dadosUsuario, telefone: e.target.value })}
                  placeholder="(43) 99999-9999"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={handleFecharFormulario}>
                  Cancelar
                </button>
                <button type="button" className="btn-whatsapp" onClick={handleEnviarWhatsApp}>
                  <span className="whatsapp-icon">💬</span>
                  Continuar no WhatsApp
                </button>
              </div>

              <div className="form-info">
                <p>Seus dados serão enviados via WhatsApp para finalizar a assinatura com nossa equipe.</p>
              </div>
            </form>
          </div>
        </div>
        
      )}
      <WhatsappFlutuante />
      <Footer />
    </div>
  );
};

export default PlanosPage;
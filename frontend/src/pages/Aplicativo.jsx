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
          <div className="recursos-grid">
            <div className="recurso-card recurso-dark">
              <div className="recurso-icon"><img src={ano} alt="icon" /></div>
              <p>
                Descubra aquilo que sempre te gerou dúvida. "É uma solução para
                você que não tem total certeza do ano do seu bem mais precioso, sua
                máquina de trabalho, você que na hora de comercializar tem
                dificuldade de saber a data exata da fabricação. Temos a solução para o seu problema!"
              </p>
            </div>
            <div className="recurso-card recurso-light">
              <div className="recurso-icon"><img src={avaliador} alt="icon" /></div>
              <p>
                Qualidade e assertividade - "Tecnologia usada para
                avaliar de forma eficiente o valor da sua máquina. Útil
                para o concessionário que precisa receber um usado
                na venda de um novo, e útil para o produtor que
                precisa comprar um maquinário novo. Avaliamos o
                seu maquinário com o devido valor que ele merece!"
              </p>
            </div>
            <div className="recurso-card recurso-light-last">
              <div className="recurso-icon"><img src={checklist} alt="icon" /></div>
              <p>
                "Nosso Banco de Dados é o maior e mais completo
                do Brasil, contendo praticamente todas as marcas
                e modelos de máquinas agrícolas comercializadas no Brasil."
              </p>
            </div>
            <div className="recurso-card recurso-dark">
              <div className="recurso-icon"><img src={off} alt="icon" /></div>
              <p>
                Funciona até onde o sinal não chega - "Na lavoura,
                conexão nem sempre é garantida. Por isso, o app da
                TratorBR funciona também offline, permitindo que
                você registre dados, acompanhe atividades e
                gerencie sua operação mesmo sem internet. Quando o sinal voltar,
                tudo se sincroniza automaticamente. Produtividade sem interrupções
                — com ou sem Wi-Fi."
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

      {/* FAQ Section - INTERATIVO COMO NAS IMAGENS */}
      <section className="faq-section animate-fade-in">
        <div className="faq-container">
          <h2 className="faq-title animate-slide-up">DÚVIDAS FREQUENTES</h2>
          <div className="faq-list">
            {faqData.map((item, index) => (
              <div key={index} className={`faq-item animate-slide-up-staggered-${index}`}>
                <button
                  className={`faq-question ${faqAberto === index ? 'active' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  {item.pergunta}
                  <span className={`faq-icon ${faqAberto === index ? 'rotated' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </button>
                <div className={`faq-answer ${faqAberto === index ? 'open' : ''}`}>
                  <div className="faq-answer-content">
                    <p>{item.resposta}</p>
                  </div>
                </div>
              </div>
            ))}
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
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import { obterPlanos, gerarUrlWhatsApp, prepararDadosPagamento } from '../services/planosService';
import appIphone from '/imagens-aplicativo/baixar-android.png';
import appAndroid from '/imagens-aplicativo/baixar-apple.png';
import iphone02 from '/imagens-aplicativo/iphone15-02.png';
import imgApp from '/imagens-aplicativo/imagem-app.png';
import img_um from '/imagens-aplicativo/img1.png';
import img_dois from '/imagens-aplicativo/img2.png';
import iph15 from '/imagens-aplicativo/iph15.png';
import WhatsappFlutuante from '../components/WhatsappFlutuante';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import { WifiOff } from "lucide-react";
import iph03 from '/imagens-aplicativo/iphone-03.png';
import qrcode from '/imagens-aplicativo/qr-code.png';
import './style/Aplicativo.css';


const PlanosPage = () => {
  const [dadosUsuario, setDadosUsuario] = useState({ nome: '', email: '', telefone: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [faqAberto, setFaqAberto] = useState(null);

  const planos = obterPlanos();

  // Bloquear scroll do fundo
  useEffect(() => {
    if (mostrarFormulario) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mostrarFormulario]);

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
    }
  ];

  const SearchIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const MoneyIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12L11 14L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const SupportIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9H15M9 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );


  return (
    <div className="planos-page">
      <div className='header'>
        <Header />
      </div>
      <div className='content'>
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
              <button className='entrarGestor'><img src="" alt="" />Acessar Painel</button>

              <a href="https://api.whatsapp.com/send?phone=5543991895458&text=Olá,%20preciso%20de%20suporte%20na%20plataforma%20de%20gestão." target="_blank" rel="noopener noreferrer"><button className='suporteApp'>Suporte</button></a>
            </div>
          </div>
          <div className="phones">
            <img src={iph15} alt="Tela App TratorBR Web" />
          </div>
        </section>
        {/* Download Section */}
        <section>
          <div className="fundoloja">
            <h1>Baixe agora</h1>
            <p>Clique e baixe nas principais lojas.</p>
            <div className="imgsloja">
              <a href="https://play.google.com/store/apps/details?id=br.com.tratorbr.TratorBR&pcampaignid=web_share" className="download-btn google-play" target='_blank' rel='external'>
                <img src={appIphone} alt="Baixar no Google Play" />
              </a>
              <a href="#" className="download-btn app-store">
                <img style={{ opacity: 0.5 }} src={appAndroid} alt="Baixar na App Store" />
              </a>
            </div>
            <img
              src={iphone02}
              alt="iPhone com aplicativo"
              className="iphoneloja"
            />
          </div>
        </section>
        {/* Recursos Section */}
        <section className="recursos-section">
          <div className="recursos-container">
            <h2 className="recursos-title">RECURSOS</h2>
            <div className='divsoria'></div>
            <div className="recursos-grid-figma">
              <div className="recurso-card-figma" id='recurso-card-1'>
                <div className="recurso-icon-figma">
                  <SearchIcon />
                </div>
                <h3 className="recurso-titulo-figma">Descubra o Ano</h3>
                <p className="recurso-texto-figma">
                  A solução para quem tem dúvidas sobre o ano de fabricação da sua máquina de trabalho.
                </p>
              </div>
              <div className="recurso-card-figma" id='recurso-card-2'>
                <div className="recurso-icon-figma">
                  <MoneyIcon />
                </div>
                <h3 className="recurso-titulo-figma">Avaliações Precisas</h3>
                <p className="recurso-texto-figma">
                  Tecnologia que avalia sua máquina com eficiência e o valor que ela merece.
                </p>
              </div>
              <div className="recurso-card-figma" id='recurso-card-3'>
                <div className="recurso-icon-figma">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3C7.58 3 4 4.79 4 7V17C4 19.21 7.58 21 12 21S20 19.21 20 17V7C20 4.79 16.42 3 12 3ZM18 17C18 17.5 15.87 19 12 19S6 17.5 6 17V14.77C7.61 15.55 9.72 16 12 16S16.39 15.55 18 14.77V17ZM18 12.45C16.7 13.4 14.42 14 12 14C9.58 14 7.3 13.4 6 12.45V9.64C7.47 10.47 9.61 11 12 11C14.39 11 16.53 10.47 18 9.64V12.45ZM12 9C8.13 9 6 7.5 6 7S8.13 5 12 5S18 6.5 18 7S15.87 9 12 9Z" fill="#15383E" />
                  </svg>
                </div>
                <h3 className="recurso-titulo-figma">Maior Banco de Dados</h3>
                <p className="recurso-texto-figma">
                  O maior e mais completo do Brasil, reunindo praticamente todas as marcas e modelos de máquinas agrícolas.
                </p>
              </div>
              <div className="recurso-card-figma" id='recurso-card-4'>
                <div className="recurso-icon-figma">
                  <WifiOff size={46} />
                </div>
                <h3 className="recurso-titulo-figma">On e Off</h3>
                <p className="recurso-texto-figma">
                  O app da TratorBR funciona também offline, garantindo produtividade mesmo sem internet.
                </p>
              </div>
              <div className="recurso-card-figma" id='recurso-card-5'>
                <div className="recurso-icon-figma">
                  <ShieldIcon />
                </div>
                <h3 className="recurso-titulo-figma">Plataforma Segura</h3>
                <p className="recurso-texto-figma">
                  Seus dados estão sempre protegidos com segurança e confiabilidade.
                </p>
              </div>
              <div className="recurso-card-figma" id='recurso-card-6'>
                <div className="recurso-icon-figma">
                  <SupportIcon />
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
            <div className='divsoria' id='planos'></div>
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
                <a href="https://api.whatsapp.com/send?phone=5543991895458&text=Olá,%20poderia%20me%20ajudar?" className="whatsapp-btn-ajuda" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z" />
                  </svg>
                  Fale com a gente
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* <img src={iph03} alt="teste" className='ipho03'/> */}
        <section className="download-section-dois">
          <img src={iph03} alt="teste" className='ipho03' />
          <div className='download-container-dois'>
            <h2 className="title">Escaneie ou clique para baixar</h2>
            <div className="cards">
              <a href="https://play.google.com/store/apps/details?id=br.com.tratorbr.TratorBR&pcampaignid=web_share" target="_blank" rel="external" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <img src={qrcode} alt="play store" className="qr-code" />
                  <div>
                    <h3>Baixe o app na Play Store</h3>
                    <p>Escaneie para baixar</p>
                  </div>
                  <span className="arrow-s">→</span>
                </div>
              </a>
              <a href="" target="_blank" rel="external" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <img src={qrcode} alt="QR Code Parceiro" className="qr-code" />
                  <div>
                    <h3>Baixe o app na Apple Store</h3>
                    <p>Escaneie para baixar</p>
                  </div>
                  <span className="arrow-s">→</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        
        {/* Modal de Formulário */}
        {mostrarFormulario && (
          <div className="modal-overlay" onClick={handleFecharFormulario}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

                  <a href="https://api.whatsapp.com/send?phone=5543991895458&text=Olá,%20poderia%20me%20ajudar?" className="whatsapp-btn-ajuda" target="_blank" rel="noopener noreferrer" onClick={handleEnviarWhatsApp}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z" />
                    </svg>
                    Fale com a gente
                  </a>

                </div>
                <div className="form-info">
                  <p>Seus dados serão enviados via WhatsApp para finalizar a assinatura com nossa equipe.</p>
                </div>
              </form>
            </div>
          </div>
        )}
          </div>
          <WhatsappFlutuante />
          <VoltarAoTopoBtn />
          <Footer />
      </div>

  );
};

export default PlanosPage;
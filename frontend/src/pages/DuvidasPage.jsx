import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import './DuvidasPage.css';

const DuvidasPage = () => {
  const [faqAberto, setFaqAberto] = useState(null);

  const toggleFaq = (index) => {
    setFaqAberto(faqAberto === index ? null : index);
  };

  const faqData = [
    {
      pergunta: "O que é o TratorBR?",
      resposta: "O TratorBR é uma plataforma digital especializada em conectar pessoas do agronegócio, facilitando a compra, venda e avaliação de máquinas agrícolas com tecnologia e segurança."
    },
    {
      pergunta: "Como posso entrar em contato?",
      resposta: "Você pode entrar em contato conosco através da página de contato do site, enviando um e-mail para contato@tratorbr.com.br ou pelo WhatsApp disponível no site."
    },
    {
      pergunta: "O aplicativo está disponível?",
      resposta: "Sim! Nosso aplicativo está disponível para download nas lojas de aplicativos. Visite a página do aplicativo para baixar na App Store ou Google Play."
    },
    {
      pergunta: "Como funciona a plataforma?",
      resposta: "Nossa plataforma conecta compradores e vendedores de máquinas agrícolas de forma segura e eficiente, oferecendo ferramentas de avaliação, negociação e suporte especializado."
    },
    {
      pergunta: "Há suporte técnico disponível?",
      resposta: "Sim, oferecemos suporte técnico completo para todos os nossos usuários. Nossa equipe está disponível via WhatsApp, email e telefone para ajudar com qualquer dúvida ou problema."
    },
    {
      pergunta: "Como funciona o sistema de avaliação?",
      resposta: "Utilizamos tecnologia avançada e um banco de dados completo para avaliar máquinas agrícolas de forma precisa, considerando marca, modelo, ano, estado de conservação e condições de mercado."
    }
  ];

  return (
    <div className="duvidas-page">
      <Header />
      
      <main className="duvidas-content">
        <div className="duvidas-container">
          <div className="duvidas-header">
            <h1>Dúvidas Frequentes</h1>
            <p>Encontre respostas para as perguntas mais comuns sobre o TratorBR</p>
          </div>

          <div className="faq-section-modern">
            {faqData.map((item, index) => (
              <div key={index} className="faq-item-modern">
                <button 
                  className={`faq-question-modern ${faqAberto === index ? 'active' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="faq-question-text">{item.pergunta}</span>
                  <span className={`faq-icon-modern ${faqAberto === index ? 'rotated' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </button>
                <div className={`faq-answer-modern ${faqAberto === index ? 'open' : ''}`}>
                  <div className="faq-answer-content-modern">
                    <p>{item.resposta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-section-modern">
            <h2>Ainda tem dúvidas?</h2>
            <p>Nossa equipe está pronta para ajudar você</p>
            <div className="contact-buttons">
              <a href="/contato" className="contact-btn primary">
                Entre em Contato
              </a>
              <a href="https://wa.me/5543999999999" className="contact-btn secondary" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DuvidasPage;
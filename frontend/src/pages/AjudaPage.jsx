import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import WhatsappFlutuante from '../components/WhatsappFlutuante';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import CalendlyFlutuante from "../components/CalendlyFlutuante";
import './style/AjudaPage.css';

const AjudaPage = () => {
  const [faqAberto, setFaqAberto] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeImageSlide, setActiveImageSlide] = useState(0);

  const toggleFaq = (index) => {
    setFaqAberto(faqAberto === index ? null : index);
  };

  const faqData = [
    {
      pergunta: "Como funciona a plataforma TratorBR?",
      introducao: "Oferecemos um sistema focado na avaliação e precificação de máquinas agrícolas usadas. Nosso sistema calcula...",
      resposta: "Oferecemos um sistema focado na avaliação e precificação de máquinas agrícolas usadas. Nosso sistema calcula o valor estimado de um equipamento com base em parâmetros como marca, modelo, ano, nota técnica e valor do veículo novo. A plataforma conta com dezenas de usuários verificados, um banco de dados completo de máquinas e ferramentas que facilitam as suas transações no agronegócio, garantindo a melhor compra e venda da sua máquina agrícola."
    },
    {
      pergunta: "O que o Aplicativo vai mudar na minha realidade?",
      introducao: "Nosso aplicativo revoluciona o mercado ao eliminar a incerteza e garantir que todas as suas decisões de compra, venda e troca sejam fundamentadas...",
      resposta: "Nosso aplicativo revoluciona o mercado ao eliminar a incerteza e garantir que todas as suas decisões de compra, venda e troca sejam fundamentadas no maior e mais completo banco de dados de máquinas agrícolas do Brasil. Sua empresa ganha rentabilidade e segurança máxima ao substituir avaliações subjetivas por um sistema padronizado, tornando o processo mais rápido e profissional. Além disso, o App garante total autonomia e eficiência operacional à sua equipe, funcionando de forma offline mesmo em áreas rurais, com sincronização automática dos dados quando a conectividade é restabelecida."
    },
    {
      pergunta: "Como fazer um agendamento de demonstração?",
      introducao: "O agendamento funciona diretamente pela nossa plataforma. Acesse a pagina de contato ou utilize o botão verde localizado...",
      resposta: "O agendamento funciona diretamente pela nossa plataforma. Acesse a pagina de contato ou utilize o botão verde localizado na parte inferior direita e faça o seu agendamento com a TratorBR, escolhendo o melhor horário possível para você. Assim, você conhecerá como pode melhorar a sua tomada de decisão em compra, venda e troca com total segurança e precisão."
    },
    {
      pergunta: "Como faço para cadastrar minha empresa no sistema da TratorBR?",
      introducao: "O cadastro é geralmente feito por meio de contato direto com a nossa equipe comercial. É necessário solicitar uma demonstração...",
      resposta: "O cadastro é geralmente feito por meio de contato direto com a nossa equipe comercial. É necessário solicitar uma demonstração e negociar um plano de assinatura para ter acesso às funcionalidades completas. Entre em contato conosco."
    },
    {
      pergunta: "O aplicativo está disponível para download?",
      introducao: "Sim! Nosso aplicativo móvel está disponível para download gratuito tanto na App Store (iOS) quanto na Google Play Store (Android). Com o App TratorBR...",
      resposta: "Sim! Nosso aplicativo móvel está disponível para download gratuito tanto na App Store (iOS) quanto na Google Play Store (Android). Com o App TratorBR, você tem acesso completo a todas as funcionalidades da plataforma diretamente do seu celular ou tablet."
    },
    {
      pergunta: "Meus dados e informações de avaliações estão seguros?",
      introducao: "Sim, a segurança e a confidencialidade dos dados são nossa prioridade, seguindo as leis da LGPD. Utilizamos criptografia...",
      resposta: "Sim, a segurança e a confidencialidade dos dados são nossa prioridade, seguindo as leis da LGPD. Utilizamos criptografia e protocolos de segurança avançados para proteger as informações de todas as avaliações e a identidade de nossos clientes."
    },
    {
      pergunta: "Como funciona o sistema de avaliação?",
      introducao: "Nosso sistema de avaliação utiliza tecnologia de ponta combinada com expertise humana para determinar o valor justo de máquinas agrícolas...",
      resposta: "Nosso sistema de avaliação utiliza tecnologia de ponta combinada com expertise humana para determinar o valor justo de máquinas agrícolas. Consideramos diversos fatores como marca, modelo, ano de fabricação, horas de uso, estado de conservação, histórico de manutenção, modificações realizadas e as condições atuais do mercado. Nossa base de dados contém informações de milhares de transações realizadas, permitindo análises comparativas precisas. Além disso, nossa equipe de especialistas em máquinas agrícolas realiza verificações técnicas quando necessário, garantindo avaliações confiáveis e atualizadas com as tendências do mercado."
    },
    {
      pergunta: "Como entrar em contato com o suporte?",
      introducao: "Nosso atendimento ao cliente está disponível através de múltiplos canais para sua conveniência. Você pode nos contatar via WhatsApp para respostas rápidas...",
      resposta: "Nosso atendimento ao cliente está disponível através de múltiplos canais para sua conveniência. Você pode nos contatar via WhatsApp para respostas rápidas, enviar e-mail para contato@tratorbr.com.br para questões mais detalhadas, ou através da nossa pagina de contato no próprio site. Nossa equipe é composta por especialistas em máquinas agrícolas e profissionais experientes no agronegócio, prontos para ajudar com qualquer dúvida sobre compra, venda, avaliação ou uso da plataforma. Oferecemos todo o suporte necessário durante a sua jornada na TratorBR."
    }
  ];

  const tabsData = [
    {
      id: 'home',
      label: 'Home',
      title: 'Conheça mais da Home',
      description: 'Eaê! Bem-vindo à sua central de comando. A tela de Home do TratorBR não é apenas um início, é o seu painel de controle para tomar decisões mais rápidas e inteligentes no mercado de máquinas agrícolas. Pense nela como a cabine da sua máquina mais potente: tudo o que você precisa está ao alcance de um toque.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      appImages: [
        '/imagens-tutorial/IMG-HOME.png',
        '/imagens-tutorial/IMG-HOME-2.png',
        '/imagens-tutorial/IMG-HOME-3.png',
        '/imagens-tutorial/IMG-HOME-4.png',
        '/imagens-tutorial/IMG-HOME-5.png',
        '/imagens-tutorial/IMG-HOME-6.png'
      ]
    },
    // {
    //   id: 'AnoBR',
    //   label: 'AnoBr',
    //   title: 'Como anunciar sua máquina',
    //   description: 'No mercado de máquinas, o ano de fabricação é muito mais do que um número. É um fator decisivo de valorização ou desvalorização. O AnoBR é a sua ferramenta para decifrar esse fator com precisão cirúrgica, e baseado em dados dos fabricantes. Chega de "achismo". Use dados concretos para justificar o valor de um equipamento mais novo ou para negociar o preço de um mais antigo.',
    //   videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    //   appImages: [
    //     '/imagens-tutorial/anuncio-1.png',
    //     '/imagens-tutorial/anuncio-2.png',
    //     '/imagens-tutorial/anuncio-3.png'
    //   ]
    // },
    {
      id: 'tabelabr',
      label: 'TabelaBr',
      title: 'Como avaliar minha maquina',
      description: 'Você já imaginou ter uma Tabela FIPE, mas construída para a realidade e a dinâmica do mercado de máquinas agrícolas? Essa ferramenta existe e se chama TabelaBR. Nós somos a referência de preços de Equipamento do Agronegócio. Com base em um algoritmo feito para calcular o valor de uma Máquina baseado no Estado de Conservação do Equipamento, a TabelaBr é a inteligência de dados trabalhando para o seu negócio.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      appImages: [
        '/imagens-tutorial/tabelabr-00.png',
        '/imagens-tutorial/tabelabr-01.png',
        '/imagens-tutorial/tabelabr-02.png',
        '/imagens-tutorial/tabelabr-03.png',
        '/imagens-tutorial/tabelabr-04.png',
        '/imagens-tutorial/tabelabr-05.png',
        '/imagens-tutorial/tabelabr-06.png',
        '/imagens-tutorial/tabelabr-07.png',
        '/imagens-tutorial/tabelabr-08.png',
        '/imagens-tutorial/tabelabr-09.png',
        '/imagens-tutorial/tabelabr-10.png',
        '/imagens-tutorial/tabelabr-11.png',
        '/imagens-tutorial/tabelabr-12.png',
        '/imagens-tutorial/tabelabr-13.png',
        '/imagens-tutorial/tabelabr-14.png',
      ]
    },
    {
      id: 'checklist',
      label: 'ChecklistBr',
      title: 'Descobrindo a nota do meu equipamento',
      description: 'Se AnoBR e TabelaBR te dão a base, o CheckBR é o seu bisturi de precisão. É aqui que separamos uma máquina comum de uma máquina excepcional. Esta ferramenta aponta oestado de Conservação exato, do seu equipamento, resultando em um Laudo, para documentar o que realmente esse Equipamento significa.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      appImages: [
        '/imagens-tutorial/checklist-1.png',
        '/imagens-tutorial/checklist-2.png',
        '/imagens-tutorial/checklist-3.png'
      ]
    }
  ];

  const cardsData = [
    {
      numero: '1',
      titulo: 'Cadastrar no APP',
      descricao: 'Preencha seus dados para desbloquear a inteligência do mercado agro. É rápido, fácil e o primeiro passo para você ter o poder da avaliação assertiva exclusivo em suas mãos.'
    },
    {
      numero: '2',
      titulo: 'Validar o email',
      descricao: 'Valide seu acesso seguro! Na sua caixa de entrada! Enviamos um link de confirmação para garantir a total segurança da sua conta e dos seus dados. Lembre-se de checar o spam. Um clique e você estará pronto para o próximo nível.'
    },
    {
      numero: '3',
      titulo: 'Entrar no APP',
      descricao: 'Domine o Mercado. Entre! Acesso liberado. Entre agora no TratorBR e comece a transformar o jeito como você negocia. Não se esqueça, ao entrar pela 1ª vez realize o Passo a Passo segundo o tutorial, e aproveite do melhor que a TratorBr pode te oferecer.'
    }
  ];

  // Auto-rotação de imagens a cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageSlide((prev) =>
        prev === tabsData[activeTab].appImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab, tabsData]);

  const handlePrevSlide = () => {
    setActiveImageSlide((prev) =>
      prev === 0 ? tabsData[activeTab].appImages.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setActiveImageSlide((prev) =>
      prev === tabsData[activeTab].appImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToSlide = (index) => {
    setActiveImageSlide(index);
  };

  return (
    <div className="ajuda-page">
      <Header />

      <div className="tabs-header" style={{ marginTop: '7rem' }}>
        <h2>Como Podemos Ajudar?</h2>
        <div className='divisoria'></div>
        <p>Aqui está o passo a passo de como usar o nosso aplicativo, para você extrair o melhor do nosso sistema. Aproveite tudo que nossa plataforma oferece!</p>
      </div>

      {/* VIDEO DE CADASTRO */}
      <section className="texto-video-section">
        <div className="texto-video-container">
          <div className="texto-video-content">
            <div className="texto-video-text">
              <h2>Como se cadastrar no aplicativo?</h2>
              <p>
                Com o app TratorBR, agricultores e concessionários ganham uma nova forma de conectar suas máquinas com eficiência e agilidade. Tudo na palma da mão.
              </p>
            </div>

            <div className="texto-video-video">
              <div className="video-placeholder">
                <iframe width="100%" height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Video mostrando todo o processo do cadastro"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: '12px' }}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1-2-3 CADASTRO */}
      <section className="cards-numerados-section">
        <div className="cards-numerados-container">
          <div className="cards-grid">
            {cardsData.map((card, index) => (
              <div key={index} className="card-numerado">
                <div className="card-numero">
                  {card.numero}
                </div>
                <h3 className="card-titulo">{card.titulo}</h3>
                <p className="card-descricao">{card.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLICAÇÕES EM ABAS */}
      <section className="tabs-video-section">
        <div className="tabs-video-container">
          <div className="tabs-header">
            <h2>Primeiros Passos</h2>
            <div className='divisoria'></div>
          </div>

          <div className="tabs-nav">
            {tabsData.map((tab, index) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === index ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(index);
                  setActiveImageSlide(0);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tabs-content-wrapper">
            <div className="tabs-content-new">
              <div className="tabs-left-column">
                <h3 className="tabs-text-title">{tabsData[activeTab].title}</h3>
                <p className="tabs-text-description">{tabsData[activeTab].description}</p>

                <div className="video-placeholder-new">
                  <iframe
                    width="100%" height="100%" src={tabsData[activeTab].videoUrl} title={`Video - ${tabsData[activeTab].label}`}
                    frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ borderRadius: '12px' }}
                  ></iframe>
                </div>
              </div>

              <div className="tabs-right-column">
                <div className="carousel-container">
                  <div className="carousel-text">Arraste para o lado →</div>

                  <div className="carousel-images">
                    {tabsData[activeTab].appImages.map((image, index) => (
                      <div key={index} className={`carousel-image-wrapper ${index === activeImageSlide ? 'active' : ''}`}
                      >
                        <img src={image} alt={`App Screen ${index + 1}`} className="carousel-image" />
                      </div>
                    ))}

                    <button className="carousel-arrow carousel-arrow-left" onClick={handlePrevSlide} aria-label="Imagem anterior">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    <button className="carousel-arrow carousel-arrow-right" onClick={handleNextSlide} aria-label="Próxima imagem">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19l7-7-7-7"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="carousel-dots">
                    {tabsData[activeTab].appImages.map((_, index) => (
                      <button key={index} className={`carousel-dot ${index === activeImageSlide ? 'active' : ''}`} onClick={() => goToSlide(index)} aria-label={`Ir para slide ${index + 1}`}>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="ajuda-content">
        <div className="ajuda-container">
          <div className="tabs-header" style={{ marginTop: '7rem' }}>
            <h2>Perguntas Frequentes</h2>
            <div className='divisoria'></div>
          </div>

          <div className="faq-grid">
            {faqData.map((item, index) => (
              <div key={index} className="faq-card">
                <button
                  className={`faq-question ${faqAberto === index ? 'active' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="faq-question-text">{item.pergunta}</span>
                  <span className={`faq-icon ${faqAberto === index ? 'rotated' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </button>

                <div className={`faq-intro ${faqAberto === index ? 'hidden' : 'visible'}`}>
                  <p>{item.introducao}</p>
                </div>

                <div className={`faq-answer ${faqAberto === index ? 'open' : ''}`}>
                  <div className="faq-answer-content">
                    <p>{item.resposta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-section">
            <div className="contact-horizontal">
              <div className="contact-text">
                <h2>Você está com alguma dúvida que não foi sanada em cima?</h2>
                <p>Nosso time de especialistas está pronto para te atender.</p>
              </div>
              <a href="https://api.whatsapp.com/send?phone=5543991895458&text=Olá,%20poderia%20me%20ajudar?" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z" />
                </svg>
                Fale com a gente
              </a>
            </div>
          </div>
          {/* <WhatsappFlutuante /> */}
          <CalendlyFlutuante />
          <VoltarAoTopoBtn />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AjudaPage;

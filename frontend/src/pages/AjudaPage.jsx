import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import './style/AjudaPage.css';

const normalizeString = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
};

const getEditDistance = (s1, s2) => {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 0;

  const editDistance = levenshteinDistance(longer, shorter);
  return editDistance;
};

const levenshteinDistance = (s1, s2) => {
  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(0));

  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[s2.length][s1.length];
};

const calculateSimilarity = (query, text) => {
  const normalizedQuery = normalizeString(query);
  const normalizedText = normalizeString(text);

  if (!normalizedQuery) return 0;

  const queryWords = normalizedQuery.split(/\s+/);
  const textWords = normalizedText.split(/\s+/);

  let matchedWords = 0;
  queryWords.forEach(word => {
    if (word.length > 2) { 
      const found = textWords.some(textWord =>
        textWord.includes(word) || word.includes(textWord)
      );
      if (found) matchedWords++;
    }
  });

  const keywordSimilarity = queryWords.length > 0
    ? (matchedWords / queryWords.length) * 100
    : 0;

  const maxLength = Math.max(normalizedQuery.length, normalizedText.length);
  const distance = levenshteinDistance(normalizedQuery, normalizedText);
  const levenshteinSimilarity = maxLength > 0
    ? ((maxLength - distance) / maxLength) * 100
    : 0;

  let substringScore = 0;
  if (normalizedText.includes(normalizedQuery)) {
    substringScore = 100;
  } else if (normalizedQuery.includes(normalizedText)) {
    substringScore = 80;
  } else {
    for (let i = 0; i < normalizedQuery.length - 2; i++) {
      if (normalizedText.includes(normalizedQuery.substring(i, i + 3))) {
        substringScore = Math.max(substringScore, 60);
      }
    }
  }

  const finalScore =
    (keywordSimilarity * 0.5) +      // 50% - Palavras-chave
    (levenshteinSimilarity * 0.4) +  // 40% - Similaridade de string
    (substringScore * 0.1);           // 10% - Substring

  return finalScore;
};

const searchFAQs = (query, faqs, threshold = 33) => {
  if (!query.trim()) return [];

  const results = faqs.map(faq => {
    const perguntaSimilarity = calculateSimilarity(query, faq.pergunta);
    const respostaSimilarity = calculateSimilarity(query, faq.resposta);
    const introducaoSimilarity = calculateSimilarity(query, faq.introducao);

    const maxSimilarity = Math.max(
      perguntaSimilarity,
      respostaSimilarity,
      introducaoSimilarity
    );

    return {
      ...faq,
      similarity: maxSimilarity,
      matchType: perguntaSimilarity >= respostaSimilarity ? 'pergunta' : 'resposta'
    };
  });

  return results
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
};

const AjudaPage = () => {
  const [faqAberto, setFaqAberto] = useState(null);
  const [activeTab, setActiveTab] = useState('tratorbr');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const faqDataCompleto = [
    {
      id: 1,
      categoria: 'tratorbr',
      pergunta: "Como funciona a plataforma TratorBR?",
      introducao: "Oferecemos um sistema focado na avaliação e precificação de máquinas agrícolas usadas. Nosso sistema calcula...",
      resposta: "Oferecemos um sistema focado na avaliação e precificação de máquinas agrícolas usadas. Nosso sistema calcula o valor estimado de um equipamento com base em parâmetros como marca, modelo, ano, nota técnica e valor do veículo novo. A plataforma conta com dezenas de usuários verificados, um banco de dados completo de máquinas e ferramentas que facilitam as suas transações no agronegócio, garantindo a melhor compra e venda da sua máquina agrícola."
    },
    {
      id: 2,
      categoria: 'aplicativo',
      pergunta: "O que o Aplicativo vai mudar na minha realidade?",
      introducao: "Nosso aplicativo revoluciona o mercado ao eliminar a incerteza e garantir que todas as suas decisões de compra, venda e troca sejam fundamentadas...",
      resposta: "Nosso aplicativo revoluciona o mercado ao eliminar a incerteza e garantir que todas as suas decisões de compra, venda e troca sejam fundamentadas no maior e mais completo banco de dados de máquinas agrícolas do Brasil. Sua empresa ganha rentabilidade e segurança máxima ao substituir avaliações subjetivas por um sistema padronizado, tornando o processo mais rápido e profissional. Além disso, o App garante total autonomia e eficiência operacional à sua equipe, funcionando de forma offline mesmo em áreas rurais, com sincronização automática dos dados quando a conectividade é restabelecida."
    },
    {
      id: 3,
      categoria: 'tratorbr',
      pergunta: "Como fazer um agendamento de demonstração?",
      introducao: "O agendamento funciona diretamente pela nossa plataforma. Acesse a pagina de contato ou utilize o botão verde localizado...",
      resposta: "O agendamento funciona diretamente pela nossa plataforma. Acesse a pagina de contato ou utilize o botão verde localizado na parte inferior direita e faça o seu agendamento com a TratorBR, escolhendo o melhor horário possível para você. Assim, você conhecerá como pode melhorar a sua tomada de decisão em compra, venda e troca com total segurança e precisão."
    },
    {
      id: 4,
      categoria: 'tratorbr',
      pergunta: "Como faço para cadastrar minha empresa no sistema da TratorBR?",
      introducao: "O cadastro é geralmente feito por meio de contato direto com a nossa equipe comercial. É necessário solicitar uma demonstração...",
      resposta: "O cadastro é geralmente feito por meio de contato direto com a nossa equipe comercial. É necessário solicitar uma demonstração e negociar um plano de assinatura para ter acesso às funcionalidades completas. Entre em contato conosco."
    },
    {
      id: 5,
      categoria: 'aplicativo',
      pergunta: "O aplicativo está disponível para download?",
      introducao: "Sim! Nosso aplicativo móvel está disponível para download gratuito tanto na App Store (iOS) quanto na Google Play Store (Android). Com o App TratorBR...",
      resposta: "Sim! Nosso aplicativo móvel está disponível para download gratuito tanto na App Store (iOS) quanto na Google Play Store (Android). Com o App TratorBR, você tem acesso completo a todas as funcionalidades da plataforma diretamente do seu celular ou tablet."
    },
    {
      id: 6,
      categoria: 'tratorbr',
      pergunta: "Meus dados e informações de avaliações estão seguros?",
      introducao: "Sim, a segurança e a confidencialidade dos dados são nossa prioridade, seguindo as leis da LGPD. Utilizamos criptografia...",
      resposta: "Sim, a segurança e a confidencialidade dos dados são nossa prioridade, seguindo as leis da LGPD. Utilizamos criptografia e protocolos de segurança avançados para proteger as informações de todas as avaliações e a identidade de nossos clientes."
    },
    {
      id: 7,
      categoria: 'tratorbr',
      pergunta: "Como funciona o sistema de avaliação?",
      introducao: "Nosso sistema de avaliação utiliza tecnologia de ponta combinada com expertise humana para determinar o valor justo de máquinas agrícolas...",
      resposta: "Nosso sistema de avaliação utiliza tecnologia de ponta combinada com expertise humana para determinar o valor justo de máquinas agrícolas. Consideramos diversos fatores como marca, modelo, ano de fabricação, horas de uso, estado de conservação, histórico de manutenção, modificações realizadas e as condições atuais do mercado. Nossa base de dados contém informações de milhares de transações realizadas, permitindo análises comparativas precisas. Além disso, nossa equipe de especialistas em máquinas agrícolas realiza verificações técnicas quando necessário, garantindo avaliações confiáveis e atualizadas com as tendências do mercado."
    },
    {
      id: 8,
      categoria: 'tratorbr',
      pergunta: "Como entrar em contato com o suporte?",
      introducao: "Nosso atendimento ao cliente está disponível através de múltiplos canais para sua conveniência. Você pode nos contatar via WhatsApp para respostas rápidas...",
      resposta: "Nosso atendimento ao cliente está disponível através de múltiplos canais para sua conveniência. Você pode nos contatar via WhatsApp para respostas rápidas, enviar e-mail para contato@tratorbr.com.br para questões mais detalhadas, ou através da nossa pagina de contato no próprio site. Nossa equipe é composta por especialistas em máquinas agrícolas e profissionais experientes no agronegócio, prontos para ajudar com qualquer dúvida sobre compra, venda, avaliação ou uso da plataforma. Oferecemos todo o suporte necessário durante a sua jornada na TratorBR."
    },
    {
      id: 9,
      categoria: 'aplicativo',
      pergunta: "Qual o principal objetivo do aplicativo para o usuário?",
      introducao: "Com o foco em eliminar a maior dor do mercado, o objetivo principal é transformar o seu departamento de máquinas...",
      resposta: "Com o foco em eliminar a maior dor do mercado, o objetivo principal é transformar o seu departamento de máquinas agrícolas usadas em um centro de lucro (rentável), fundamentando as decisões em dados reais. Assim, concessionários, revendas e outros usuários tomam decisões de compra, venda e troca com total segurança e precisão."
    },
    {
      id: 10,
      categoria: 'aplicativo',
      pergunta: "O app funciona sem internet?",
      introducao: "Sim! O app da TratorBR funciona também offline, permitindo que você registre dados, acompanhe atividades ...",
      resposta: "Sim! O app da TratorBR funciona também offline, permitindo que você registre dados, acompanhe atividades e gerencie sua operação mesmo sem internet. Quando o sinal voltar, tudo se sincroniza automaticamente."
    },
    {
      id: 11,
      categoria: 'aplicativo',
      pergunta: "Quem usa o aplicativo da TratorBR?",
      introducao: "O sistema é voltado principalmente para concessionárias, revendas e profissionais que precisam de uma avaliação...",
      resposta: "O sistema é voltado principalmente para concessionárias, revendas e profissionais que precisam de uma avaliação técnica e precisa de máquinas agrícolas usadas, mas também pode ser útil para produtores rurais."
    },
    {
      id: 12,
      categoria: 'aplicativo',
      pergunta: "Como faço para cadastrar minha empresa no sistema da TratorBR?",
      introducao: "O cadastro é geralmente feito por meio de contato direto com a nossa equipe comercial. É necessário solicitar...",
      resposta: "O cadastro é geralmente feito por meio de contato direto com a nossa equipe comercial. É necessário solicitar uma demonstração e negociar um plano de assinatura para ter acesso às funcionalidades completas. Entre em contato conosco."
    },
    {
      id: 13,
      categoria: 'aplicativo',
      pergunta: "Como funciona o sistema de avaliação de maquinas?",
      introducao: "Nosso sistema utiliza tecnologia avançada para avaliar o valor da sua máquina de forma eficiente. É útil para o concessionário...",
      resposta: "Nosso sistema utiliza tecnologia avançada para avaliar o valor da sua máquina de forma eficiente. É útil para o concessionário que precisa receber um usado na troca por um novo, e também para o produtor que busca comprar um maquinário com segurança."
    },
    {
      id: 14,
      categoria: 'aplicativo',
      pergunta: "Quais máquinas estão no banco de dados?",
      introducao: "Nosso Banco de Dados é o maior e mais completo do Brasil, contendo praticamente todas as marcas e modelos de máquinas agrícolas comercializadas no país. Isso inclui tratores...",
      resposta: "Nosso Banco de Dados é o maior e mais completo do Brasil, contendo praticamente todas as marcas e modelos de máquinas agrícolas comercializadas no país. Isso inclui tratores, colheitadeiras, plantadeiras, pulverizadores e muito mais. Nossa base de dados é constantemente atualizada para garantir que você tenha acesso às informações mais recentes do mercado."
    }
  ];

  const faqData = useMemo(() => {
    return faqDataCompleto.filter(faq => faq.categoria === activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchFAQs(searchQuery, faqDataCompleto, 60);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const toggleFaq = (index) => {
    setFaqAberto(faqAberto === index ? null : index);
  };

  const displayData = showSearchResults ? searchResults : faqData;

  return (
    <div className="ajuda-page">
      <Header />

      <div className="tabs-header">
        <h2>Como Podemos Ajudar?</h2>
        <div className='divisoria'></div>
        <p>Aqui está o passo a passo de como usar o nosso aplicativo, para você extrair o melhor do nosso sistema. Aproveite tudo que nossa plataforma oferece!</p>
      </div>

      <main id="ajuda-content" className="ajuda-content">
        <div className="ajuda-container">

          <div className="search-bar-container">
            <div className="search-bar-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Faça sua pergunta aqui... (ex: como avaliar uma máquina?)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-info">
                <p className="search-found">Encontramos <strong>{searchResults.length}</strong> resultado(s) relevante(s)</p>
              </div>
            )}
          </div>

          {!showSearchResults && (
            <div className="faq-tabs">
              <button
                className={`faq-tab-button ${activeTab === 'tratorbr' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('tratorbr');
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
              >
                TratorBR
              </button>
              <button
                className={`faq-tab-button ${activeTab === 'aplicativo' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('aplicativo');
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
              >
                Aplicativo
              </button>
            </div>
          )}

          {displayData.length > 0 ? (
            <div className="faq-grid">
              {displayData.map((item) => (
                <div key={item.id} className="faq-card">
                  <button
                    className={`faq-question ${faqAberto === item.id ? 'active' : ''}`}
                    onClick={() => toggleFaq(item.id)}
                  >
                    <span className="faq-question-text">{item.pergunta}</span>
                    <span className={`faq-icon ${faqAberto === item.id ? 'rotated' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </button>
                  <div className={`faq-intro ${faqAberto === item.id ? 'hidden' : 'visible'}`}>
                    <p>{item.introducao}</p>
                  </div>
                  <div className={`faq-answer ${faqAberto === item.id ? 'open' : ''}`}>
                    <div className="faq-answer-content">
                      <p>{item.resposta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results-message">
              <h3>Nenhuma Resposta encontrada!</h3>
              <p className="search-not-foundi">Sua dúvida não foi encontrada em nossa base de conhecimento. Entre em contato com nosso suporte para obter ajuda, <a href="/contato#contato-c">entre em contato com nosso suporte</a></p>

            </div>
          )}

          <div className="contact-section" id="contact-section">
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

          <VoltarAoTopoBtn />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AjudaPage;

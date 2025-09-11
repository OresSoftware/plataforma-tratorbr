import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import './ExcluirContaPage.css';

const ExcluirContaPage = () => {
  const [email, setEmail] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Por favor, digite seu email.');
      return;
    }
    if (!recaptchaVerified) {
      alert('Por favor, complete a verificação reCAPTCHA.');
      return;
    }
    
    // Aqui seria a lógica de exclusão da conta
    console.log('Solicitação de exclusão para:', email);
  };

  // Componentes de ícones SVG
  const SearchIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const MoneyIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const BellIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const ShieldIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12L11 14L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const ChartIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 9L13 14L9 10L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const SupportIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 9H15M9 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const vantagens = [
    {
      id: "card-1",
      icone: <SearchIcon />,
      titulo: "Busca Avançada",
      descricao: "Encontre máquinas específicas com filtros detalhados por marca, modelo, ano e localização."
    },
    {
      id: "card-2",
      icone: <MoneyIcon />,
      titulo: "Avaliações Precisas",
      descricao: "Receba avaliações profissionais e atualizadas do valor real das suas máquinas agrícolas."
    },
    {
      id: "card-3",
      icone: <BellIcon />,
      titulo: "Notificações Personalizadas",
      descricao: "Seja alertado sobre novas máquinas que atendem seus critérios de interesse."
    },
    {
      id: "card-4",
      icone: <ShieldIcon />,
      titulo: "Negociação Segura",
      descricao: "Plataforma com vendedores verificados e sistema de mediação para transações seguras."
    },
    {
      id: "card-5",
      icone: <ChartIcon />,
      titulo: "Histórico Completo",
      descricao: "Acompanhe todas suas negociações, favoritos e histórico de atividades na plataforma."
    },
    {
      id: "card-6",
      icone: <SupportIcon />,
      titulo: "Suporte Especializado",
      descricao: "Acesso a especialistas em máquinas agrícolas para tirar dúvidas e orientações."
    }
  ];

  return (
    <div className="excluir-conta-page">
      <Header />
      
      <main className="excluir-conta-content">
        <div className="excluir-conta-container">
          <div className="excluir-conta-header">
            <h1>EXCLUIR CONTA</h1>
            <div className='divisoria'></div>
          </div>

          <div className="excluir-conta-main">
            <div className="excluir-conta-info">
              <h2>Deseja excluir a sua conta?</h2>
              <p>Você tem certeza que deseja excluir sua conta?</p>
              <p>Todos seus dados da conta serão definitivamente excluídos, além disso vai perder muitas vantagens que só o nosso aplicativo pode trazer para você.</p>
            </div>

            <div className="excluir-conta-form-container">
              <form onSubmit={handleSubmit} className="excluir-conta-form">
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="email-input"
                    required
                  />
                </div>

                <button type="submit" className="excluir-btn">
                  Excluir conta
                </button>

                <div className="recaptcha-container">
                  <div className="recaptcha-placeholder">
                    <input
                      type="checkbox"
                      id="recaptcha"
                      checked={recaptchaVerified}
                      onChange={(e) => setRecaptchaVerified(e.target.checked)}
                    />
                    <label htmlFor="recaptcha">Não sou um robô</label>
                    <div className="recaptcha-logo">
                      <span>reCAPTCHA</span>
                      <small>Privacidade - Termos</small>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="vantagens-section">
            <h2>Vantagens de manter sua conta</h2>
            <p>Veja tudo que você vai perder ao excluir sua conta:</p>
            
            <div className="vantagens-grid">
              {vantagens.map((vantagem) => (
                <div key={vantagem.id} id={vantagem.id} className="vantagem-card">
                  <div className="vantagem-icone">{vantagem.icone}</div>
                  <h3>{vantagem.titulo}</h3>
                  <p>{vantagem.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExcluirContaPage;


import React from 'react';
import Header from '../components/Header';
import './PoliticaPrivacidadePage.css';

const PoliticaPrivacidadePage = () => {
  return (
    <div className="politica-privacidade-container">
      <Header />
      <main className="politica-privacidade-main">
        <h1 className="politica-privacidade-title">Política de Privacidade</h1>
        <div className="politica-privacidade-content">
            <h2>Coleta de Dados</h2>
                <p>Coletamos apenas as informações estritamente necessárias para oferecer uma experiência segura, personalizada e eficiente. Entre os dados coletados estão: nome, e-mail, localização e informações de navegação. O tratamento dos dados está em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018).</p>
            
            <h2>Uso das Informações</h2>
                <p>As informações fornecidas são utilizadas exclusivamente para: Melhorar nossos serviços e funcionalidades; Facilitar a comunicação e conexão entre usuários; Enviar comunicações relevantes, sempre com sua autorização prévia.</p>
            
            <h2>Compartilhamento de Dados</h2>
                <p>Não compartilhamos seus dados com terceiros, exceto em casos de: Cumprimento de obrigação legal; Garantia do funcionamento técnico da plataforma, com parceiros que sigam os mesmos princípios de segurança e confidencialidade.</p>

            <h2>Segurança</h2>
                <p>Adotamos medidas técnicas e administrativas adequadas para proteger seus dados contra acessos não autorizados, alterações, divulgação ou destruição. Você pode, a qualquer momento, solicitar a exclusão ou correção de suas informações pessoais por meio do canal de contato disponível na plataforma.</p>
        </div>
      </main>
    </div>
  );
};

export default PoliticaPrivacidadePage;



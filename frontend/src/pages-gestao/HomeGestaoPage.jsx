import React from 'react';
import GestaoLayout from '../components/GestaoLayout';
import './style/HomeGestaoPage.css';

const HomeGestaoPage = () => {
  return (
    <GestaoLayout>
      <div className="home-gestao-page">
        <h1>Bem-vindo à Página de Gestão</h1>
        <p>Esta é a página principal do sistema de gestão.</p>
      </div>
    </GestaoLayout>
  );
};

export default HomeGestaoPage;

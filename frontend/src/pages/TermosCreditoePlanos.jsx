import React from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import useNoindex from '../hooks/useNoindex';
import './style/TermosEPolitica.css';

const TermosCreditoePlanosPage = () => {
    useNoindex();

    return (
        <div className="termos-uso-container">
            <Header />
            <main className="termos-uso-main">
                <h1 className="termos-uso-title">Planos e Créditos</h1>
                <div className="termos-uso-content">
                    <p>Bem-vindo aos Termos de Uso dos Planos e Créditos da TratorBr. Ao utilizar nossos serviços, você concorda com os seguintes termos:</p>

                    <h2>O que são os Créditos TratorBR?</h2>
                    <p>Os créditos são a unidade padrão utilizada para mensurar o uso dos serviços avançados na plataforma TratorBR. Cada operação dentro do aplicativo consome uma quantidade específica de créditos, sendo que atividades mais complexas exigem um número maior para sua execução.</p>

                    <h2>Como os créditos funcionam?</h2>
                    <p>O consumo de créditos está diretamente associado à utilização de funcionalidades específicas. A seguir, detalhamos os custos por serviço:
                        <ul>
                            <li>TabelaBR | 50 créditos</li>
                            <li>CheckBR - Resumido | 100 créditos</li>
                            <li>CheckBR - Detalhado | 200 créditos</li>
                            <li>Emissão de Laudo | 100 créditos</li>
                        </ul>
                        ATENÇÃO - os créditos são debitados apenas no momento do processamento de uma avaliação ou publicação. Relatórios e anúncios já existentes podem ser visualizados ou acessados sem consumir créditos adicionais.

                        <p>Exemplos de Uso de Créditos</p>
                        <p>1. TabelaBR</p>
                        <ul>
                            <li>Complexidade | Padrão</li>
                            <li>Tipo de Serviço | Precificar o equipamento descrito.</li>
                            <li>Créditos Utilizados | 50 créditos</li>
                        </ul>

                        <p>2. CheckBR - Detalhado</p>
                        <ul>
                            <li>Complexidade | Alta</li>
                            <li>Tipo de Serviço | Avaliar o equipamento por meio de um questionário detalhado, que resulta na emissão de um laudo completo com todos os seus itens.</li>
                            <li>Créditos Utilizados | 200 créditos</li>
                        </ul>
                    </p>

                    <h2>Como obter mais créditos?</h2>
                    <p>
                        <ul>
                            <li>Usuários de planos básicos que necessitam de maior capacidade de análise podem migrar para uma assinatura superior. </li>
                            <li>Membros que já possuem um plano e precisam de um volume extra podem adquirir pacotes de créditos adicionais a qualquer momento.</li>
                            <li>Para conhecer os benefícios de cada plano, adquirir pacotes ou migrar para um plano superior, visite a sua área de assinaturas na plataforma TratorBR.</li>
                        </ul>
                    </p>

                    <h2>Os créditos expiram?</h2>
                    <p>Sim, as regras de validade variam conforme a origem dos créditos:
                        <p>Créditos Promocionais:</p>
                        <ul>
                            <li>Não possuem data de validade.</li>
                        </ul>
                        <p>Créditos Adquiridos (Pacotes Padrão):</p>
                        <ul>
                            <li>  Têm validade de 1 (um) ano a partir da data da compra.</li>
                        </ul>
                        <p>Créditos Mensais (provenientes de Assinatura):</p>
                        <ul>
                            <li>  São concedidos mensalmente e renovam-se automaticamente na data de cobrança do seu plano. Geralmente, créditos não utilizados em um mês não são acumulados para o mês seguinte.</li>
                        </ul>
                    </p>

                    <p className='att'>Última atualização: 08/01/2026</p>

                </div>
            </main>
            <VoltarAoTopoBtn />
            <Footer />
        </div>
    );
};

export default TermosCreditoePlanosPage;

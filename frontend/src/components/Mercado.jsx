import React, { useState, useEffect } from 'react';
import './style/Mercado.css';

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
 );

async function buscarCotacoes(setCotacoes, setErro) {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,ARS-BRL,PYG-BRL' );
        
        if (!response.ok) {
            throw new Error('Falha ao buscar dados da API');
        }
        const data = await response.json();

        const hoje = new Date();
        const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const dolar = data.USDBRL;
        const euro = data.EURBRL;
        const peso = data.ARSBRL;
        const guarani = data.PYGBRL;

        setCotacoes({
            dataAtualizacao: dataFormatada,
            dolar: {
                valor: parseFloat(dolar.bid).toFixed(2).replace('.', ','),
                variacao: `${parseFloat(dolar.pctChange) > 0 ? '+' : ''}${parseFloat(dolar.pctChange).toFixed(2).replace('.', ',')}%`
            },
            euro: {
                valor: parseFloat(euro.bid).toFixed(2).replace('.', ','),
                variacao: `${parseFloat(euro.pctChange) > 0 ? '+' : ''}${parseFloat(euro.pctChange).toFixed(2).replace('.', ',')}%`
            },
            peso: {
                valor: parseFloat(peso.bid).toFixed(4).replace('.', ','),
                variacao: `${parseFloat(peso.pctChange) > 0 ? '+' : ''}${parseFloat(peso.pctChange).toFixed(2).replace('.', ',')}%`
            },
            guarani: {
                valor: parseFloat(guarani.bid).toFixed(5).replace('.', ','),
                variacao: `${parseFloat(guarani.pctChange) > 0 ? '+' : ''}${parseFloat(guarani.pctChange).toFixed(2).replace('.', ',')}%`
            }
        });
        setErro(null);

    } catch (error) {
        console.error("Erro ao buscar cotações:", error);
        setErro("Não foi possível carregar os dados.");
    }
}

export default function Mercado() {
    const [isAberto, setAberto] = useState(false);
    const [cotacoes, setCotacoes] = useState({
        dataAtualizacao: "Carregando...",
        dolar: { valor: "...", variacao: "..." },
        euro: { valor: "...", variacao: "..." },
        peso: { valor: "...", variacao: "..." },
        guarani: { valor: "...", variacao: "..." }
    });
    const [erro, setErro] = useState(null);

    useEffect(() => {
        buscarCotacoes(setCotacoes, setErro);
        const intervalId = setInterval(() => buscarCotacoes(setCotacoes, setErro), 300000);
        return () => clearInterval(intervalId);
    }, []);

    const getVariacaoClass = (variacao) => {
        if (!variacao || !variacao.startsWith('+') && !variacao.startsWith('-')) return '';
        return variacao.startsWith('+') ? 'positivo' : 'negativo';
    };

    return (
        <div className="mercado-wrapper">
            <div className="mercado-header-mobile" onClick={() => setAberto(!isAberto)} role="button" aria-expanded={isAberto}>
                <h2>Mercado</h2>
                <span className={`mercado-arrow ${isAberto ? 'aberto' : ''}`}>
                    <ChevronDownIcon />
                </span>
            </div>

            <div className={`mercado-content ${isAberto ? 'aberto' : ''}`}>
                <div className="mercado-item atualizacao">
                    Atualizado em | <strong>{cotacoes.dataAtualizacao} </strong>
                </div>
                <div className="mercado-item">
                    <span className="label">USD/BRL</span>
                    <span className="valor">R${cotacoes.dolar.valor}</span>
                    <span className={`variacao ${getVariacaoClass(cotacoes.dolar.variacao)}`}>{cotacoes.dolar.variacao}</span>
                </div>
                <div className="mercado-item">
                    <span className="label">EUR/BRL</span>
                    <span className="valor">R${cotacoes.euro.valor}</span>
                    <span className={`variacao ${getVariacaoClass(cotacoes.euro.variacao)}`}>{cotacoes.euro.variacao}</span>
                </div>
                <div className="mercado-item">
                    <span className="label">ARS/BRL</span>
                    <span className="valor">R${cotacoes.peso.valor}</span>
                    <span className={`variacao ${getVariacaoClass(cotacoes.peso.variacao)}`}>{cotacoes.peso.variacao}</span>
                </div>
                <div className="mercado-item">
                    <span className="label">PYG/BRL</span>
                    <span className="valor">R${cotacoes.guarani.valor}</span>
                    <span className={`variacao ${getVariacaoClass(cotacoes.guarani.variacao)}`}>{cotacoes.guarani.variacao}</span>
                </div>
            </div>
        </div>
    );
}

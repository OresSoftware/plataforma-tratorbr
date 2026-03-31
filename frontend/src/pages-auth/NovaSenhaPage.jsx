import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/logo.png';
import './style/LoginPage.css';
import { solicitarRedefinicaoSenha } from '../services/apiPublicAuth';

const NovaSenhaPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await solicitarRedefinicaoSenha({ email });
            const apiMessage = response?.message || response?.msg || response?.mensagem;

            setSuccess(
                apiMessage || 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação para sua caixa de entrada.'
            );
            setEmail('');
        } catch (err) {
            console.error('Erro ao solicitar redefinição de senha:', err);

            if (err.code === 'ERR_NETWORK') {
                setError('Erro de conexão. Verifique sua internet e tente novamente.');
            } else {
                const apiMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data?.msg;
                setError(apiMessage || 'Não foi possível enviar o e-mail de recuperação. Tente novamente em instantes.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container auth--login" style={{ gridTemplateColumns: "1fr" }}>
                <header className="auth-header">
                    <button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Voltar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Voltar
                    </button>
                </header>

                <div className="form-section">
                    <div className="form-wrapper">
                        <h1 className="title-ethnocentric form-title" style={{ color: '#15383E' }}>NOVA SENHA</h1>
                        <p className="subtitle-montserrat form-subtitle">Informe seu e-mail para receber as instruções de recuperação de senha.</p>

                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}

                        <form onSubmit={handleSubmit}>
                            <input className="input-field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} autoComplete="email"/>

                            <button className="submit-button" type="submit" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar'}
                            </button>
                        </form>
                    </div>
                </div>

                <section className="info-section" style={{ display: 'none' }}>
                    <div className="text-center">
                        <h2 className="title-ethnocentric info-title">
                            RECUPERE SEU ACESSO
                        </h2>
                        <p className="subtitle-montserrat info-subtitle">
                            Lembrou sua senha? Volte para a área de login para acessar sua conta.
                        </p>
                        <Link to="/entrar" className="no-underline">
                            <button className="secondary-button">Ir para login</button>
                        </Link>
                    </div>
                    <Link to="/" onClick={() => window.scrollTo(0, 0)}><img src={logo} alt="Logo TratorBR" className="logo-image" />Voltar para a página inicial</Link>
                </section>
            </div>
        </div>
    );
};

export default NovaSenhaPage;

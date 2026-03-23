import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/logo.png';
import './style/LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginUsuario } from '../services/apiUserAuth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginUsuario({ email, senha });
            navigate('/gestao/dashboard', { replace: true });

        } catch (err) {
            console.error('Erro no login:', err);

            if (err.response?.status === 401 || err.response?.status === 404) {
                setError('E-mail ou senha incorretos. Tente novamente.');
            } else if (err.response?.status === 403) {
                setError('Sua conta está inativa ou bloqueada. Entre em contato com o suporte.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Erro de conexão. Verifique sua internet e tente novamente.');
            } else {
                const apiMessage = err.response?.data?.message || err.response?.data?.error;
                setError(apiMessage || 'Erro ao conectar com o servidor. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container auth--login">

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
                        <h1 className="title-ethnocentric form-title" style={{ color: '#15383E' }}>FAÇA O LOGIN</h1>
                        <p className="subtitle-montserrat" style={{ marginBottom: '2rem', color: '#555' }}>Seja Bem vindo(a) novamente! Acesse sua conta.</p>

                        {error && <p className="error-message">{error}</p>}

                        <form onSubmit={handleLogin}>
                            <input className="input-field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />

                            <div className="password-wrapper">
                                <input className="input-field" placeholder="Senha" type={showPassword ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={loading} />
                                <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)} role="button" tabIndex={0} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>

                            <button className="submit-button" type="submit" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>

                </div>
                <section className="info-section">
                    <div className="text-center">
                        <h2 className="title-ethnocentric info-title">
                            SEJA MUITO BEM-VINDO
                        </h2>
                        <p className="subtitle-montserrat info-subtitle">
                            Nunca se cadastrou na TratorBR, clique no botão abaixo para fazer o cadastro
                        </p>
                        <Link to="/cadastrar" className="no-underline">
                            <button className="secondary-button">Cadastre-se</button>
                        </Link>
                    </div>
                    <Link to="/" onClick={() => window.scrollTo(0, 0)}><img src={logo} alt="Logo TratorBR" className="logo-image" /></Link>
                </section>
            </div>
        </div>
    );
};

export default LoginPage;
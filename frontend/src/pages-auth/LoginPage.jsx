// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import logo from '/logo.png';
import './style/LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', { email, senha });
            localStorage.setItem('token', response.data.token);

            navigate(redirectTo, { replace: true });
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Dados incorretos. Verifique seu e-mail e senha.');
            } else if (err.response?.status === 403) {
                setError('Sua conta foi desativada. Entre em contato com o suporte.');
            } else {
                setError(err.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
            }
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
                            <input className="input-field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                            <div className="password-wrapper">
                                <input className="input-field" placeholder="Senha" type={showPassword ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} required />
                                <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}> {showPassword ? <FaEyeSlash /> : <FaEye />}</span>
                            </div>

                            <button className="submit-button" type="submit">Entrar</button>
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

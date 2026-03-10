// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '/logo.png';
import './style/LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


const RegisterPage = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/auth/register', { nome, email, senha });
      setSuccess('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    }
  };


  return (
    <div className="auth-page">

      <header className="auth-header">
        <button type="button" className="back-button back-button--white" onClick={() => navigate(-1)} aria-label="Voltar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
      </header>

      <main className="auth-container">
        <section className="info-section">
          <div className="text-center">
            <h2 className="title-ethnocentric info-title">
              BEM-VINDO NOVAMENTE
            </h2>
            <p className="subtitle-montserrat info-subtitle">
              Já se cadastrou na TratorBR? Clique abaixo para fazer o login.
            </p>
            <Link to="/entrar" className="no-underline">
              <button className="secondary-button">Faça o Login</button>
            </Link>
          </div>
           <Link to="/" onClick={() => window.scrollTo(0, 0)}><img src={logo} alt="Logo TratorBR" className="logo-image" /></Link>
        </section>

        <section className="form-section">
          <div className="form-wrapper">
            <h1 className="title-ethnocentric form-title">CADASTRE-SE</h1>
            <p className="subtitle-montserrat form-subtitle">
              O cadastro é rápido e fácil
            </p>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleRegister}>
              <input className="input-field" placeholder="Nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required aria-label="Nome" />

              <input className="input-field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />

              <div className="password-wrapper">
                <input className="input-field" placeholder="Senha" type={showPassword ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} required aria-label="Senha" />

                <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)} role="button" tabIndex={0} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="password-wrapper">
                <input className="input-field" placeholder="Confirmar Senha" type={showConfirmPassword ? "text" : "password"} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required aria-label="Confirmar senha" />

                <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} role="button" tabIndex={0} aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button className="submit-button" type="submit">
                Cadastrar
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>

  );
};

export default RegisterPage;

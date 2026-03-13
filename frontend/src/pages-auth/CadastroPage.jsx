import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastroUsuario } from '../services/apiUserCadastro';
import { getOcupacoes } from '../services/apiOcupacoes'; import logo from '/logo.png';
import './style/LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterPage = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [ocupacao_id, setOcupacao_id] = useState('');
  const [fone, setFone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [ocupacoes, setOcupacoes] = useState([]);
  const [loadingOcupacoes, setLoadingOcupacoes] = useState(true);

  useEffect(() => {
    const carregarOcupacoes = async () => {
      try {
        const dados = await getOcupacoes();
        setOcupacoes(dados);
      } catch (error) {
        console.error('Erro ao carregar ocupações:', error);
        setOcupacoes([]);
      } finally {
        setLoadingOcupacoes(false);
      }
    };

    carregarOcupacoes();
  }, []);

  const formatarTelefone = (valor) => {
    return valor.replace(/\D/g, '');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!firstname || !lastname || !email || !senha || !ocupacao_id || !fone) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (fone.length < 10) {
      setError('Telefone deve ter pelo menos 10 dígitos.');
      return;
    }

    setLoading(true);

    try {
      const resultado = await cadastroUsuario({
        firstname,
        lastname,
        ocupacao_id: parseInt(ocupacao_id),
        fone,
        email,
        senha
      });

      setSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para ativar a conta.');

      setFirstname('');
      setLastname('');
      setOcupacao_id('');
      setFone('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');

      setTimeout(() => navigate('/entrar'), 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
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
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            <img src={logo} alt="Logo TratorBR" className="logo-image" />
          </Link>
        </section>

        <section className="form-section">
          <div className="form-wrapper">
            <h1 className="title-ethnocentric form-title">CADASTRE-SE</h1>
            <p className="subtitle-montserrat form-subtitle">
              Preencha os dados abaixo para se cadastrar.
            </p>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleRegister}>
              <input className="input-field" placeholder="Nome" type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required aria-label="Nome" disabled={loading} />

              <input className="input-field" placeholder="Sobrenome" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required aria-label="Sobrenome" disabled={loading} />

              <div className="select-wrapper">
                <select className="input-field custom-select" value={ocupacao_id} onChange={(e) => setOcupacao_id(e.target.value)} required aria-label="Ramo de Atividade" disabled={loading || loadingOcupacoes}>
                  <option value="" disabled hidden>
                    {loadingOcupacoes ? 'Carregando...' : 'Selecione seu Ramo de Atividade'}
                  </option>
                  {ocupacoes.map((ocupacao) => (
                    <option className = "custom-drop" key={ocupacao.ocupacao_id} value={ocupacao.ocupacao_id}>
                      {ocupacao.name}
                    </option>
                  ))}
                </select>
              </div>

              <input className="input-field" placeholder="Telefone de Contato (apenas números)" type="tel" value={fone} onChange={(e) => setFone(formatarTelefone(e.target.value))} required aria-label="Telefone" disabled={loading}
              />

              <input className="input-field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required aria-label="Email" disabled={loading} />

              <div className="password-wrapper">
                <input className="input-field" placeholder="Senha" type={showPassword ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} required aria-label="Senha" disabled={loading} />
                <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)} role="button" tabIndex={0} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="password-wrapper">
                <input className="input-field" placeholder="Confirmar Senha" type={showConfirmPassword ? "text" : "password"} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required aria-label="Confirmar senha"
                  disabled={loading}
                />
                <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} role="button" tabIndex={0} aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button
                className="submit-button"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastroUsuario } from '../services/apiUserCadastro';
import { getOcupacoes } from '../services/apiOcupacoes';
import logo from '/logo.png';
import Select from 'react-select';
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
    if (!valor) return "";
    let v = valor.replace(/(?!^\+)\D/g, "");
    if (v.startsWith('+')) {
      let nums = v.replace(/\D/g, "");
      if (nums.length === 0) return "+";
      if (nums.length <= 2) return `+${nums}`;
      if (nums.length <= 4) return `+${nums.slice(0, 2)} (${nums.slice(2)}`;
      if (nums.length <= 8) return `+${nums.slice(0, 2)} (${nums.slice(2, 4)}) ${nums.slice(4)}`;
      if (nums.length <= 12) return `+${nums.slice(0, 2)} (${nums.slice(2, 4)}) ${nums.slice(4, 8)}-${nums.slice(8)}`;
      return `+${nums.slice(0, 2)} (${nums.slice(2, 4)}) ${nums.slice(4, 9)}-${nums.slice(9, 13)}`;
    }
    let nums = v.replace(/\D/g, "");
    if (nums.length === 0) return "";
    if (nums.length <= 2) return `(${nums}`;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstname || !lastname || !email || !senha || !ocupacao_id || !fone) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    const apenasNumerosTelefone = fone.replace(/\D/g, '');
    if (apenasNumerosTelefone.length < 10) {
      setError('Telefone deve ter pelo menos 10 dígitos.');
      return;
    }

    setLoading(true);

    try {
      await cadastroUsuario({
        firstname,
        lastname,
        ocupacao_id: parseInt(ocupacao_id),
        fone: fone.replace(/(?!^\+)\D/g, ""),
        email,
        senha
      });

      setSuccess('Falta pouco! Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (ou spam) para ativar sua conta.');

      setFirstname('');
      setLastname('');
      setOcupacao_id('');
      setFone('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');

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

  const handleCloseNotification = () => {
    setSuccess('');
    navigate('/entrar');
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
            <h2 className="title-ethnocentric info-title">BEM-VINDO NOVAMENTE</h2>
            <p className="subtitle-montserrat info-subtitle">Já se cadastrou na TratorBR? Clique abaixo para fazer o login.</p>
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
            <p className="subtitle-montserrat form-subtitle">Preencha os dados abaixo para se cadastrar.</p>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleRegister}>
              <input className="input-field" placeholder="Nome" type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required disabled={loading} />
              <input className="input-field" placeholder="Sobrenome" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required disabled={loading} />

              <div className="select-wrapper">
                <Select name="ocupacao" options={ocupacoes.map((ocp) => ({ value: ocp.ocupacao_id, label: ocp.name }))}
                  value={ocupacao_id ? { value: ocupacao_id, label: ocupacoes.find(o => o.ocupacao_id === parseInt(ocupacao_id))?.name } : null} onChange={(option) => setOcupacao_id(option?.value || '')}
                  placeholder="Selecione seu Ramo de Atividade" isDisabled={loading || loadingOcupacoes} isLoading={loadingOcupacoes} isClearable={false} isSearchable={false} classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({ ...base, borderRadius: '9999px', padding: '0.9rem 1rem', border: '1px solid #ccc', fontSize: '14px', fontFamily: "'Montserrat', sans-serif", cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '20px' }),
                    menu: (base) => ({ ...base, borderRadius: '8px', marginTop: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }),
                    option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#15383E' : state.isFocused ? '#f0f0f0' : '#fff', color: state.isSelected ? '#fff' : '#333', padding: '12px 16px', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" })
                  }}
                />
              </div>

              <input className="input-field" placeholder="Telefone de Contato (apenas números)" type="tel" value={fone} onChange={(e) => setFone(formatarTelefone(e.target.value))} required disabled={loading} />
              <input className="input-field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />

              <div className="password-wrapper">
                <input className="input-field" placeholder="Senha" type={showPassword ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={loading} />
                <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)} role="button" tabIndex={0}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="password-wrapper">
                <input className="input-field" placeholder="Confirmar Senha" type={showConfirmPassword ? "text" : "password"} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required disabled={loading} />
                <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} role="button" tabIndex={0}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </section>
      </main>

      {success && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">✉️</div>
            <h2 className="title-ethnocentric">Cadastro Concluído!</h2>

            <p className="subtitle-montserrat">
              Falta pouco! Enviamos um link de confirmação para o seu e-mail.
            </p>

            <div className="highlight-box">
              <strong>Por favor, verifique sua caixa de entrada (ou a pasta de spam) para ativar sua conta.</strong>
            </div>

            <button className="submit-button" onClick={handleCloseNotification}>
              Entendi, ir para o Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
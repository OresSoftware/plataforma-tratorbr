import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/AdminLoginPage.css';
import useNoindex from '../hooks/useNoindex';
import { apiAuth } from "../lib/api";

const AdminLoginPage = () => {
  useNoindex();

  const [formData, setFormData] = useState({ username: '', password: '', otp: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const body = {
        username: formData.username.trim(),
        password: formData.password,
        otp: formData.otp.trim(),
      };

      const { data } = await apiAuth.post("/admin/login", body);

      if (data?.token) localStorage.setItem('adminToken', data.token);
      if (data?.admin) localStorage.setItem('adminData', JSON.stringify(data.admin));

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erro ao fazer login';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1>FAÇA O LOGIN</h1>
            <p>Seja Bem vindo ao Sistema Interno! Acesse sua conta.</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Usuário" autoComplete="username" required />
            </div>

            <div className="form-group password-field">
              <input type={showPwd ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Senha" autoComplete="current-password" required aria-describedby="password-visibility-help" />
              <button type="button" className="password-toggle" aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPwd} onMouseDown={(e) => e.preventDefault()} onClick={() => setShowPwd(v => !v)} title={showPwd ? "Ocultar senha" : "Mostrar senha"}>

                {showPwd ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10.58 6.5A10.75 10.75 0 0 1 12 6c7 0 11 6 11 6s-1.07 1.82-3.07 3.5M6.53 6.53C3.9 8.35 2 12 2 12s4 6 10 6c1.2 0 2.34-.2 3.39-.57" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (

                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                )}
              </button>

              <span id="password-visibility-help" className="sr-only">
                Botão para alternar a visibilidade da senha
              </span>
            </div>

            <div className="form-group">
              <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Código 2FA (OTP)" inputMode="numeric" required />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

// src/pages/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/AdminLoginPage.css';
import { apiAuth } from "../lib/api"; // ✅ só o cliente "limpo" para login

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 👉 se o backend espera outros nomes de campo (ex.: email/senha), ajuste aqui:
      const body = {
        username: formData.username.trim(),
        password: formData.password,
        otp: formData.otp.trim(),
      };

      const { data } = await apiAuth.post("/admin/login", body);

      // Se o backend retorna token/admin no body:
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
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Usuário"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Senha"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Código 2FA (OTP)"
                inputMode="numeric"
                required
              />
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

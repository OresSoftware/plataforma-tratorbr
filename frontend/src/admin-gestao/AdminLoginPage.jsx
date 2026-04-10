// src/pages/AdminLoginPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/AdminLoginPage.css';
import useNoindex from '../hooks/useNoindex';
import { apiAuth } from "../lib/api"; 
import { getAdminHomeRoute } from "../utils/adminNavigation";

const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY ||
  import.meta.env.VITE_TURNSTILE_SITE_KEY ||
  '';

const AdminLoginPage = () => {
  useNoindex();

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);
  const navigate = useNavigate();
  const turnstileConfigured = Boolean(TURNSTILE_SITE_KEY);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !window.turnstile || !turnstileRef.current || widgetIdRef.current !== null) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        callback: (token) => {
          setTurnstileToken(token || '');
          setError('');
        },
        'expired-callback': () => setTurnstileToken(''),
        'timeout-callback': () => setTurnstileToken(''),
        'error-callback': () => {
          setTurnstileToken('');
          setError('Não foi possível validar o desafio de segurança agora.');
        },
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
      }
      widgetIdRef.current = null;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!turnstileConfigured) {
      setError('A validação de segurança do login não está configurada.');
      setLoading(false);
      return;
    }

    if (!turnstileToken) {
      setError('Confirme que você é humano antes de entrar.');
      setLoading(false);
      return;
    }

    try {
      const body = {
        identifier: formData.identifier.trim(),
        username: formData.identifier.trim(),
        password: formData.password,
        turnstileToken,
      };

      const { data } = await apiAuth.post("/admin/login", body);

      if (data?.token) localStorage.setItem('adminToken', data.token);
      if (data?.admin) localStorage.setItem('adminData', JSON.stringify(data.admin));

      navigate(getAdminHomeRoute(data?.admin || {}), { replace: true });
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
            <p>Seja bem-vindo ao Painel Administrativo! Acesse sua conta.</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="E-mail ou usuário"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group password-field">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Senha"
                autoComplete="current-password"
                required
                aria-describedby="password-visibility-help"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPwd}
                onMouseDown={(e) => e.preventDefault()} // mantém o foco no input
                onClick={() => setShowPwd(v => !v)}
                title={showPwd ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPwd ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10.58 6.5A10.75 10.75 0 0 1 12 6c7 0 11 6 11 6s-1.07 1.82-3.07 3.5M6.53 6.53C3.9 8.35 2 12 2 12s4 6 10 6c1.2 0 2.34-.2 3.39-.57" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  </svg>
                )}
              </button>
              <span id="password-visibility-help" className="sr-only">
                Botão para alternar a visibilidade da senha
              </span>
            </div>

            {turnstileConfigured ? (
              <div className="turnstile-wrap">
                <div ref={turnstileRef} className="turnstile-widget" />
              </div>
            ) : (
              <div className="error-message">
                A validação de segurança do login não está configurada.
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="admin-login-btn" disabled={loading || !turnstileConfigured}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

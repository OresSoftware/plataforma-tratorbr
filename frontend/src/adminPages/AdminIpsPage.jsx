import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Menu, X, LayoutDashboard, Users, MapPin, LogOut, Plus, Trash2, RefreshCw, MessageCircleQuestion } from "lucide-react";
import "../adminStyle/AdminDashboardPage.css";
import "../adminStyle/AdminIpsPage.css";

function isPrivateIp(ip) {
  if (!ip) return true;
  const s = String(ip).toLowerCase();
  if (s === '::1' || s === 'localhost') return true;
  if (s.startsWith('::ffff:')) return isPrivateIp(s.replace('::ffff:', ''));
  if (s.includes(':')) return s.startsWith('fc') || s.startsWith('fd');
  return (
    s.startsWith('10.') ||
    s.startsWith('192.168.') ||
    s.startsWith('127.') ||
    (s.startsWith('172.') && (() => {
      const b = parseInt(s.split('.')[1], 10);
      return b >= 16 && b <= 31;
    })())
  );
}

export default function AdminIpsPage() {
  const token = localStorage.getItem("adminToken");
  const admin = JSON.parse(localStorage.getItem("adminData") || "{}");
  if (!token) return <Navigate to="/admin/login" replace />;
  if (admin?.role !== "master") return <Navigate to="/admin/dashboard" replace />;

  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (path) => location.pathname.startsWith(path);
  const isMaster = admin?.role === 'master';

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [toast, setToast] = useState(null); // {type:'success'|'error', msg:string}
  const [refreshingId, setRefreshingId] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [qr, setQr] = useState(null);
  const [form, setForm] = useState({ targetRole: "master", ip: "", descricao: "" });
  const [salvandoIp, setSalvandoIp] = useState(false);
  const [pegandoMeuIp, setPegandoMeuIp] = useState(false);

  const [refreshingAll, setRefreshingAll] = useState(false);

  // tempos
  const MIN_SPIN_MS = 1200;     // giro mínimo do botão
  const TOAST_MS = 4500;        // ⬅️ tempo de exibição do toast

  const api = axios.create({ baseURL: "http://localhost:3001/api" });
  api.interceptors.request.use((cfg) => {
    cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });

  const carregar = async () => {
    setErro("");
    setLoading(true);
    try {
      const { data } = await api.get("/admin/ips-autorizados");
      const listaOrdenada = [...(data.ips || [])].sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1;
        if (a.role !== b.role) return a.role === "master" ? -1 : 1;
        return (a.descricao || "").localeCompare(b.descricao || "");
      });
      setLista(listaOrdenada);
    } catch (e) {
      setErro(e?.response?.data?.message || "Erro ao carregar IPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  // controla quanto tempo o toast fica visível
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  const adicionar = async (e) => {
    e.preventDefault();
    setErro(""); setQr(null); setSalvandoIp(true);
    try {
      const payload = { ip: form.ip.trim(), descricao: form.descricao?.trim() || "", targetRole: form.targetRole };
      const { data } = await api.post("/admin/ips-autorizados", payload);
      if (data.twofa) setQr(data.twofa);
      setForm({ targetRole: "master", ip: "", descricao: "" });
      setToast({ type: "success", msg: "IP adicionado com sucesso!" });
      carregar();
    } catch (e) {
      const m = e?.response?.data?.message || "Erro ao adicionar IP";
      setErro(m);
      setToast({ type: "error", msg: m });
    } finally {
      setSalvandoIp(false);
    }
  };

  const remover = async (id) => {
    if (!confirm("Tem certeza que deseja remover este IP?")) return;
    try {
      await api.delete(`/admin/ips-autorizados/${id}`);
      setToast({ type: "success", msg: "IP removido com sucesso!" });
      carregar();
    } catch (e) {
      const m = e?.response?.data?.message || "Erro ao remover IP";
      setToast({ type: "error", msg: m });
    }
  };

  const atualizarLocal = async (id) => {
    const startedAt = Date.now();
    let toastNext = null;
    try {
      setRefreshingId(id);
      const { data } = await api.post(`/admin/ips-autorizados/${id}/refresh-location`);
      toastNext = data?.skipped
        ? { type: "error", msg: "IP privado/localhost não possui geolocalização pública." }
        : { type: "success", msg: "Localização atualizada!" };
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      toastNext = status === 409
        ? { type: "error", msg: "Faltam colunas de localização: rode a migração no banco." }
        : { type: "error", msg: msg || "Não foi possível atualizar a localização agora" };
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, MIN_SPIN_MS - elapsed);
      await new Promise(r => setTimeout(r, wait));
      setRefreshingId(null);
      if (toastNext) setToast(toastNext);
      await carregar();
    }
  };

  const atualizarTodosLocais = async () => {
    const ipsPublicos = lista.filter(item => !isPrivateIp(item.ip));
    
    if (ipsPublicos.length === 0) {
      setToast({ type: "error", msg: "Nenhum IP público encontrado para atualizar." });
      return;
    }

    const startedAt = Date.now();
    setRefreshingAll(true);
    
    try {
      const promises = ipsPublicos.map(item => 
        api.post(`/admin/ips-autorizados/${item.id}/refresh-location`)
      );
      
      const results = await Promise.allSettled(promises);
      const sucessos = results.filter(r => r.status === 'fulfilled').length;
      const erros = results.filter(r => r.status === 'rejected').length;
      
      if (sucessos > 0 && erros === 0) {
        setToast({ type: "success", msg: `${sucessos} localizações atualizadas com sucesso!` });
      } else if (sucessos > 0 && erros > 0) {
        setToast({ type: "success", msg: `${sucessos} atualizadas, ${erros} falharam.` });
      } else {
        setToast({ type: "error", msg: "Falha ao atualizar localizações." });
      }
      
    } catch (e) {
      setToast({ type: "error", msg: "Erro ao atualizar localizações em lote." });
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, MIN_SPIN_MS - elapsed);
      await new Promise(r => setTimeout(r, wait));
      setRefreshingAll(false);
      await carregar();
    }
  };

  const pegarMeuIpPublico = async () => {
    try {
      setPegandoMeuIp(true);
      const r = await fetch("https://api.ipify.org?format=json");
      const j = await r.json();
      if (j?.ip) {
        setForm(f => ({ ...f, ip: j.ip }));
        setToast({ type: "success", msg: `Seu IP público é ${j.ip}` });
      } else {
        setToast({ type: "error", msg: "Não foi possível obter seu IP público agora." });
      }
    } catch {
      setToast({ type: "error", msg: "Falha ao consultar IP público (api.ipify.org)." });
    } finally {
      setPegandoMeuIp(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  const fecharModal = () => {
    setModalAberto(false);
    setQr(null);
    setErro("");
    setForm({ targetRole: "master", ip: "", descricao: "" });
  };

  return (
    <div className="admin-dashboard">
      <button className="hamburger-btn" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
        <Menu size={24} />
      </button>

      <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}>
        <button className="close-sidebar" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={22} /></button>
        <div className="sidebar-header"><h1>TRATOR BR</h1><p>Sistema Interno</p></div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${isActive("/admin/dashboard") ? "active" : ""}`} onClick={() => navigate("/admin/dashboard")}><LayoutDashboard className="nav-icon" size={22} />Dashboard</button>
          {isMaster && (
            <button className={`nav-item ${isActive("/admin/ips") ? "active" : ""}`} onClick={() => navigate("/admin/ips")}><MapPin className="nav-icon" size={22} />IP de Acesso</button>
          )}
          {isMaster && (
            <button
              className={`nav-item ${isActive('/admin/contato') ? 'active' : ''}`}
              onClick={() => navigate('/admin/contato')}
            >
              <MessageCircleQuestion className="nav-icon" size={22} />
              Contatos
            </button>
          )}
        </nav>
        <button className="sidebar-logout" onClick={logout}><LogOut className="nav-icon" size={22} />Sair</button>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <h1 className="page-title">IP de Acesso</h1>

          <div className="ip-header">
            <div className="ip-stats-card">
              <div className="ip-stats-icon"><MapPin size={20} /></div>
              <div className="ip-stats-content">
                <span className="ip-stats-label">Locais de Acesso</span>
                <span className="ip-stats-value">{lista.length}</span>
              </div>
            </div>
            <button className="ip-add-button" onClick={() => { setModalAberto(true); setQr(null); setErro(""); }}>
              <Plus size={20} /> Adicionar novo IP
            </button>
          </div>

          {loading ? (
            <div className="loading-container"><div className="loading-spinner"></div><p>Carregando IPs...</p></div>
          ) : erro ? (
            <div className="error-container">
              <p className="error-message">{erro}</p>
              <button className="retry-button" onClick={carregar}>Tentar novamente</button>
            </div>
          ) : (
            <div className="ip-table-container">
              <table className="ip-table">
                <thead>
                  <tr>
                    <th>IP</th>
                    <th>Administrador</th>
                    <th>Descrição</th>
                    <th className="local-header">
                      <div className="local-header-content">
                        <span>Local</span>
                        <button
                          className="refresh-all-btn"
                          onClick={atualizarTodosLocais}
                          disabled={refreshingAll || lista.filter(item => !isPrivateIp(item.ip)).length === 0}
                          title="Atualizar todas as localizações públicas"
                        >
                          <RefreshCw size={14} className={refreshingAll ? "spin" : ""} />
                        </button>
                      </div>
                    </th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((item) => {
                    const disableRefresh = isPrivateIp(item.ip);
                    return (
                      <tr key={item.id}>
                        <td className="ip-cell-highlight">{item.ip}</td>
                        <td className="admin-cell">{item.role === "master" ? "Master" : "Gestor"}</td>
                        <td className="description-cell">{item.descricao || "—"}</td>
                        <td className="location-cell">
                          <div className="loc-cell">
                            <span className="loc-text">{item.local || "—"}</span>
                            <button
                              className="loc-refresh-btn"
                              onClick={() => atualizarLocal(item.id)}
                              aria-label="Atualizar localização"
                              title={disableRefresh ? "IP privado/localhost não geolocalizável" : "Atualizar localização"}
                              disabled={disableRefresh || refreshingId === item.id}
                            >
                              <RefreshCw size={14} className={refreshingId === item.id ? "spin" : ""} />
                            </button>
                          </div>
                        </td>
                        <td className="status-cell">
                          <span className={`status-badge ${item.online ? "online" : "offline"}`}>{item.online ? "Online" : "Offline"}</span>
                        </td>
                        <td className="actions-cell">
                          <button className="delete-button" onClick={() => remover(item.id)} title="Remover IP"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                  {lista.length === 0 && <tr><td colSpan={6} className="empty-state">Nenhum IP cadastrado</td></tr>}
                </tbody>
              </table>

              <div className="ip-cards-container">
                {lista.map((item) => {
                  const disableRefresh = isPrivateIp(item.ip);
                  return (
                    <div key={item.id} className="ip-card">
                      <div className="ip-card-header">
                        <div className="ip-card-ip">{item.ip}</div>
                        <div className="ip-card-status">
                          <span className={`status-badge ${item.online ? "online" : "offline"}`}>{item.online ? "Online" : "Offline"}</span>
                        </div>
                      </div>

                      <div className="ip-card-body">
                        <div className="ip-card-field">
                          <span className="ip-card-label">Administrador</span>
                          <span className="ip-card-value">{item.role === "master" ? "Master" : "Gestor"}</span>
                        </div>

                        <div className="ip-card-field">
                          <span className="ip-card-label">Local</span>
                          <div className="loc-cell">
                            <span className="ip-card-value">{item.local || "—"}</span>
                            <button
                              className="loc-refresh-btn"
                              onClick={() => atualizarLocal(item.id)}
                              aria-label="Atualizar localização"
                              title={disableRefresh ? "IP privado/localhost não geolocalizável" : "Atualizar localização"}
                              disabled={disableRefresh || refreshingId === item.id}
                            >
                              <RefreshCw size={14} className={refreshingId === item.id ? "spin" : ""} />
                            </button>
                          </div>
                        </div>

                        <div className="ip-card-field" style={{ gridColumn: "1 / -1" }}>
                          <span className="ip-card-label">Descrição</span>
                          <span className="ip-card-value ip-card-description">{item.descricao || "—"}</span>
                        </div>
                      </div>

                      <div className="ip-card-actions">
                        <button className="delete-button" onClick={() => remover(item.id)} title="Remover IP"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
                {lista.length === 0 && <div className="empty-state">Nenhum IP cadastrado</div>}
              </div>
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}

      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar novo IP</h2>
              <button className="modal-close-button" onClick={fecharModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {!qr ? (
                <form onSubmit={adicionar} className="ip-form">
                  <div className="form-group">
                    <label htmlFor="targetRole">Perfil do Administrador</label>
                    <select id="targetRole" className="form-select" value={form.targetRole}
                      onChange={(e) => setForm((f) => ({ ...f, targetRole: e.target.value }))} required>
                      <option value="master">Master</option>
                      <option value="gestor">Gestor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ip">Endereço IP</label>
                    <div className="ip-input-container">
                      <input 
                        id="ip" 
                        type="text" 
                        className="form-input" 
                        value={form.ip}
                        onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value }))}
                        placeholder="Adicionar IP" 
                        required 
                      />
                      <button 
                        type="button" 
                        className="button-secondary ip-button" 
                        onClick={pegarMeuIpPublico}
                        disabled={pegandoMeuIp} 
                        title="Usar meu IP público atual"
                      >
                        {pegandoMeuIp ? "..." : "Meu IP"}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="descricao">Descrição (opcional)</label>
                    <input 
                      id="descricao" 
                      type="text" 
                      className="form-input" 
                      value={form.descricao}
                      onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} 
                      placeholder="Ex: Escritório principal" 
                    />
                  </div>
                  {erro && <div className="form-error">{erro}</div>}
                  <div className="form-actions">
                    <button type="button" className="button-secondary" onClick={fecharModal} disabled={salvandoIp}>
                      Cancelar
                    </button>
                    <button type="submit" className="button-primary" disabled={salvandoIp}>
                      {salvandoIp ? "Salvando..." : "Salvar e gerar QR"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="qr-section">
                  <div className="qr-header">
                    <h3>QR Code gerado com sucesso!</h3>
                    <p>Escaneie com seu aplicativo autenticador.</p>
                  </div>
                  <div className="qr-container">
                    <img src={qr.qr_data_url} alt="QR Code para 2FA" className="qr-image" />
                  </div>
                  <div className="qr-secret">
                    <details>
                      <summary>Mostrar código manual (backup)</summary>
                      <div className="secret-code">
                        <code>{qr.secret}</code>
                      </div>
                    </details>
                  </div>
                  <div className="form-actions">
                    <button className="button-primary full-width" onClick={fecharModal}>
                      Concluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


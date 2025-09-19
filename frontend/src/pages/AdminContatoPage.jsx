import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { apiAdminContatos } from "../services/apiAdminContatos";
import { Menu, X, LayoutDashboard, Users, MapPin, LogOut, MessageCircleQuestion } from "lucide-react";
import "./AdminContatoPage.css";

function soDigitos(v) {
  return String(v || "").replace(/\D/g, "");
}

function truncarTexto(texto, limite = 50) {
  if (!texto) return "";
  return texto.length > limite ? texto.substring(0, limite) + "..." : texto;
}

export default function AdminContatoPage() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contador, setContador] = useState(0);
  const [status, setStatus] = useState("pendente");
  const [modalAberto, setModalAberto] = useState(false);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // dados do admin salvos no login
  const admin = JSON.parse(localStorage.getItem('adminData') || '{}');
  const isMaster = admin?.role === 'master';

  // helper para destacar o item atual do menu
  const isActive = (path) => location.pathname.startsWith(path);

  async function carregar() {
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        apiAdminContatos.listar({ status }),
        apiAdminContatos.contadorPendentes(),
      ]);
      setItens(list.data || []);
      setContador(count.total || 0);
    } catch (err) {
      console.error("Erro ao carregar contatos", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [status]);

  function linkWhatsApp(nome, telefone) {
    const num = soDigitos(telefone);
    const txt = encodeURIComponent(`Oii ${nome}, tudo bem? Aqui é a TratorBR...`);
    return `https://wa.me/${num}?text=${txt}`;
  }

  function linkEmail(email, nome) {
    const subject = encodeURIComponent("TratorBR - Retorno da sua mensagem");
    const body = encodeURIComponent(`Oii ${nome}, tudo bem? Aqui é a TratorBR...\n\nRecebemos sua mensagem e vamos te ajudar.\n\n— Equipe TratorBR`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  async function handleRespondido(id, nome) {
    const confirmacao = window.confirm(
      `Você tem certeza que respondeu o email de ${nome}? Após isso será excluído.`
    );
    
    if (!confirmacao) return;

    try {
      await apiAdminContatos.excluir(id); // Excluir diretamente
      setItens((prev) => prev.filter((x) => x.id !== id));
      setContador((prev) => Math.max(0, prev - 1));
      setModalAberto(false); // Fechar modal se estiver aberto
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
      alert("Erro ao processar. Tente novamente.");
    }
  }

  async function handleExcluir(id) {
    if (!window.confirm("Deseja excluir este contato?")) return;
    try {
      await apiAdminContatos.excluir(id);
      setItens((prev) => prev.filter((x) => x.id !== id));
      setModalAberto(false); // Fechar modal se estiver aberto
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
    }
  }

  function abrirModal(contato) {
    setContatoSelecionado(contato);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setContatoSelecionado(null);
  }

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Botão hamburger (mobile) */}
      <button
        className="hamburger-btn"
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
        {/* Fechar (mobile) */}
        <button
          className="close-sidebar"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        >
          <X size={22} />
        </button>

        <div className="sidebar-header">
          <h1>TRATOR BR</h1>
          <p>Sistema Interno</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard className="nav-icon" size={22} />
            Dashboard
          </button>

          {isMaster && (
            <button
              className={`nav-item ${isActive('/admin/ips') ? 'active' : ''}`}
              onClick={() => navigate('/admin/ips')}
            >
              <MapPin className="nav-icon" size={22} />
              IP de Acesso
            </button>
          )}

          <button
            className={`nav-item ${isActive('/admin/contato') ? 'active' : ''}`}
            onClick={() => navigate('/admin/contato')}
          >
            <MessageCircleQuestion className="nav-icon" size={22} />
            Contatos
          </button>
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut className="nav-icon" size={22} />
          Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="duvidas-wrap">
          <header className="duvidas-header">
            <h1>Contatos</h1>

            <div className="duvidas-actions">
              <div className="badge">
                <p className="ped">Pendentes</p>
                <span className="count">{contador}</span>
              </div>
            </div>
          </header>

          <div className="duvidas-card">
            {/* Tabela para desktop */}
            <div className="table-container">
              <table className="duvidas-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Número</th>
                    <th>Mensagem</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="center">
                        Carregando…
                      </td>
                    </tr>
                  ) : itens.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="center">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    itens.map((c) => (
                      <tr key={c.id} className="table-row" onClick={() => abrirModal(c)}>
                        <td className="nome-cell">{c.nome}</td>
                        <td className="email-cell">{c.email}</td>
                        <td className="telefone-cell">{c.telefone}</td>
                        <td className="duvida-cell">{truncarTexto(c.mensagem, 30)}</td>
                        <td className="acoes-cell">
                          <div className="acoes">
                            <a
                              className="btn btn-whats"
                              href={linkWhatsApp(c.nome, c.telefone)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              WhatsApp
                            </a>
                            <a 
                              className="btn btn-mail" 
                              href={linkEmail(c.email, c.nome)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Email
                            </a>
                            {c.status !== "respondido" && (
                              <button
                                className="btn btn-ok"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRespondido(c.id, c.nome);
                                }}
                              >
                                Respondido
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Cards para mobile */}
            <div className="cards-container">
              {loading ? (
                <div className="center">Carregando…</div>
              ) : itens.length === 0 ? (
                <div className="center">Nenhum registro encontrado</div>
              ) : (
                itens.map((c) => (
                  <div key={c.id} className="contato-card" onClick={() => abrirModal(c)}>
                    <div className="card-header">
                      <h3>{c.nome}</h3>
                      <span className="card-telefone">{c.telefone}</span>
                    </div>
                    <div className="card-email">{c.email}</div>
                    <div className="card-duvida">{truncarTexto(c.mensagem, 50)}</div>
                    <div className="card-acoes">
                      <a
                        className="btn btn-whats"
                        href={linkWhatsApp(c.nome, c.telefone)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        WhatsApp
                      </a>
                      <a 
                        className="btn btn-mail" 
                        href={linkEmail(c.email, c.nome)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Email
                      </a>
                      {c.status !== "respondido" && (
                        <button
                          className="btn btn-ok"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRespondido(c.id, c.nome);
                          }}
                        >
                          Respondido
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalAberto && contatoSelecionado && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Contato</h2>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-field">
                <label>Nome:</label>
                <span>{contatoSelecionado.nome}</span>
              </div>
              
              <div className="modal-field">
                <label>Email:</label>
                <span>{contatoSelecionado.email}</span>
              </div>
              
              <div className="modal-field">
                <label>Telefone:</label>
                <span>{contatoSelecionado.telefone}</span>
              </div>
              
              <div className="modal-field">
                <label>Mensagem:</label>
                <p className="modal-mensagem">{contatoSelecionado.mensagem}</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <a
                className="btn btn-whats"
                href={linkWhatsApp(contatoSelecionado.nome, contatoSelecionado.telefone)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a 
                className="btn btn-mail" 
                href={linkEmail(contatoSelecionado.email, contatoSelecionado.nome)}
              >
                Email
              </a>
              {contatoSelecionado.status !== "respondido" && (
                <button
                  className="btn btn-ok"
                  onClick={() => handleRespondido(contatoSelecionado.id, contatoSelecionado.nome)}
                >
                  Respondido
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

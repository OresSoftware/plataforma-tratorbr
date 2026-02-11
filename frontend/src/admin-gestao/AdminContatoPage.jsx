import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiAdminContatos } from "../services/apiAdminContatos";
import AdminLayout from '../components/AdminLayout';
import useNoindex from '../hooks/useNoindex';
import "./style/AdminContatoPage.css";

function soDigitos(v) {
  return String(v || "").replace(/\D/g, "");
}

function truncarTexto(texto, limite = 50) {
  if (!texto) return "";
  return texto.length > limite ? texto.substring(0, limite) + "..." : texto;
}

function formatarDataHora(iso) {
  if (!iso) return "-";
  const dt = new Date(iso);
  return dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminContatoPage() {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;

  useNoindex();

  // listagem e estado geral
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // paginação simples (já preparado caso queira usar)
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // abas + contadores para badges
  const [status, setStatus] = useState("pendente"); // 'pendente' | 'respondido'
  const [pendentesTotal, setPendentesTotal] = useState(0);
  const [respondidosTotal, setRespondidosTotal] = useState(0);

  // modal de detalhes (o seu já existente)
  const [modalAberto, setModalAberto] = useState(false);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);

  // novo: modal para escolha do canal ao marcar respondido
  const [modalCanal, setModalCanal] = useState({ aberto: false, id: null, nome: "", canal: "whatsapp" });

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      // lista conforme aba
      const list = await apiAdminContatos.listar({ status, page, pageSize });
      setItens(list.data || []);
      setTotal(list.total || 0);

      // contadores para as tabs (badge)
      const [countPend, listRespondidosHead] = await Promise.all([
        apiAdminContatos.contadorPendentes().catch(() => ({ total: 0 })),
        // pedimos só o total de respondidos com pageSize=1
        apiAdminContatos.listar({ status: "respondido", page: 1, pageSize: 1 }).catch(() => ({ total: 0 })),
      ]);
      setPendentesTotal(Number(countPend?.total || 0));
      setRespondidosTotal(Number(listRespondidosHead?.total || 0));
    } catch (err) {
      console.error("Erro ao carregar contatos", err);
      setErro("Erro ao carregar contatos");
    }
    setLoading(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, pageSize]);

  function linkWhatsApp(nome, telefone) {
    const num = soDigitos(telefone);
    const txt = encodeURIComponent(`Oii ${nome}, tudo bem? Aqui é a TratorBR...`);
    return `https://wa.me/${num}?text=${txt}`;
  }

  function linkEmail(email, nome) {
    const subject = encodeURIComponent("TratorBR - Retorno da sua mensagem");
    const body = encodeURIComponent(
      `Oii ${nome}, tudo bem? Aqui é a TratorBR...\n\nRecebemos sua mensagem e vamos te ajudar.\n\n— Equipe TratorBR`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  // ABERTURA/FECHAMENTO dos modais
  function abrirModal(contato) {
    setContatoSelecionado(contato);
    setModalAberto(true);
  }
  function fecharModal() {
    setModalAberto(false);
    setContatoSelecionado(null);
  }

  // Novo fluxo: marcar como respondido -> abre modal de canal
  function abrirModalCanal(id, nome) {
    setModalCanal({ aberto: true, id, nome, canal: "whatsapp" });
  }
  function fecharModalCanal() {
    setModalCanal({ aberto: false, id: null, nome: "", canal: "whatsapp" });
  }

  async function confirmarRespondido() {
    try {
      // chama backend para marcar respondido com { canal }
      await apiAdminContatos.marcarRespondido(modalCanal.id, modalCanal.canal);
      fecharModalCanal();
      // recarrega os dados da aba atual e badges
      await carregar();
    } catch (err) {
      console.error("Erro ao marcar respondido:", err);
      alert("Erro ao marcar respondido. Tente novamente.");
    }
  }

  // Mantém o excluir (soft/hard delete) que você já tinha
  async function handleExcluir(id) {
    if (!window.confirm("Deseja excluir este contato?")) return;
    try {
      await apiAdminContatos.excluir(id);
      setItens((prev) => prev.filter((x) => x.id !== id));
      // atualiza badges também
      await carregar();
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
      alert("Erro ao processar. Tente novamente.");
    }
  }

  // chip de canal (UI simples)
  function CanalChip({ canal }) {
    if (!canal) return <span className="chip">-</span>;
    return (
      <span className={`chip ${canal === "whatsapp" ? "whatsapp" : "email"}`}>
        {canal === "whatsapp" ? "WhatsApp" : "E-mail"}
      </span>
    );
  }

  return (
    <AdminLayout>
      <div className="duvidas-wrap">
        <header className="duvidas-header">
          <h1>Contatos</h1>

          {/* Abas com badges */}
          <div className="tabs">
            <button
              className={status === "pendente" ? "on" : ""}
              onClick={() => { setPage(1); setStatus("pendente"); }}
            >
              Pendentes <span className="count">{pendentesTotal}</span>
            </button>
            <button
              className={status === "respondido" ? "on" : ""}
              onClick={() => { setPage(1); setStatus("respondido"); }}
            >
              Respondidos <span className="count">{respondidosTotal}</span>
            </button>
          </div>
        </header>

        {/* banner de erro */}
        {erro && (
          <div className="error-banner">
            {erro}
            <button onClick={carregar}>Tentar novamente</button>
          </div>
        )}

        <div className="duvidas-card">
          {/* Tabela para desktop */}
          <div className="table-container">
            <table className="duvidas-table">
              <thead>
                {status === "respondido" ? (
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Número</th>
                    <th>Mensagem</th>
                    <th>Canal</th>
                    {/* <th>Respondido por</th> */}
                    <th>Data/Hora</th>
                    <th>Ações</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Número</th>
                    <th>Mensagem</th>
                    <th>Ações</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={status === "respondido" ? 8 : 5} className="center">
                      Carregando…
                    </td>
                  </tr>
                ) : itens.length === 0 ? (
                  <tr>
                    <td colSpan={status === "respondido" ? 8 : 5} className="center">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : status === "respondido" ? (
                  // linhas da aba RESPONDIDOS
                  itens.map((c) => (
                    <tr key={c.id} className="table-row" onClick={() => abrirModal(c)}>
                      <td className="nome-cell">{c.nome}</td>
                      <td className="email-cell">{c.email}</td>
                      <td className="telefone-cell">{c.telefone}</td>
                      <td className="duvida-cell">{truncarTexto(c.mensagem, 30)}</td>
                      <td className="canal-cell">
                        <CanalChip canal={c.response_channel} />
                      </td>
                      {/* <td className="respby-cell">{c.responded_by ?? "-"}</td> */}
                      <td className="data-cell">{formatarDataHora(c.responded_at)}</td>
                      <td className="acoes-cell">
                        <div className="acoes" onClick={(e) => e.stopPropagation()}>
                          {/* <a
                            className="btn btn-whats"
                            href={linkWhatsApp(c.nome, c.telefone)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp
                          </a>
                          <a
                            className="btn btn-mail"
                            href={linkEmail(c.email, c.nome)}
                          >
                            Email
                          </a> */}
                          <button
                            className="btn btn-danger"
                            onClick={() => handleExcluir(c.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // linhas da aba PENDENTES
                  itens.map((c) => (
                    <tr key={c.id} className="table-row" onClick={() => abrirModal(c)}>
                      <td className="nome-cell">{c.nome}</td>
                      <td className="email-cell">{c.email}</td>
                      <td className="telefone-cell">{c.telefone}</td>
                      <td className="duvida-cell">{truncarTexto(c.mensagem, 30)}</td>
                      <td className="acoes-cell">
                        <div className="acoes" onClick={(e) => e.stopPropagation()}>
                          <a
                            className="btn btn-whats"
                            href={linkWhatsApp(c.nome, c.telefone)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp
                          </a>
                          <a
                            className="btn btn-mail"
                            href={linkEmail(c.email, c.nome)}
                          >
                            Email
                          </a>
                          <button
                            className="btn btn-ok"
                            onClick={() => abrirModalCanal(c.id, c.nome)}
                          >
                            Respondido
                          </button>
                          {/* <button
                            className="btn btn-danger"
                            onClick={() => handleExcluir(c.id)}
                          >
                            Excluir
                          </button> */}
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
            ) : status === "respondido" ? (
              itens.map((c) => (
                <div key={c.id} className="contato-card" onClick={() => abrirModal(c)}>
                  <div className="card-header">
                    <h3>{c.nome}</h3>
                    <span className="card-telefone">{c.telefone}</span>
                  </div>
                  <div className="card-email">{c.email}</div>
                  <div className="card-duvida">{truncarTexto(c.mensagem, 50)}</div>
                  <div className="card-meta">
                    Canal |  <CanalChip canal={c.response_channel} />
                  </div>
                  <div className="card-meta">
                    Respondido por |  <strong>{c.responded_by ?? "-"}</strong>
                  </div>
                  <div className="card-meta">
                    Data/Hora |  <strong>{formatarDataHora(c.responded_at)}</strong>
                  </div>
                  <div className="card-acoes" onClick={(e) => e.stopPropagation()}>
                    {/* <a
                      className="btn btn-whats"
                      href={linkWhatsApp(c.nome, c.telefone)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                    <a className="btn btn-mail" href={linkEmail(c.email, c.nome)}>
                      Email
                    </a> */}
                    <button className="btn btn-danger" onClick={() => handleExcluir(c.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            ) : (
              itens.map((c) => (
                <div key={c.id} className="contato-card" onClick={() => abrirModal(c)}>
                  <div className="card-header">
                    <h3>{c.nome}</h3>
                    <span className="card-telefone">{c.telefone}</span>
                  </div>
                  <div className="card-email">{c.email}</div>
                  <div className="card-duvida">{truncarTexto(c.mensagem, 50)}</div>
                  <div className="card-acoes" onClick={(e) => e.stopPropagation()}>
                    <a
                      className="btn btn-whats"
                      href={linkWhatsApp(c.nome, c.telefone)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                    <a className="btn btn-mail" href={linkEmail(c.email, c.nome)}>
                      Email
                    </a>
                    <button
                      className="btn btn-ok"
                      onClick={() => abrirModalCanal(c.id, c.nome)}
                    >
                      Respondido
                    </button>
                    {/* <button className="btn btn-danger" onClick={() => handleExcluir(c.id)}>
                      Excluir
                    </button> */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de DETALHES (o seu) */}
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

              {status === "respondido" && (
                <>
                  <div className="modal-field">
                    <label>Canal:</label>
                    <CanalChip canal={contatoSelecionado.response_channel} />
                  </div>
                  <div className="modal-field">
                    <label>Respondido por:</label>
                    <span>{contatoSelecionado.responded_by ?? "-"}</span>
                  </div>
                  <div className="modal-field">
                    <label>Data/Hora:</label>
                    <span>{formatarDataHora(contatoSelecionado.responded_at)}</span>
                  </div>
                </>
              )}
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
              {status === "pendente" && (
                <button
                  className="btn btn-ok"
                  onClick={() => abrirModalCanal(contatoSelecionado.id, contatoSelecionado.nome)}
                >
                  Marcar como Respondido
                </button>
              )}
              <button className="modal-close-2" onClick={fecharModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de CANAL (novo) */}
      {modalCanal.aberto && (
        <div className="modal-overlay" onClick={fecharModalCanal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Por onde você respondeu?</h2>
              <button className="modal-close" onClick={fecharModalCanal}>×</button>
            </div>

            <div className="modal-body">
              <p>Contato: <strong>{modalCanal.nome}</strong></p>
              <div className="modal-actions" style={{ gap: 16 }}>
                <label>
                  <input
                    type="radio"
                    name="canal"
                    value="whatsapp"
                    checked={modalCanal.canal === "whatsapp"}
                    onChange={() => setModalCanal((s) => ({ ...s, canal: "whatsapp" }))}
                  />{" "}
                  WhatsApp
                </label>
                <label>
                  <input
                    type="radio"
                    name="canal"
                    value="email"
                    checked={modalCanal.canal === "email"}
                    onChange={() => setModalCanal((s) => ({ ...s, canal: "email" }))}
                  />{" "}
                  E-mail
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={fecharModalCanal}>Cancelar</button>
              <button className="btn btn-ok" onClick={confirmarRespondido}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

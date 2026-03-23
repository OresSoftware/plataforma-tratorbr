import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Star, Trash2, Eye, EyeOff } from "lucide-react";
import { apiAvaliacoesAdmin } from "../services/apiAvaliacoes";
import AdminLayout from "../components/AdminLayout";
import useNoindex from "../hooks/useNoindex";
import "./style/AdminAvaliacoesPage.css"

function truncarTexto(texto, limite = 50) {
  if (!texto) return "";
  return texto.length > limite ? texto.substring(0, limite) + "..." : texto;
}

function formatarDataHora(iso) {
  if (!iso) return "-";
  const dt = new Date(iso);
  return dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function renderStars(count) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={16}
      className={i < count ? "star-filled" : "star-empty"}
      fill={i < count ? "currentColor" : "none"}
    />
  ));
}

function MediaEstrelas({ avaliacoes }) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return (
      <div className="media-estrelas-card">
        <div className="media-content">
          <h3>Média de Avaliações</h3>
          <p className="media-valor">-</p>
          <p className="media-info">Nenhuma avaliação</p>
        </div>
      </div>
    );
  }

  const totalEstrelas = avaliacoes.reduce((acc, av) => acc + (av.estrelas || 0), 0);
  const media = (totalEstrelas / avaliacoes.length).toFixed(1);

  return (
    <div className="media-estrelas-card">
      <div className="media-content">
        <h3>Média de Avaliações</h3>
        <div className="media-display">
          <p className="media-valor">{media}</p>
          <div className="media-stars">
            {renderStars(Math.round(parseFloat(media)))}
          </div>
        </div>
        <p className="media-info">
          {avaliacoes.length} avaliação{avaliacoes.length !== 1 ? "ões" : ""} • Total: {totalEstrelas} estrelas
        </p>
      </div>
    </div>
  );
}


export default function AdminAvaliacoesPage() {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;

  useNoindex();

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState("ativas");
  const [ativasTotal, setAtivasTotal] = useState(0);
  const [inativasTotal, setInativasTotal] = useState(0);
  const [todasAvaliacoes, setTodasAvaliacoes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      const list = await apiAvaliacoesAdmin.listar({ status, page, pageSize });
      setAvaliacoes(list.data || []);
      setTotal(list.total || 0);
      setTotalPages(list.totalPages || 0);

      const [listAtivas, listInativas, listTodas] = await Promise.all([
        apiAvaliacoesAdmin.listar({ status: "ativas", page: 1, pageSize: 1 }).catch(() => ({ total: 0 })),
        apiAvaliacoesAdmin.listar({ status: "inativas", page: 1, pageSize: 1 }).catch(() => ({ total: 0 })),
        apiAvaliacoesAdmin.listar({ status: "todos", page: 1, pageSize: 1000 }).catch(() => ({ data: [] })),
      ]);
      setAtivasTotal(Number(listAtivas?.total || 0));
      setInativasTotal(Number(listInativas?.total || 0));
      setTodasAvaliacoes(listTodas?.data || []);

      setAtivasTotal(Number(listAtivas?.total || 0));
      setInativasTotal(Number(listInativas?.total || 0));
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
      setErro("Erro ao carregar avaliações");
    }
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [status, page, pageSize]);

  function abrirModal(avaliacao) {
    setAvaliacaoSelecionada(avaliacao);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setAvaliacaoSelecionada(null);
  }

  async function handleToggleStatus(id, ativoAtual) {
    try {
      await apiAvaliacoesAdmin.atualizarStatus(id, !ativoAtual);
      await carregar();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro ao atualizar status. Tente novamente.");
    }
  }

  async function handleDeletar(id) {
    if (!window.confirm("Deseja deletar esta avaliação permanentemente?")) return;
    try {
      await apiAvaliacoesAdmin.deletar(id);
      await carregar();
    } catch (err) {
      console.error("Erro ao deletar avaliação:", err);
      alert("Erro ao deletar. Tente novamente.");
    }
  }

  function StarsDisplay({ count }) {
    return <div className="stars-display">{renderStars(count)}</div>;
  }

  return (
    <AdminLayout>
      <div className="avaliacoes-wrap">

        <header className="avaliacoes-header">
          <h1>Avaliações</h1>

          <div className="tabs">
            <button className={status === "todos" ? "on" : ""} onClick={() => { setPage(1); setStatus("todos"); }}>
              Todas <span className="count">{ativasTotal + inativasTotal}</span>
            </button>

            <button className={status === "ativas" ? "on" : ""} onClick={() => { setPage(1); setStatus("ativas"); }}>
              Ativas <span className="count">{ativasTotal}</span>
            </button>

            <button className={status === "inativas" ? "on" : ""} onClick={() => { setPage(1); setStatus("inativas"); }}>
              Inativas <span className="count">{inativasTotal}</span>
            </button>
          </div>

        </header>

        <MediaEstrelas avaliacoes={todasAvaliacoes} />

        {erro && (
          <div className="error-banner">
            {erro}
            <button onClick={carregar}>Tentar novamente</button>
          </div>
        )}

        <div className="avaliacoes-card">
          <div className="table-container">
            <table className="avaliacoes-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Nome</th>
                  <th>Estrelas</th>
                  <th style={{ textAlign: "left" }}>Mensagem</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="center">
                      Carregando…
                    </td>
                  </tr>
                ) : avaliacoes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="center">
                      Nenhuma avaliação encontrada
                    </td>
                  </tr>
                ) : (
                  avaliacoes.map((av) => (
                    <tr key={av.id} className="table-row" onClick={() => abrirModal(av)}>
                      <td className="nome-cell">{av.nome}</td>

                      <td className="stars-cell">
                        <StarsDisplay count={av.estrelas} />
                      </td>

                      <td className="mensagem-cell">{truncarTexto(av.mensagem, 40)}</td>

                      <td className="status-cell">
                        <span className={`status-badge ${av.ativo ? "ativa" : "inativa"}`}>
                          {av.ativo ? "Ativa" : "Inativa"}
                        </span>
                      </td>

                      <td className="data-cell">{formatarDataHora(av.data_criacao)}</td>

                      <td className="acoes-cell">
                        <div className="acoes" onClick={(e) => e.stopPropagation()}>
                          <button className={`btn btn-toggle ${av.ativo ? "btn-ativo" : "btn-inativo"}`} onClick={() => handleToggleStatus(av.id, av.ativo)} title={av.ativo ? "Desativar" : "Ativar"}>
                            {av.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>

                          <button className="btn btn-danger" onClick={() => handleDeletar(av.id)} title="Deletar">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="cards-container">
            {loading ? (
              <div className="center">Carregando…</div>
            ) : avaliacoes.length === 0 ? (
              <div className="center">Nenhuma avaliação encontrada</div>
            ) : (
              avaliacoes.map((av) => (
                <div key={av.id} className="avaliacao-card" onClick={() => abrirModal(av)}>
                  <div className="card-header">
                    <h3>{av.nome}</h3>
                    <span className={`status-badge ${av.ativo ? "ativa" : "inativa"}`}>
                      {av.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <div className="card-stars">
                    <StarsDisplay count={av.estrelas} />
                  </div>

                  <div className="card-mensagem">{truncarTexto(av.mensagem, 80)}</div>

                  <div className="card-data">{formatarDataHora(av.data_criacao)}</div>

                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button className={`btn btn-toggle ${av.ativo ? "btn-ativo" : "btn-inativo"}`} onClick={() => handleToggleStatus(av.id, av.ativo)}>
                      {av.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                      {av.ativo ? "Desativar" : "Ativar"}
                    </button>

                    <button className="btn btn-danger" onClick={() => handleDeletar(av.id)}>
                      <Trash2 size={18} />
                      Deletar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} >
              ← Anterior
            </button>
            <span className="page-info">
              Página {page} de {totalPages}
            </span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
              Próxima →
            </button>
          </div>
        )}
      </div>

      {modalAberto && avaliacaoSelecionada && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-btn" onClick={fecharModal}>
                ✕
              </button>
              <h2>Detalhes da Avaliação</h2>
            </div>

            <div className="modal-body">
              <div className="detail-group">
                <label>Nome:</label>
                <p>{avaliacaoSelecionada.nome}</p>
              </div>

              <div className="detail-group">
                <label>Classificação:</label>
                <p className="stars-large">
                  <StarsDisplay count={avaliacaoSelecionada.estrelas} />
                </p>
              </div>

              <div className="detail-group">
                <label>Mensagem:</label>
                <p className="mensagem-completa">{avaliacaoSelecionada.mensagem}</p>
              </div>

              <div className="detail-group">
                <label>Status:</label>
                <p>
                  <span className={`status-badge ${avaliacaoSelecionada.ativo ? "ativa" : "inativa"}`}>
                    {avaliacaoSelecionada.ativo ? "Ativa" : "Inativa"}
                  </span>
                </p>
              </div>

              <div className="detail-group">
                <label>Data de Criação:</label>
                <p>{formatarDataHora(avaliacaoSelecionada.data_criacao)}</p>
              </div>

              <div className="detail-group">
                <label>Última Atualização:</label>
                <p>{formatarDataHora(avaliacaoSelecionada.data_atualizacao)}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className={`btn btn-toggle ${avaliacaoSelecionada.ativo ? "btn-ativo" : "btn-inativo"}`} onClick={() => {
                handleToggleStatus(avaliacaoSelecionada.id, avaliacaoSelecionada.ativo);
                fecharModal();
              }}>
                {avaliacaoSelecionada.ativo ? "Desativar" : "Ativar"}
              </button>

              <button className="btn btn-danger" onClick={() => { handleDeletar(avaliacaoSelecionada.id); fecharModal(); }}>
                Deletar
              </button>
              <button className="btn btn-secondary" onClick={fecharModal}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

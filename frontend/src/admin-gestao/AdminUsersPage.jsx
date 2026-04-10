// frontend/src/admin-gestao/AdminUsersPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { apiAdminUsers } from "../services/apiAdminUsers";
import { api } from "../lib/api";
import AdminLayout from '../components/AdminLayout';
import "./style/AdminUsersPage.css";
import { Search, ChevronLeft, ChevronRight, Edit, Power, Key, User } from 'lucide-react';
import useNoindex from '../hooks/useNoindex';
import { solicitarRedefinicaoSenha } from "../services/apiPublicAuth";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  getLabel = (o) => o?.label ?? '',
  getValue = (o) => o?.value ?? '',
  placeholder = 'Selecione...',
  maxVisible = 5,
  allowClear = true,
}) => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const selected = options.find((o) => String(getValue(o)) === String(value)) || null;
  const norm = (s) => String(s || '').toLowerCase();
  const filtered = options.filter((o) => norm(getLabel(o)).includes(norm(term.trim())));

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setTerm('');
        setHighlight(-1);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlight] ?? filtered[0];
      if (opt) {
        onChange(String(getValue(opt)));
        setOpen(false);
        setTerm('');
        setHighlight(-1);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setTerm('');
      setHighlight(-1);
    }
  };

  const handlePick = (opt) => {
    onChange(String(getValue(opt)));
    setOpen(false);
    setTerm('');
    setHighlight(-1);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="ss-wrap" ref={wrapRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`ss-control ${open ? 'ss-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`ss-value ${selected ? '' : 'ss-placeholder'}`}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        <span className="ss-actions">
          {allowClear && selected && (
            <span className="ss-clear" title="Limpar" onClick={clearSelection}>×</span>
          )}
          <span className="ss-caret">▾</span>
        </span>
      </button>

      {open && (
        <div className="ss-dropdown" role="listbox" onMouseDown={(e) => e.preventDefault()}>
          <div className="ss-search">
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => { setTerm(e.target.value); setHighlight(-1); }}
              placeholder="Buscar..."
            />
          </div>
          <ul
            className="ss-options"
            style={{ maxHeight: `${maxVisible * 40}px`, overflowY: 'auto' }}
          >
            {filtered.length === 0 ? (
              <li className="ss-empty" aria-disabled="true">Nenhum resultado</li>
            ) : (
              filtered.map((opt, idx) => (
                <li
                  key={getValue(opt)}
                  className={`ss-option ${String(getValue(opt)) === String(value) ? 'is-selected' : ''} ${idx === highlight ? 'is-highlighted' : ''}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => handlePick(opt)}
                  role="option"
                >
                  {getLabel(opt)}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// ===== Dropdown simples (SEM busca) — mesmo visual do SearchableSelect =====
const SimpleSelect = ({
  options = [],
  value,
  onChange,
  getLabel = (o) => o?.label ?? '',
  getValue = (o) => o?.value ?? '',
  placeholder = 'Selecione...',
  maxVisible = 5,
  allowClear = true,
}) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = React.useRef(null);

  const selected = options.find((o) => String(getValue(o)) === String(value)) || null;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[highlight] ?? options[0];
      if (opt) {
        onChange(String(getValue(opt)));
        setOpen(false);
        setHighlight(-1);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    }
  };

  const handlePick = (opt) => {
    onChange(String(getValue(opt)));
    setOpen(false);
    setHighlight(-1);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="ss-wrap" ref={wrapRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`ss-control ${open ? 'ss-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`ss-value ${selected ? '' : 'ss-placeholder'}`}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        <span className="ss-actions">
          {allowClear && selected && (
            <span className="ss-clear" title="Limpar" onClick={clearSelection}>×</span>
          )}
          <span className="ss-caret">▾</span>
        </span>
      </button>

      {open && (
        <div className="ss-dropdown" role="listbox" onMouseDown={(e) => e.preventDefault()}>
          {/* sem barra de busca */}
          <ul
            className="ss-options"
            style={{ maxHeight: `${maxVisible * 40}px`, overflowY: 'auto' }}
          >
            {options.length === 0 ? (
              <li className="ss-empty" aria-disabled="true">Sem itens</li>
            ) : (
              options.map((opt, idx) => (
                <li
                  key={getValue(opt)}
                  className={`ss-option ${String(getValue(opt)) === String(value) ? 'is-selected' : ''} ${idx === highlight ? 'is-highlighted' : ''}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => handlePick(opt)}
                  role="option"
                >
                  {getLabel(opt)}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// Modal genérico
const Modal = ({ children, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// Helpers CPF
const formatarCPF = (valor) => {
  const numeros = String(valor || "").replace(/\D/g, '');
  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

const validarCPF = (cpf) => {
  if (!cpf) return true;
  const numeros = String(cpf).replace(/\D/g, '');
  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(numeros.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  let dv1 = resto >= 10 ? 0 : resto;
  if (dv1 !== parseInt(numeros.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(numeros.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  let dv2 = resto >= 10 ? 0 : resto;
  if (dv2 !== parseInt(numeros.charAt(10))) return false;
  return true;
};

const formatarData = (dataISO) => {
  if (!dataISO) return 'N/A';
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Modal aviso reset
const ModalAvisoReset = ({ nomeOuEmail, minutos, onClose }) => {
  return (
    <div className="modal-senha">
      <div className="modal-header">
        <h2>📧 Email de Redefinição Enviado</h2>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <p className="senha-info">Disparamos a mensagem de redefinição para:</p>
        <div className="email-box">{nomeOuEmail}</div>
        <div className="senha-aviso" style={{ marginTop: 12 }}>
          ⏱️ Este link expira em <strong>{minutos}</strong> {minutos === 1 ? 'minuto' : 'minutos'}.
        </div>
        <p style={{ marginTop: 16, color: "#4b5563" }}>
          Oriente o usuário a checar a caixa de entrada e também o spam/lixo eletrônico.
        </p>
      </div>
      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

const USER_GROUP_OPTIONS = [
  { value: '1', label: 'Administradores' },
  { value: '2', label: 'Funcionarios' },
  { value: '3', label: 'Usuarios - Gerente' },
  { value: '4', label: 'Usuarios - Padrão' },
];

const ACCESS_LEVEL_GROUP_MESSAGE =
  'Usuários com Nível de Acesso menor que 2 devem ser cadastrados como Usuário Padrão.';
const STANDARD_GROUP_ACCESS_LEVEL_MESSAGE =
  'Usuários do grupo Padrão devem possuir Nível de Acesso menor que 2. Ajuste o grupo do usuário ou selecione um nível de acesso compatível.';

export default function AdminUsersPage() {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;
  const admin = JSON.parse(localStorage.getItem("adminData") || "{}");
  const userGroupId = Number(admin?.user_group_id || 0);
  const isGlobalGroup = userGroupId === 1 || userGroupId === 2;
  const isManagerGroup = userGroupId === 3;
  const isStandardGroup = userGroupId === 4;

  useNoindex();

  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filtros
  const [status, setStatus] = useState('ativos'); // 'todos' | 'ativos' | 'inativos'
  const [busca, setBusca] = useState('');
  const [termoBuscado, setTermoBuscado] = useState('');

  // Datas (YYYY-MM-DD)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Ordenação
  const [sort, setSort] = useState('date_desc');

  // Filtros adicionais
  const [enterpriseId, setEnterpriseId] = useState('');
  const [cargoId, setCargoId] = useState('');
  const [cityId, setCityId] = useState('');

  // opções para selects
  const [empresas, setEmpresas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [cidades, setCidades] = useState([]);

  // contadores
  const [contadorAtivos, setContadorAtivos] = useState(0);
  const [contadorInativos, setContadorInativos] = useState(0);
  const [contadorTodos, setContadorTodos] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [avisoReset, setAvisoReset] = useState(null);

  // carregar opções dos selects
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [empRes, carRes, cidRes] = await Promise.all([
          isGlobalGroup || isManagerGroup
            ? api.get('/admin/enterprises', { params: { status: 'ativos', pageSize: 1000 } })
            : Promise.resolve({ data: { data: [] } }),
          !isStandardGroup
            ? api.get('/admin/cargos')
            : Promise.resolve({ data: { data: [] } }),
          api.get('/admin/cities', { params: { pageSize: 1000 } }),
        ]);
        setEmpresas(empRes.data.data || []);
        setCargos(carRes.data.data || []);
        setCidades(cidRes.data.data || []); // esperado: [{ city_id, name, code }]
      } catch (e) {
        console.error('Erro ao carregar filtros', e);
      }
    };
    loadOptions();
  }, [isGlobalGroup, isManagerGroup, isStandardGroup]);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiAdminUsers.listar({
        status,
        page,
        busca: termoBuscado,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        enterprise_id: enterpriseId || undefined,
        cargo_id: cargoId || undefined,
        city_id: cityId || undefined,
        sort,
      });
      setUsuarios(result.data || []);
      setTotalPages(Math.ceil(result.total / result.pageSize));
    } catch (err) {
      console.error("Erro ao carregar usuários", err);
      alert('Falha ao carregar usuários.');
    }
    setLoading(false);
  }, [status, page, termoBuscado, dateFrom, dateTo, enterpriseId, cargoId, cityId, sort]);

  // contadores
  const carregarContadores = useCallback(async () => {
    try {
      const at = await apiAdminUsers.contadorAtivos();
      setContadorAtivos(at.total || 0);

      const ina = await apiAdminUsers.listar({ status: 'inativos', page: 1, pageSize: 1, busca: '' });
      setContadorInativos(ina.total || 0);

      const tod = await apiAdminUsers.listar({ status: 'todos', page: 1, pageSize: 1, busca: '' });
      setContadorTodos(tod.total || 0);
    } catch (e) {
      console.error("Erro ao carregar contadores", e);
    }
  }, []);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);
  useEffect(() => { carregarContadores(); }, [carregarContadores]);
  useEffect(() => { carregarUsuarios(); }, [termoBuscado]);

  const handleBusca = (e) => {
    e.preventDefault();
    setPage(1);
    setTermoBuscado(busca);
  };

  const handleClearDates = () => {
    setDateFrom('');
    setDateTo('');
    setPage(1);
    carregarUsuarios();
  };

  const abrirModalDetalhes = (usuario) => {
    setUsuarioSelecionado(usuario);
    setModalContent('details');
    setModalAberto(true);
  };
  const abrirModalForm = async (usuario = null) => {
    if (!usuario?.user_id) {
      setUsuarioSelecionado(usuario);
      setModalContent('form');
      setModalAberto(true);
      return;
    }

    try {
      const result = await apiAdminUsers.buscarPorId(usuario.user_id);
      setUsuarioSelecionado(result.data || usuario);
      setModalContent('form');
      setModalAberto(true);
    } catch (error) {
      console.error('Erro ao carregar dados completos do usuário', error);
      alert('Falha ao carregar os dados do usuário para edição.');
    }
  };
  const fecharModal = () => {
    setModalAberto(false);
    setUsuarioSelecionado(null);
    setModalContent(null);
    setAvisoReset(null);
  };

  const handleSave = async (dadosUsuario) => {
    try {
      await apiAdminUsers.atualizar(usuarioSelecionado.user_id, dadosUsuario);
      fecharModal();
      setPage(1);
      await carregarUsuarios();
      await carregarContadores();
    } catch (error) {
      console.error('Erro ao salvar usuário', error);
      const mensagem = error.response?.data?.error || 'Falha ao salvar. Verifique os dados e tente novamente.';
      alert(mensagem);
    }
  };

  const canEditRow = (usuario) =>
    Number(usuario.user_id) === Number(admin?.user_id) || !isStandardGroup;
  const canResetRow = (usuario) =>
    isGlobalGroup || (isManagerGroup && Number(usuario.user_id) !== Number(admin?.user_id));
  const canToggleStatusRow = (usuario) =>
    isGlobalGroup || (isManagerGroup && Number(usuario.user_id) !== Number(admin?.user_id));

  const handleStatusToggle = async (usuario) => {
    const novoStatus = usuario.status ? 0 : 1;
    const confirmMessage = `Deseja ${novoStatus ? 'ativar' : 'desativar'} o usuário ${usuario.firstname} ${usuario.lastname}?`;
    if (window.confirm(confirmMessage)) {
      try {
        await apiAdminUsers.ativarDesativar(usuario.user_id, novoStatus);
        await carregarUsuarios();
        await carregarContadores();
      } catch (error) {
        console.error('Erro ao alterar status', error);
        alert('Falha ao alterar status.');
      }
    }
  };

  const extrairMinutosRestantes = (resp) => {
    if (!resp) return 30;
    if (typeof resp.expires_in_minutes === "number") return resp.expires_in_minutes;
    if (resp.expires_at) {
      const exp = new Date(resp.expires_at).getTime();
      const now = Date.now();
      const diffMin = Math.max(0, Math.round((exp - now) / 60000));
      return diffMin || 30;
    }
    return 30;
  };

  const handleResetSenha = async (usuario) => {
    const nomeCompleto = `${usuario.firstname || ''} ${usuario.lastname || ''}`.trim();
    const labelPessoa = nomeCompleto || (usuario.email || 'Usuário');
    const confirmMessage = `Deseja enviar o e-mail de redefinição de senha para ${labelPessoa}?`;
    if (!window.confirm(confirmMessage)) return;
    if (!usuario.email) {
      alert("Este usuário não possui e-mail cadastrado.");
      return;
    }
    try {
      const resp = await solicitarRedefinicaoSenha({ email: usuario.email });
      const minutos = extrairMinutosRestantes(resp);
      const nomeOuEmail = resp?.name || labelPessoa || usuario.email;
      setAvisoReset({ nomeOuEmail, minutos });
      setModalContent('aviso');
      setModalAberto(true);
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha', error);
      alert('Se o e-mail existir, enviaremos as instruções.');
    }
  };

  return (
    <AdminLayout>
      <div className="users-wrap">
        <header className="users-header">
          <h1>Usuarios</h1>
          <div className="users-actions">
            <div className="status-buttons">
              <button
                className={`btn ${status === 'todos' ? "btn-primary" : "btn-outline"}`}
                onClick={() => { setStatus('todos'); setPage(1); }}
              >
                Todos <span className="count">{contadorTodos}</span>
              </button>
              <button
                className={`btn ${status === 'ativos' ? "btn-success" : "btn-outline"}`}
                onClick={() => { setStatus('ativos'); setPage(1); }}
              >
                Ativos <span className="count">{contadorAtivos}</span>
              </button>
              <button
                className={`btn ${status === 'inativos' ? "btn-danger" : "btn-outline"}`}
                onClick={() => { setStatus('inativos'); setPage(1); }}
              >
                Inativos <span className="count">{contadorInativos}</span>
              </button>
            </div>
          </div>
        </header>

        {/* ======= FILTROS ======= */}
        <section className="filters-card">
          {/* Linha 1: Ordem | Cidade | Empresa | Cargo */}
          <div className="filters-row top-row">
            <div className="filter-col">
              <SimpleSelect
                value={sort}
                onChange={(val) => { setSort(val); setPage(1); }}
                options={[
                  { value: 'date_desc', label: 'Últimos cadastros' },
                  { value: 'date_asc',  label: 'Primeiros cadastros' },
                  { value: 'name_asc',  label: 'A–Z (Nome)' },
                  { value: 'name_desc', label: 'Z–A (Nome)' },
                ]}
                placeholder="Ordenar por"
                maxVisible={4}
              />
            </div>

            {(isGlobalGroup || isManagerGroup) && (
              <div className="filter-col">
                <SearchableSelect
                  options={empresas}
                  value={enterpriseId}
                  onChange={(val) => { setEnterpriseId(val); setPage(1); }}
                  getLabel={(e) => e?.fantasia ?? ''}
                  getValue={(e) => String(e?.enterprise_id)}
                  placeholder="Empresa"
                  maxVisible={5}
                />
              </div>
            )}

            {!isStandardGroup && (
              <div className="filter-col">
                <SimpleSelect
                  value={cargoId}
                  onChange={(val) => { setCargoId(val); setPage(1); }}
                  options={cargos.map(c => ({ value: String(c.cargo_id), label: c.name }))}
                  placeholder="Cargo"
                  maxVisible={6}
                />
              </div>
            )}
          </div>

          {/* Linha 2: Busca | De | Até | Limpar data */}
          <div className="filters-row bottom-row">
            <form className="search-col" onSubmit={handleBusca}>
              <input
                type="text"
                className="search-input"
                placeholder="Nome, Sobrenome, E-mail, CPF, Cargo, Empresa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <Search size={18} />
              </button>
            </form>

            <div className="date-col">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="dd/mm/aaaa"
              />
            </div>

            <div className="date-col">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="dd/mm/aaaa"
              />
            </div>

            <div className="clear-col">
              <button type="button" className="btn-clear-date" onClick={handleClearDates}>
                Limpar data
              </button>
            </div>
          </div>
        </section>

        <div className="users-card">
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Data de Cadastro</th>
                  <th>Empresa</th>
                  <th>Cargo</th>
                  {/* Cidade REMOVIDA da listagem */}
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="center">Carregando...</td></tr>
                ) : usuarios.length === 0 ? (
                  <tr><td colSpan={7} className="center">Nenhum usuário encontrado.</td></tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.user_id} className="table-row" onClick={() => abrirModalDetalhes(u)}>
                      <td className="nome-cell">{u.firstname} {u.lastname}</td>
                      <td>{u.email || 'N/A'}</td>
                      <td>{formatarData(u.date_added)}</td>
                      <td>{u.empresa_nome || 'Sem empresa'}</td>
                      <td>{u.cargo_nome || 'Sem cargo'}</td>
                      {/* Coluna de cidade removida */}
                      <td>
                        <span className={`status-badge ${u.status ? 'status-ativo' : 'status-inativo'}`}>
                          {u.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="acoes-cell">
                        <div className="acoes" onClick={(ev) => ev.stopPropagation()}>
                          <button className="btn-icon btn-edit" onClick={() => abrirModalForm(u)} title="Editar" disabled={!canEditRow(u)}>
                            <Edit size={16} />
                          </button>
                          {canResetRow(u) && (
                            <button className="btn-icon btn-reset" onClick={() => handleResetSenha(u)} title="Enviar redefinição por e-mail">
                              <Key size={16} />
                            </button>
                          )}
                          {canToggleStatusRow(u) && (
                            <button
                              className={`btn-icon ${u.status ? 'btn-deactivate' : 'btn-activate'}`}
                              onClick={() => handleStatusToggle(u)}
                              title={u.status ? 'Desativar' : 'Ativar'}
                            >
                              <Power size={16} />
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

          {/* Cards mobile */}
          <div className="cards-container">
            {loading ? (
              <div className="center">Carregando...</div>
            ) : usuarios.length === 0 ? (
              <div className="center">Nenhum usuário encontrado.</div>
            ) : (
              usuarios.map((u) => (
                <div key={u.user_id} className="user-card-mobile" onClick={() => abrirModalDetalhes(u)}>
                  <div className="card-header-mobile">
                    <div className="card-user-info">
                      <User size={40} />
                      <div>
                        <h3>{u.firstname} {u.lastname}</h3>
                        <p className="card-email">{u.email || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${u.status ? 'status-ativo' : 'status-inativo'}`}>
                      {u.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="card-info">
                    <p><strong>Empresa:</strong> {u.empresa_nome || 'Sem empresa'}</p>
                    <p><strong>Cargo:</strong> {u.cargo_nome || 'Sem cargo'}</p>
                    {/* Linha de cidade REMOVIDA dos cards */}
                    <p><strong>Cadastrado em:</strong> {formatarData(u.date_added)}</p>
                  </div>
                  <div className="card-acoes" onClick={(ev) => ev.stopPropagation()}>
                    <button className="btn btn-edit" onClick={() => abrirModalForm(u)} disabled={!canEditRow(u)}>
                      <Edit size={16} /> Editar
                    </button>
                    {canResetRow(u) && (
                      <button className="btn btn-reset" onClick={() => handleResetSenha(u)}>
                        <Key size={16} /> Enviar Redefinição
                      </button>
                    )}
                    {canToggleStatusRow(u) && (
                      <button
                        className={`btn ${u.status ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleStatusToggle(u)}
                      >
                        <Power size={16} /> {u.status ? 'Desativar' : 'Ativar'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} /> Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {modalAberto && (
        <Modal onClose={fecharModal}>
          {modalContent === 'details' && <DetalhesUsuario usuario={usuarioSelecionado} onClose={fecharModal} />}
          {modalContent === 'form' && <FormUsuario usuario={usuarioSelecionado} onSave={handleSave} onClose={fecharModal} admin={admin} />}
          {modalContent === 'aviso' && avisoReset && (
            <ModalAvisoReset
              nomeOuEmail={avisoReset.nomeOuEmail}
              minutos={avisoReset.minutos}
              onClose={fecharModal}
            />
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}

// Form de edição
const FormUsuario = ({ usuario, onSave, onClose, admin }) => {
  const [dados, setDados] = useState(usuario || {});
  const [empresas, setEmpresas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [ocupacoes, setOcupacoes] = useState([]);
  const [erroCPF, setErroCPF] = useState('');
  const userGroupId = Number(admin?.user_group_id || 0);
  const isGlobalGroup = userGroupId === 1 || userGroupId === 2;
  const isManagerGroup = userGroupId === 3;
  const isStandardGroup = userGroupId === 4;
  const isSelf = Number(admin?.user_id) === Number(usuario?.user_id);
  const canEditEnterpriseAndCargo = isGlobalGroup || (isManagerGroup && !isSelf);
  const canEditOccupation = !isStandardGroup;
  const cargoOptions = React.useMemo(() => {
    const currentCargoId = String(dados.cargo_id || '');
    const hasCurrentCargo = cargos.some((cargo) => String(cargo.cargo_id) === currentCargoId);

    if (!currentCargoId || hasCurrentCargo) {
      return cargos;
    }

    return [
      ...cargos,
      {
        cargo_id: currentCargoId,
        name: dados.cargo_nome || 'Nível atual',
        cargo_poder: dados.cargo_poder,
      },
    ];
  }, [cargos, dados.cargo_id, dados.cargo_nome, dados.cargo_poder]);
  const selectedCargo = cargoOptions.find((cargo) => String(cargo.cargo_id) === String(dados.cargo_id || ''));
  const selectedCargoPower = selectedCargo
    ? Number(selectedCargo.cargo_poder)
    : (typeof dados.cargo_poder !== 'undefined' ? Number(dados.cargo_poder) : null);
  const selectedUserGroupId = Number(dados.user_group_id || usuario?.user_group_id || 0);
  const invalidLowAccessNonStandard =
    selectedCargoPower !== null &&
    Number.isFinite(selectedCargoPower) &&
    selectedCargoPower < 2 &&
    selectedUserGroupId > 0 &&
    selectedUserGroupId !== 4;
  const invalidStandardHighAccess =
    selectedCargoPower !== null &&
    Number.isFinite(selectedCargoPower) &&
    selectedUserGroupId === 4 &&
    selectedCargoPower >= 2;
  const invalidAccessLevelGroup = invalidLowAccessNonStandard || invalidStandardHighAccess;
  const accessLevelGroupMessage = invalidStandardHighAccess
    ? STANDARD_GROUP_ACCESS_LEVEL_MESSAGE
    : invalidLowAccessNonStandard
      ? ACCESS_LEVEL_GROUP_MESSAGE
      : '';

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    try {
      const [empRes, carRes, ocuRes] = await Promise.all([
        canEditEnterpriseAndCargo
          ? api.get('/admin/enterprises', { params: { status: 'ativos', pageSize: 1000 } })
          : Promise.resolve({ data: { data: [] } }),
        !isStandardGroup
          ? api.get('/admin/cargos')
          : Promise.resolve({ data: { data: [] } }),
        api.get('/admin/ocupacoes')
      ]);
      setEmpresas(empRes.data.data || []);
      setCargos(carRes.data.data || []);
      setOcupacoes(ocuRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      const cpfFormatado = formatarCPF(value);
      setDados(prev => ({ ...prev, [name]: cpfFormatado }));
      if (cpfFormatado && !validarCPF(cpfFormatado)) setErroCPF('CPF inválido');
      else setErroCPF('');
    } else {
      setDados(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dados.cpf && !validarCPF(dados.cpf)) {
      alert('CPF inválido. Por favor, corrija antes de salvar.');
      return;
    }
    if (invalidAccessLevelGroup) {
      alert(accessLevelGroupMessage);
      return;
    }
    onSave(dados);
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="modal-header">
        <h2>Editar Usuário</h2>
        <button type="button" className="modal-close" onClick={onClose}>×</button>
      </div>

      <div className="modal-body">
        <div className="form-grid">
          <div className="form-field">
            <label>Nome *</label>
            <input name="firstname" value={dados.firstname || ''} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Sobrenome *</label>
            <input name="lastname" value={dados.lastname || ''} onChange={handleChange} required />
          </div>
          <div className="form-field full-width">
            <label>Email *</label>
            <input type="email" name="email" value={dados.email || ''} onChange={handleChange} required />
          </div>
          {isGlobalGroup && (
          <div className="form-field full-width">
            <label>Grupo de Usuário</label>
            <select name="user_group_id" value={dados.user_group_id || ''} onChange={handleChange}>
              <option value="">Selecione o grupo</option>
              {USER_GROUP_OPTIONS.map((group) => (
                <option key={group.value} value={group.value}>{group.label}</option>
              ))}
            </select>
            {invalidAccessLevelGroup && (
              <span className="error-message">{accessLevelGroupMessage}</span>
            )}
          </div>
          )}
          <div className="form-field">
            <label>Telefone</label>
            <input name="fone" value={dados.fone || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>CPF</label>
            <input
              name="cpf"
              value={dados.cpf || ''}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className={erroCPF ? 'input-error' : ''}
            />
            {erroCPF && <span className="error-message">{erroCPF}</span>}
          </div>
          <div className="form-field">
            <label>Empresa</label>
            {canEditEnterpriseAndCargo ? (
              <select name="enterprise_id" value={dados.enterprise_id || ''} onChange={handleChange}>
                <option value="">Sem empresa</option>
                {empresas.map(e => (
                  <option key={e.enterprise_id} value={e.enterprise_id}>{e.fantasia}</option>
                ))}
              </select>
            ) : (
              <input value={dados.empresa_nome || 'Sem empresa'} disabled readOnly />
            )}
          </div>
          <div className="form-field">
            <label>Nível de Acesso</label>
            {canEditEnterpriseAndCargo ? (
              <select name="cargo_id" value={dados.cargo_id || ''} onChange={handleChange}>
                <option value="">Selecione o nível de acesso</option>
                {cargoOptions.map(c => (
                  <option key={c.cargo_id} value={c.cargo_id}>
                    {`${c.name} (${c.cargo_poder ?? 'N/A'})`}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={
                  dados.cargo_nome
                    ? `${dados.cargo_nome} (${dados.cargo_poder ?? 'N/A'})`
                    : 'Sem nível de acesso'
                }
                disabled
                readOnly
              />
            )}
            {invalidAccessLevelGroup && (
              <span className="error-message">{accessLevelGroupMessage}</span>
            )}
          </div>
          <div className="form-field full-width">
            <label>Ramo de Atividade</label>
            {canEditOccupation ? (
              <select name="ocupacao_id" value={dados.ocupacao_id || ''} onChange={handleChange}>
                <option value="">Selecione o ramo de atividade</option>
                {ocupacoes.map(o => (
                  <option key={o.ocupacao_id} value={o.ocupacao_id}>{o.name}</option>
                ))}
              </select>
            ) : (
              <input value={dados.ocupacao_nome || 'Não informado'} disabled readOnly />
            )}
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={!!erroCPF || invalidAccessLevelGroup}>Salvar</button>
      </div>
    </form>
  );
};

// Detalhes
const DetalhesUsuario = ({ usuario, onClose }) => {
  const formatarData = (data) => {
    if (!data) return 'N/A';
    try { return new Date(data).toLocaleString('pt-BR'); }
    catch { return 'N/A'; }
  };

  return (
    <div className="modal-details">
      <div className="modal-header">
        <h2>{usuario.firstname} {usuario.lastname}</h2>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>

      <div className="modal-body">
        <div className="details-grid">
          <div className="detail-item"><label>Nome:</label><span>{usuario.firstname || 'N/A'}</span></div>
          <div className="detail-item"><label>Sobrenome:</label><span>{usuario.lastname || 'N/A'}</span></div>
          <div className="detail-item full-width"><label>Email:</label><span>{usuario.email || 'N/A'}</span></div>
          <div className="detail-item"><label>Telefone:</label><span>{usuario.fone || 'N/A'}</span></div>
          <div className="detail-item"><label>CPF:</label><span>{usuario.cpf || 'N/A'}</span></div>
          <div className="detail-item"><label>Empresa:</label><span>{usuario.empresa_nome || 'Sem empresa'}</span></div>
          <div className="detail-item"><label>Cargo:</label><span>{usuario.cargo_nome || 'Sem cargo'}</span></div>
          <div className="detail-item"><label>Ramo de Atividade:</label><span>{usuario.ocupacao_nome || 'Não informado'}</span></div>
          <div className="detail-item"><label>Cidade:</label><span>{usuario.cidade_nome ? `${usuario.cidade_nome} - ${usuario.cidade_uf}` : 'N/A'}</span></div>
          <div className="detail-item">
            <label>Status:</label>
            <span className={`status-badge ${usuario.status ? 'status-ativo' : 'status-inativo'}`}>{usuario.status ? 'Ativo' : 'Inativo'}</span>
          </div>
          <div className="detail-item"><label>Plano Válido Até:</label><span>{formatarData(usuario.plano_valido)}</span></div>
          <div className="detail-item"><label>Device ID:</label><span>{usuario.device_id || 'N/A'}</span></div>
          <div className="detail-item"><label>Data de Cadastro:</label><span>{formatarData(usuario.date_added)}</span></div>
          <div className="detail-item"><label>Última Modificação:</label><span>{formatarData(usuario.date_modified)}</span></div>
        </div>
      </div>
    </div>
  );
};

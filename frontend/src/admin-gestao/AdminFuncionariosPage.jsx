import React, { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../lib/api";
import AdminLayout from '../components/AdminLayout';
import "./style/AdminFuncionariosPage.css";
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, PlusCircle, X, Copy, Check, ChevronDown, Users, Eye, EyeOff } from 'lucide-react';

const useCopyToClipboard = (resetInterval = 2000) => {
  const [isCopied, setCopied] = useState(false);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), resetInterval);
    });
  }, [resetInterval]);

  return [isCopied, handleCopy];
};

const CopyButton = ({ text }) => {
  const [isCopied, handleCopy] = useCopyToClipboard();
  return (
    <button onClick={() => handleCopy(text)} className="copy-button" title="Copiar">
      {isCopied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};

const Modal = ({ children, onClose, title }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button onClick={onClose} className="close-button"><X size={24} /></button>
      </div>
      <div className="modal-body">
        {children}
      </div>
    </div>
  </div>
);

const FilterDropdown = ({ label, value, options, onChange, placeholder = "Selecione..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <div className="filter-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="filter-label">{label}</span>
        <span className="filter-value">{displayLabel}</span>
        <ChevronDown size={18} className={isOpen ? 'rotate' : ''} />
      </div>

      {isOpen && (
        <div className="filter-dropdown-menu">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`filter-dropdown-item ${opt.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminFuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
  const [busca, setBusca] = useState('');
  const [termoBuscado, setTermoBuscado] = useState('');
  const [funcaoFiltro, setFuncaoFiltro] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isCredentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    username: '',
    senha: '',
    role: 'funcionario',
    permissoes: []
  });
  const [paginas, setPaginas] = useState([]);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const carregarTotalFuncionarios = useCallback(async () => {
    try {
      const response = await api.get("/admin/funcionarios?page=1&pageSize=1");
      setTotalFuncionarios(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Erro ao carregar total de funcionários:", error);
    }
  }, []);

  const carregarFuncionarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        pageSize,
        busca: termoBuscado,
        funcao: funcaoFiltro
      });
      const response = await api.get(`/admin/funcionarios?${params}`);
      setFuncionarios(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      alert("Não foi possível carregar os funcionários.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, termoBuscado, funcaoFiltro]);

  const carregarPaginas = async () => {
    try {
      const response = await api.get("/admin/funcionarios/system-pages");
      setPaginas(response.data.data || []);
    } catch (error) {
      console.error("Erro ao carregar páginas do sistema:", error);
    }
  };

  useEffect(() => {
    carregarTotalFuncionarios();
    carregarFuncionarios();
  }, [carregarFuncionarios, carregarTotalFuncionarios]);

  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
      carregarPaginas();
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (pageId) => {
    setFormData(prev => {
      const newPermissoes = prev.permissoes.includes(pageId)
        ? prev.permissoes.filter(id => id !== pageId)
        : [...prev.permissoes, pageId];
      return { ...prev, permissoes: newPermissoes };
    });
  };

  const handleBusca = (e) => {
    e.preventDefault();
    setPage(1);
    setTermoBuscado(busca);
  };

  const handleCreateFuncionario = async (e) => {
    e.preventDefault();
    if (!formData.senha) {
      alert("O campo senha é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/admin/funcionarios", formData);
      setGeneratedCredentials({ ...response.data.data, senha: formData.senha });
      setCreateModalOpen(false);
      setCredentialsModalOpen(true);
      carregarFuncionarios();
      carregarTotalFuncionarios();
    } catch (error) {
      console.error("Erro ao criar funcionário:", error);
      const errorMessage = error.response?.data?.message || "Ocorreu um erro desconhecido.";
      alert(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalVisualizacao = async (funcionario) => {
    try {
      const response = await api.get(`/admin/funcionarios/${funcionario.id}`);
      const dados = response.data.data;
      setFuncionarioSelecionado(dados);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar funcionário:", error);
      alert("Não foi possível carregar os dados do funcionário.");
    }
  };

  const abrirModalEdicao = async (funcionario) => {
    try {
      const response = await api.get(`/admin/funcionarios/${funcionario.id}`);
      const dados = response.data.data;
      setFormData({
        nome: dados.nome || '',
        sobrenome: dados.sobrenome || '',
        email: dados.email || '',
        username: dados.username || '',
        senha: '',
        role: dados.role || 'funcionario',
        permissoes: dados.permissoes?.map(p => p.id) || []
      });
      setFuncionarioSelecionado(dados);
      setEditModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar funcionário:", error);
      alert("Não foi possível carregar os dados do funcionário.");
    }
  };

  const handleUpdateFuncionario = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/funcionarios/${funcionarioSelecionado.id}`, {
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        permissoes: formData.role === 'funcionario' ? formData.permissoes : []
      });
      setEditModalOpen(false);
      setFuncionarioSelecionado(null);
      carregarFuncionarios();
      alert("Funcionário atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      const errorMessage = error.response?.data?.message || "Ocorreu um erro desconhecido.";
      alert(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFuncionario = async (funcionario) => {
    if (window.confirm(`Tem certeza que deseja deletar o funcionário ${funcionario.nome}?`)) {
      setLoading(true);
      try {
        await api.delete(`/admin/funcionarios/${funcionario.id}`);
        carregarFuncionarios();
        carregarTotalFuncionarios();
        alert("Funcionário deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar funcionário:", error);
        alert("Não foi possível deletar o funcionário.");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetAndCloseCreateModal = () => {
    setFormData({
      nome: '', sobrenome: '', email: '', username: '', senha: '', role: 'funcionario', permissoes: []
    });
    setShowPassword(false);
    setCreateModalOpen(false);
  };

  const resetAndCloseEditModal = () => {
    setFormData({
      nome: '', sobrenome: '', email: '', username: '', senha: '', role: 'funcionario', permissoes: []
    });
    setFuncionarioSelecionado(null);
    setEditModalOpen(false);
  };

  const closeViewModal = () => {
    setFuncionarioSelecionado(null);
    setViewModalOpen(false);
  };

  const closeCredentialsModal = () => {
    setGeneratedCredentials(null);
    setCredentialsModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="admin-funcionarios-page">
        <header className="funcionarios-header">
          <h1>Gerenciamento</h1>

          <div className="btn-right">
            <div className="total-funcionarios-card">
              <Users size={24} />
              <div className="card-content">
                <span className="card-number">{totalFuncionarios}</span>
              </div>
            </div>

            <button onClick={() => setCreateModalOpen(true)} className="btn-primary">
              <PlusCircle size={18} />
              Novo Funcionário
            </button>
          </div>

        </header>

        <section className="filters-card">
          <div className="filters-row-func">
            <div className="filter-col">
              <form onSubmit={handleBusca} className="search-form-new">
                <input type="text" placeholder="Nome, Username, Email..." value={busca} onChange={e => setBusca(e.target.value)} />
                <button type="submit" className="search-button">
                  <Search size={20} />
                </button>
              </form>
            </div>

            <div className="filter-col">
              <FilterDropdown
                value={funcaoFiltro} onChange={(val) => { setFuncaoFiltro(val); setPage(1); }}
                options={[
                  { value: '', label: 'Todas as Funções' },
                  { value: 'master', label: 'Master' },
                  { value: 'funcionario', label: 'Funcionário' }
                ]}
                placeholder="Filtrar por Função"
              />
            </div>
          </div>
        </section>

        <div className="funcionarios-card">
          <div className="table-container">
            <table className="funcionarios-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="center">Carregando...</td></tr>
                ) : funcionarios.length === 0 ? (
                  <tr><td colSpan={5} className="center">Nenhum funcionário encontrado.</td></tr>
                ) : (
                  funcionarios.map((func) => (
                    <tr key={func.id} className="table-row" onClick={() => abrirModalVisualizacao(func)}>
                      <td>{func.nome} {func.sobrenome}</td>
                      <td>{func.username}</td>
                      <td>{func.email}</td>
                      <td>
                        <span className={`role-badge role-${func.role}`}>
                          {func.role === 'master' ? 'Master' : 'Funcionário'}
                        </span>
                      </td>
                      <td className="acoes-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="acoes">
                          <button className="btn-icon btn-edit" onClick={() => abrirModalEdicao(func)} title="Editar">
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDeleteFuncionario(func)} title="Deletar">
                            <Trash2 size={16} />
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
              <div className="center">Carregando...</div>
            ) : funcionarios.length === 0 ? (
              <div className="center">Nenhum funcionário encontrado.</div>
            ) : (
              funcionarios.map((func) => (
                <div key={func.id} className="funcionario-card-mobile" onClick={() => abrirModalVisualizacao(func)}>
                  <div className="card-header">
                    <div className="card-info-header">
                      <h3>{func.nome} {func.sobrenome}</h3>
                      <span className={`role-badge role-${func.role}`}>
                        {func.role === 'master' ? 'Master' : 'Funcionário'}
                      </span>
                    </div>
                  </div>
                  <div className="card-info">
                    <p><strong>Username:</strong> {func.username}</p>
                    <p><strong>Email:</strong> {func.email}</p>
                  </div>
                  <div className="card-acoes" onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-edit" onClick={() => abrirModalEdicao(func)}>
                      <Edit size={16} /> Editar
                    </button>
                    <button className="btn btn-delete" onClick={() => handleDeleteFuncionario(func)}>
                      <Trash2 size={16} /> Deletar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="page-info">Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        )}

        {isViewModalOpen && funcionarioSelecionado && (
          <Modal onClose={closeViewModal} title={`${funcionarioSelecionado.nome} ${funcionarioSelecionado.sobrenome}`}>
            <div className="view-modal-content">
              <div className="info-section-func">
                <div className="info-item">
                  <label>Nome Completo</label>
                  <p>{funcionarioSelecionado.nome} {funcionarioSelecionado.sobrenome}</p>
                </div>
                <div className="info-item">
                  <label>Username</label>
                  <p>{funcionarioSelecionado.username}</p>
                </div>
              </div>

              <div className="info-section-func">
                <div className="info-item">
                  <label>Email</label>
                  <p>{funcionarioSelecionado.email}</p>
                </div>
                <div className="info-item">
                  <label>Função</label>
                  <p>
                    <span className={`role-badge role-${funcionarioSelecionado.role}`}>
                      {funcionarioSelecionado.role === 'master' ? 'Master' : 'Funcionário'}
                    </span>
                  </p>
                </div>
              </div>

              {funcionarioSelecionado.role === 'funcionario' && funcionarioSelecionado.permissoes && funcionarioSelecionado.permissoes.length > 0 && (
                <div className="info-section-func">
                  <label className="info-item">Páginas que pode usar</label>
                  <div className="permissions-list">
                    {funcionarioSelecionado.permissoes.map(perm => (
                      <span key={perm.id} className="permission-badge">{perm.nome}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="info-section-func">
                <div className="info-item">
                  <label>Data de Cadastro</label>
                  <p>{funcionarioSelecionado.created_at ? new Date(funcionarioSelecionado.created_at).toLocaleString('pt-BR') : 'Não informado'}</p>
                </div>
                <div className="info-item">
                  <label>Último Login</label>
                  <p>{funcionarioSelecionado.ultimo_login ? new Date(funcionarioSelecionado.ultimo_login).toLocaleString('pt-BR') : 'Nunca fez login'}</p>
                </div>
              </div>

              <div className="info-section-func">
                <label className="info-item">Código 2FA</label>
                <div className="twofa-display">
                  <span className="code-value">{funcionarioSelecionado.twofa_secret}</span>
                  <CopyButton text={funcionarioSelecionado.twofa_secret} />
                </div>
              </div>

              <div className="form-actions-fuc">
                <button onClick={closeViewModal} className="submit-button">Fechar</button>
              </div>
            </div>
          </Modal>
        )}

        {isCreateModalOpen && (
          <Modal onClose={resetAndCloseCreateModal} title="Cadastrar Novo Funcionário">
            <form onSubmit={handleCreateFuncionario} className="form-funcionario">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Sobrenome</label>
                  <input type="text" name="sobrenome" value={formData.sobrenome} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Senha</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="senha"
                      value={formData.senha}
                      onChange={handleFormChange}
                      required
                      placeholder="Digite a senha"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Papel (Role)</label>
                  <select name="role" value={formData.role} onChange={handleFormChange}>
                    <option value="funcionario">Funcionário</option>
                    <option value="master">Master</option>
                  </select>
                </div>
              </div>

              {formData.role === 'funcionario' && (
                <div className="permissions-section">
                  <label className="permissions-title">Permissões de Páginas</label>
                  <div className="permissions-grid">
                    {paginas.map(pagina => (
                      <div key={pagina.id} className="permission-item">
                        <input type="checkbox" id={`page-${pagina.id}`} className="checkbox-permissao" checked={formData.permissoes.includes(pagina.id)} onChange={() => handlePermissionChange(pagina.id)} />
                        <label htmlFor={`page-${pagina.id}`}>{pagina.nome}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions-fuc">
                <button type="button" onClick={resetAndCloseCreateModal} className="cancel-button">Cancelar</button>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? "Salvando..." : "Salvar e Gerar 2FA"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {isEditModalOpen && funcionarioSelecionado && (
          <Modal onClose={resetAndCloseEditModal} title={`Editar Funcionário: ${funcionarioSelecionado.nome}`}>
            <form onSubmit={handleUpdateFuncionario} className="form-funcionario">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Sobrenome</label>
                  <input type="text" name="sobrenome" value={formData.sobrenome} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Papel (Role)</label>
                  <select name="role" value={formData.role} onChange={handleFormChange}>
                    <option value="funcionario">Funcionário</option>
                    <option value="master">Master</option>
                  </select>
                </div>
              </div>

              {formData.role === 'funcionario' && (
                <div className="permissions-section">
                  <label className="permissions-title">Permissões de Páginas</label>
                  <div className="permissions-grid">
                    {paginas.map(pagina => (
                      <div key={pagina.id} className="permission-item">
                        <input type="checkbox" id={`page-edit-${pagina.id}`} className="checkbox-permissao" checked={formData.permissoes.includes(pagina.id)} onChange={() => handlePermissionChange(pagina.id)} />
                        <label htmlFor={`page-edit-${pagina.id}`}>{pagina.nome}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="twofa-section">
                <label className="twofa-title">Código 2FA</label>
                <div className="twofa-code">
                  <span className="code-value">{funcionarioSelecionado.twofa_secret}</span>
                  <CopyButton text={funcionarioSelecionado.twofa_secret} />
                </div>
              </div>

              <div className="form-actions-fuc">
                <button type="button" onClick={resetAndCloseEditModal} className="cancel-button">Cancelar</button>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {isCredentialsModalOpen && generatedCredentials && (
          <Modal onClose={closeCredentialsModal} title="✅ Credenciais Geradas com Sucesso">
            <div className="credentials-modal">
              <p className="credentials-warning">Anote e envie as informações abaixo para o funcionário. <strong>A senha não será exibida novamente.</strong></p>

              <div className="credential-item">
                <label>Username</label>
                <div className="credential-value">
                  <span>{generatedCredentials.username}</span>
                  <CopyButton text={generatedCredentials.username} />
                </div>
              </div>

              <div className="credential-item">
                <label>Senha</label>
                <div className="credential-value">
                  <span>{generatedCredentials.senha}</span>
                  <CopyButton text={generatedCredentials.senha} />
                </div>
              </div>

              <hr />

              <p>Para configurar a Autenticação de Dois Fatores (2FA), o funcionário deve escanear o QR Code abaixo com um aplicativo autenticador (Google Authenticator, Authy, etc).</p>

              <div className="credential-qrcode">
                <img src={generatedCredentials.qrCode} alt="QR Code para 2FA" />
              </div>

              <p>Se não for possível escanear, use o código de configuração manual:</p>

              <div className="credential-item">
                <label>Código 2FA Manual</label>
                <div className="credential-value">
                  <span>{generatedCredentials.secret}</span>
                  <CopyButton text={generatedCredentials.secret} />
                </div>
              </div>

              <div className="form-actions-fuc">
                <button onClick={closeCredentialsModal} className="submit-button">Fechar</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}

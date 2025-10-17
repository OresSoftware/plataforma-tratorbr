import React, { useEffect, useState, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import { apiAdminEnterprises } from "../services/apiAdminEnterprises";
import { api } from "../lib/api";
import AdminLayout from '../components/AdminLayout';
import "./style/AdminEnterprisesPage.css";
import { Search, PlusCircle, ChevronLeft, ChevronRight, Edit, Power, ChevronDown } from 'lucide-react';

/** ===================== CNPJ UTILS (sanitize, validate, format) ===================== */
const sanitizeCNPJ = (value = "") => String(value).replace(/\D/g, "").slice(0, 14);

const isCNPJ = (value = "") => {
  const cnpj = sanitizeCNPJ(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDV = (base, pesos) => {
    const soma = base.split("").reduce((acc, d, i) => acc + Number(d) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const base12 = cnpj.slice(0, 12);
  const dv1 = calcDV(base12, pesos1);
  const dv2 = calcDV(base12 + String(dv1), pesos2);

  return cnpj.endsWith(String(dv1) + String(dv2));
};

const formatCNPJ = (value = "") => {
  const v = sanitizeCNPJ(value);
  if (v.length <= 2) return v;
  if (v.length <= 5) return v.replace(/(\d{2})(\d{1,3})/, "$1.$2");
  if (v.length <= 8) return v.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
  if (v.length <= 12) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4");
  return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5");
};
/** ==================================================================================== */

/** ===================== IE (Inscrição Estadual) – helpers simples ==================== */
const sanitizeIEInput = (value = "") => {
  const v = String(value || "");
  if (v.trim().toUpperCase() === "ISENTO") return "ISENTO";
  return v.replace(/\D/g, "").slice(0, 14);
};
/** ==================================================================================== */

// Outras máscaras
const formatPhone = (value) => {
  const numbers = String(value || "").replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14);
  }
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

const formatCEP = (value) => {
  const numbers = String(value || "").replace(/\D/g, '');
  return numbers
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

// Componente de Modal genérico
const Modal = ({ children, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// Componente de Dropdown Customizado para Cidades
const CityDropdown = ({ value, onChange, cidades, onSearchChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const cidadeSelecionada = cidades.find(c => c.city_id === parseInt(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  const handleSelect = (cityId) => {
    onChange({ target: { name: 'city_id', value: cityId } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="city-dropdown" ref={dropdownRef}>
      <div className="city-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{cidadeSelecionada ? `${cidadeSelecionada.name} - ${cidadeSelecionada.code}` : 'Selecione uma cidade'}</span>
        <ChevronDown size={18} className={isOpen ? 'rotate' : ''} />
      </div>

      {isOpen && (
        <div className="city-dropdown-menu">
          <div className="city-dropdown-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="city-dropdown-list">
            {cidades.length === 0 ? (
              <div className="city-dropdown-empty">Nenhuma cidade encontrada</div>
            ) : (
              cidades.slice(0, 100).map(cidade => (
                <div
                  key={cidade.city_id}
                  className={`city-dropdown-item ${cidade.city_id === parseInt(value) ? 'selected' : ''}`}
                  onClick={() => handleSelect(cidade.city_id)}
                >
                  {cidade.name} - {cidade.code}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminEnterprisesPage() {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filtro: 'ativos' | 'inativos'
  const [status, setStatus] = useState('ativos');

  const [busca, setBusca] = useState('');
  const [termoBuscado, setTermoBuscado] = useState('');

  // contadores para os botões
  const [contadorAtivos, setContadorAtivos] = useState(0);
  const [contadorInativos, setContadorInativos] = useState(0);
  const [contadorTodos, setContadorTodos] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  const carregarEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiAdminEnterprises.listar({ status, page, busca: termoBuscado });
      setEmpresas(result.data || []);
      setTotalPages(Math.ceil(result.total / result.pageSize));
    } catch (err) {
      console.error("Erro ao carregar empresas", err);
      alert('Falha ao carregar empresas.');
    }
    setLoading(false);
  }, [status, page, termoBuscado]);

  // carrega contadores: ativos via endpoint dedicado; inativos via listar (pageSize 1)
  const carregarContadores = useCallback(async () => {
    try {
      // ativos
      const atv = await apiAdminEnterprises.contadorAtivos();
      setContadorAtivos(atv.total || 0);

      // inativos - usa listar para pegar total
      const ina = await apiAdminEnterprises.listar({ status: 'inativos', page: 1, pageSize: 1, busca: '' });
      setContadorInativos(ina.total || 0);

      // todos (sem filtro de status)
      const todos = await apiAdminEnterprises.listar({ status: 'todos', page: 1, pageSize: 1, busca: '' });
      setContadorTodos(todos.total || 0);
    } catch (err) {
      console.error("Erro ao carregar contadores", err);
    }
  }, []);

  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

  useEffect(() => {
    carregarContadores();
  }, [carregarContadores]);

  const handleBusca = (e) => {
    e.preventDefault();
    setPage(1);
    setTermoBuscado(busca);
  };

  const abrirModalDetalhes = (empresa) => {
    setEmpresaSelecionada(empresa);
    setModalContent('details');
    setModalAberto(true);
  };

  const abrirModalForm = (empresa = null) => {
    const empresaFmt = empresa ? { ...empresa, cnpj: formatCNPJ(empresa.cnpj) } : null;
    setEmpresaSelecionada(empresaFmt);
    setModalContent('form');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEmpresaSelecionada(null);
    setModalContent(null);
  };

  const handleSave = async (dadosEmpresa) => {
    try {
      if (empresaSelecionada?.enterprise_id) {
        await apiAdminEnterprises.atualizar(empresaSelecionada.enterprise_id, dadosEmpresa);
      } else {
        await apiAdminEnterprises.criar(dadosEmpresa);
      }
      fecharModal();
      // recarrega lista e contadores
      setPage(1);
      await carregarEmpresas();
      await carregarContadores();
    } catch (error) {
      console.error('Erro ao salvar empresa', error);
      const mensagem = error.response?.data?.error || 'Falha ao salvar. Verifique os dados e tente novamente.';
      alert(mensagem);
    }
  };

  const handleStatusToggle = async (empresa) => {
    const novoStatus = empresa.ativo ? 0 : 1;
    const confirmMessage = `Deseja ${novoStatus ? 'ativar' : 'desativar'} a empresa ${empresa.fantasia}?`;
    if (window.confirm(confirmMessage)) {
      try {
        await apiAdminEnterprises.ativarDesativar(empresa.enterprise_id, novoStatus);
        await carregarEmpresas();
        await carregarContadores();
      } catch (error) {
        console.error('Erro ao alterar status', error);
        alert('Falha ao alterar status.');
      }
    }
  };

  // handlers dos botões de filtro
  const filtrarAtivos = () => {
    setPage(1);
    setStatus('ativos');
  };
  const filtrarInativos = () => {
    setPage(1);
    setStatus('inativos');
  };

  const isAtivos = status === 'ativos';
  const isInativos = status === 'inativos';

  return (
    <AdminLayout>
      <div className="enterprise-wrap">
        <header className="enterprise-header">
          <h1>Empresas</h1>
          <div className="enterprise-actions">
            {/* Botões de filtro com contadores */}
            <div className="status-buttons">
              <button
                className={`btn ${status === 'todos' ? "btn-primary" : "btn-outline"}`}
                onClick={() => setStatus('todos')}
              >
                Todos
                <span className="count">{contadorTodos}</span>
              </button>

              <button
                className={`btn ${status === 'ativos' ? "btn-success" : "btn-outline"}`}
                onClick={() => setStatus('ativos')}
              >
                Ativos
                <span className="count">{contadorAtivos}</span>
              </button>

              <button
                className={`btn ${status === 'inativos' ? "btn-danger" : "btn-outline"}`}
                onClick={() => setStatus('inativos')}
              >
                Inativos
                <span className="count">{contadorInativos}</span>
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => abrirModalForm()}>
              <PlusCircle size={18} />
              Nova Empresa
            </button>
          </div>
        </header>

        <div className="enterprise-filters">
          <form onSubmit={handleBusca} className="search-form">
            <input
              type="text"
              placeholder="Buscar por Razão, Fantasia, CNPJ, Bairro, Cidade, UF ou IE..."
              value={busca}
              onChange={e => e.target.value.length <= 100 && setBusca(e.target.value)}
            />
            <button type="submit"><Search size={20} /></button>
          </form>

          {/* removido o <select> de status; agora os botões fazem o filtro */}
        </div>

        <div className="enterprise-card">
          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Fantasia</th>
                  <th>CNPJ</th>
                  <th>IE</th>
                  <th>Cidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="center">Carregando...</td></tr>
                ) : empresas.length === 0 ? (
                  <tr><td colSpan={7} className="center">Nenhuma empresa encontrada.</td></tr>
                ) : (
                  empresas.map((e) => (
                    <tr key={e.enterprise_id} className="table-row" onClick={() => abrirModalDetalhes(e)}>
                      <td>
                        {e.logo ? (
                          <img src={e.logo} alt={e.fantasia} className="logo-thumb" />
                        ) : (
                          <div className="logo-placeholder">Sem logo</div>
                        )}
                      </td>
                      <td className="nome-cell">{e.fantasia || 'N/A'}</td>
                      <td>{e.cnpj ? formatCNPJ(e.cnpj) : 'N/A'}</td>
                      <td>{e.inscricao_estadual || 'N/A'}</td>
                      <td>{e.cidade_nome ? `${e.cidade_nome} - ${e.cidade_uf}` : 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${e.ativo ? 'status-ativo' : 'status-inativo'}`}>
                          {e.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="acoes-cell">
                        <div className="acoes">
                          <button
                            className="btn-icon btn-edit"
                            onClick={(ev) => { ev.stopPropagation(); abrirModalForm(e); }}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className={`btn-icon ${e.ativo ? 'btn-deactivate' : 'btn-activate'}`}
                            onClick={(ev) => { ev.stopPropagation(); handleStatusToggle(e); }}
                            title={e.ativo ? 'Desativar' : 'Ativar'}
                          >
                            <Power size={16} />
                          </button>
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
              <div className="center">Carregando...</div>
            ) : empresas.length === 0 ? (
              <div className="center">Nenhuma empresa encontrada.</div>
            ) : (
              empresas.map((e) => (
                <div key={e.enterprise_id} className="enterprise-card-mobile" onClick={() => abrirModalDetalhes(e)}>
                  <div className="card-header">
                    {e.logo && <img src={e.logo} alt={e.fantasia} className="logo-thumb-mobile" />}
                    <div>
                      <h3>{e.fantasia || 'N/A'}</h3>
                      <span className={`status-badge ${e.ativo ? 'status-ativo' : 'status-inativo'}`}>
                        {e.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="card-info">
                    <p><strong>CNPJ:</strong> {e.cnpj ? formatCNPJ(e.cnpj) : 'N/A'}</p>
                    <p><strong>IE:</strong> {e.inscricao_estadual || 'N/A'}</p>
                    <p><strong>Cidade:</strong> {e.cidade_nome ? `${e.cidade_nome} - ${e.cidade_uf}` : 'N/A'}</p>
                  </div>
                  <div className="card-acoes">
                    <button
                      className="btn btn-edit"
                      onClick={(ev) => { ev.stopPropagation(); abrirModalForm(e); }}
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      className={`btn ${e.ativo ? 'btn-deactivate' : 'btn-activate'}`}
                      onClick={(ev) => { ev.stopPropagation(); handleStatusToggle(e); }}
                    >
                      <Power size={16} /> {e.ativo ? 'Desativar' : 'Ativar'}
                    </button>
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
          {modalContent === 'details' && <DetalhesEmpresa empresa={empresaSelecionada} onClose={fecharModal} />}
          {modalContent === 'form' && <FormEmpresa empresa={empresaSelecionada} onSave={handleSave} onClose={fecharModal} />}
        </Modal>
      )}
    </AdminLayout>
  );
}

// Formulário de criação/edição com validação de CNPJ
const FormEmpresa = ({ empresa, onSave, onClose }) => {
  const [dados, setDados] = useState(empresa || { ativo: 1, inscricao_estadual: "" });
  const [cidades, setCidades] = useState([]);
  const [cnpjTouched, setCnpjTouched] = useState(false);

  useEffect(() => {
    carregarCidades('');
  }, []);

  const carregarCidades = async (busca) => {
    try {
      const { data } = await api.get('/admin/cities', { params: { busca } });
      setCidades(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar cidades', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (name === 'fone') {
      formattedValue = formatPhone(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
    } else if (name === 'inscricao_estadual') {
      formattedValue = sanitizeIEInput(value);
      if (formattedValue && formattedValue.length > 45) {
        formattedValue = formattedValue.slice(0, 45);
      }
    }

    setDados(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cnpjDigits = sanitizeCNPJ(dados.cnpj);
    if (!isCNPJ(cnpjDigits)) {
      setCnpjTouched(true);
      return;
    }
    const payload = { ...dados, cnpj: cnpjDigits };
    onSave(payload);
  };

  const cnpjDigits = sanitizeCNPJ(dados.cnpj);
  const cnpjValido = cnpjDigits.length === 14 && isCNPJ(cnpjDigits);

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="modal-header">
        <h2>{empresa ? 'Editar' : 'Nova'} Empresa</h2>
        <button type="button" className="modal-close" onClick={onClose}>×</button>
      </div>

      <div className="modal-body">
        <div className="form-grid">
          <div className="form-field">
            <label>Razão Social *</label>
            <input name="razao" value={dados.razao || ''} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Nome Fantasia *</label>
            <input name="fantasia" value={dados.fantasia || ''} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>CNPJ *</label>
            <input
              name="cnpj"
              value={dados.cnpj || ''}
              onChange={handleChange}
              onBlur={() => setCnpjTouched(true)}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              required
              aria-invalid={cnpjTouched && !cnpjValido}
            />
            {cnpjTouched && !cnpjValido && (
              <small style={{ color: "crimson" }}>CNPJ inválido</small>
            )}
          </div>

          <div className="form-field">
            <label>Inscrição Estadual</label>
            <input
              name="inscricao_estadual"
              value={dados.inscricao_estadual || ''}
              onChange={handleChange}
              placeholder="Digite a IE ou 'ISENTO'"
              maxLength={45}
            />
            <small className="hint">Digite apenas números (até 14) ou “ISENTO”.</small>
          </div>

          <div className="form-field full-width">
            <label>Endereço</label>
            <input name="endereco" value={dados.endereco || ''} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Bairro</label>
            <input name="bairro" value={dados.bairro || ''} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Número</label>
            <input name="numero" value={dados.numero || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Complemento</label>
            <input name="complemento" value={dados.complemento || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>CEP</label>
            <input
              name="cep"
              value={dados.cep || ''}
              onChange={handleChange}
              placeholder="00000-000"
            />
          </div>
          <div className="form-field">
            <label>Cidade</label>
            <CityDropdown
              value={dados.city_id || ''}
              onChange={handleChange}
              cidades={cidades}
              onSearchChange={carregarCidades}
            />
          </div>
          <div className="form-field">
            <label>Telefone</label>
            <input
              name="fone"
              value={dados.fone || ''}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" name="email" value={dados.email || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Site</label>
            <input type="url" name="site" value={dados.site || ''} onChange={handleChange} />
          </div>
          <div className="form-field full-width">
            <label>Logo (URL)</label>
            <input
              type="url"
              name="logo"
              value={dados.logo || ''}
              onChange={handleChange}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>
          <div className="form-field full-width">
            <label>Logo Representada (URL)</label>
            <input
              type="url"
              name="representada_logo"
              value={dados.representada_logo || ''}
              onChange={handleChange}
              placeholder="https://exemplo.com/representada.png"
            />
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={!cnpjValido}>Salvar</button>
      </div>
    </form>
  );
};

// Detalhes
const DetalhesEmpresa = ({ empresa, onClose }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const result = await apiAdminEnterprises.listarUsuariosDaEmpresa(empresa.enterprise_id);
      setUsuarios(result.data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  return (
    <div className="modal-details">
      <div className="modal-header">
        <h2>{empresa.fantasia || 'N/A'}</h2>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>

      <div className="modal-body">
        <div className="logos-container">
          {empresa.logo && (
            <div className="logo-detail">
              <label>Logo:</label>
              <img src={empresa.logo} alt="Logo" />
            </div>
          )}
          {empresa.representada_logo && (
            <div className="logo-detail">
              <label>Logo Representada:</label>
              <img src={empresa.representada_logo} alt="Logo Representada" />
            </div>
          )}
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <label>Nome Fantasia:</label>
            <span>{empresa.fantasia || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Razão Social:</label>
            <span>{empresa.razao || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>CNPJ:</label>
            <span>{empresa.cnpj || 'N/A'}</span>
          </div>

          <div className="detail-item">
            <label>Inscrição Estadual:</label>
            <span>{empresa.inscricao_estadual || 'N/A'}</span>
          </div>

          <div className="detail-item full-width">
            <label>Endereço:</label>
            <span>{empresa.endereco ? `${empresa.endereco}, ${empresa.numero || 's/n'}` : 'N/A'}</span>
          </div>

          <div className="detail-item">
            <label>Bairro:</label>
            <span>{empresa.bairro || 'N/A'}</span>
          </div>

          <div className="detail-item">
            <label>Complemento:</label>
            <span>{empresa.complemento || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>CEP:</label>
            <span>{empresa.cep || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Cidade:</label>
            <span>{empresa.cidade_nome ? `${empresa.cidade_nome} - ${empresa.cidade_uf}` : 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Telefone:</label>
            <span>{empresa.fone || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <span>{empresa.email || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Site:</label>
            <span>{empresa.site ? <a href={empresa.site} target="_blank" rel="noreferrer">{empresa.site}</a> : 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Status:</label>
            <span className={`status-badge ${empresa.ativo ? 'status-ativo' : 'status-inativo'}`}>
              {empresa.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        <div className="usuarios-vinculados">
          <h3>Usuários Vinculados ({usuarios.length})</h3>
          {loadingUsuarios ? (
            <p className="loading-text">Carregando usuários...</p>
          ) : usuarios.length === 0 ? (
            <p className="empty-text">Nenhum usuário vinculado a esta empresa.</p>
          ) : (
            <div className="usuarios-list">
              {usuarios.map((u) => (
                <div key={u.user_id} className="usuario-item">
                  <div className="usuario-info">
                    <strong>{u.firstname} {u.lastname}</strong>
                    <span className="usuario-email">{u.email}</span>
                    {u.cargo_nome && <span className="usuario-cargo">{u.cargo_nome}</span>}
                  </div>
                  <span className={`status-badge-small ${u.status ? 'status-ativo' : 'status-inativo'}`}>
                    {u.status ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

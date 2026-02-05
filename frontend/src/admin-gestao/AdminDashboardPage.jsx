import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import "./style/AdminDashboardPage.css";
import useNoindex from '../hooks/useNoindex';
import { apiAdminEnterprises } from "../services/apiAdminEnterprises";
import { apiAdminUsers } from "../services/apiAdminUsers";
import { apiAdminContatos } from "../services/apiAdminContatos";

import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  LineChart, Line, CartesianGrid, XAxis, YAxis
} from "recharts";

const PALETTE = [
  "#1E3A8A",
  "#2563EB",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#0EA5E9",
  "#0284C7",
  "#7DD3FC",
  "#38BDF8",
  "#A5F3FC"
];

const DIAS_JANELA = 30;
const PAGE_SIZE = 100;

function AdminDashboardPage() {
  useNoindex();

  const [metricas, setMetricas] = useState({
    empresasAtivas: 0,
    usuariosAtivos: 0,
    contatosPendentes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [pizzaUsuariosPorEmpresa, setPizzaUsuariosPorEmpresa] = useState([]);
  const [serieUsuariosPorDia, setSerieUsuariosPorDia] = useState([]);
  const [serieEmpresasPorDia, setSerieEmpresasPorDia] = useState([]);

  const [tipoLinha, setTipoLinha] = useState("usuarios");
  const navigate = useNavigate();

  useEffect(() => {
    carregarTudo();
  }, []);

  const hoje = useMemo(() => new Date(), []);
  const dd_mm_yyyy_iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => {
    const c = new Date(d);
    c.setDate(c.getDate() + n);
    return c;
  };

  const gerarLinhaDoTempo = (dias = DIAS_JANELA) => {
    const out = [];
    for (let i = dias - 1; i >= 0; i--) {
      const dia = addDays(hoje, -i);
      out.push(dd_mm_yyyy_iso(dia));
    }
    return out;
  };

  const formatarLabelBR = (iso) => {
    const [y, m, d] = String(iso).split("-");
    return `${d}/${m}/${y.slice(-2)}`;
  };

  const carregarContadores = async () => {
    const [empresas, usuarios, contatos] = await Promise.all([
      apiAdminEnterprises.contadorAtivos().catch(() => ({ total: 0 })),
      apiAdminUsers.contadorAtivos().catch(() => ({ total: 0 })),
      apiAdminContatos.contadorPendentes().catch(() => ({ total: 0 })),
    ]);
    setMetricas({
      empresasAtivas: Number(empresas?.total || 0),
      usuariosAtivos: Number(usuarios?.total || 0),
      contatosPendentes: Number(contatos?.total || 0),
    });
  };

  const listarTodosUsuarios = async () => {
    let page = 1;
    let total = 0;
    let acc = [];
    while (true) {
      const resp = await apiAdminUsers.listar({ page, pageSize: PAGE_SIZE, status: "todos", busca: "" });
      const rows = resp?.data || [];
      total = resp?.total || rows.length;
      acc = acc.concat(rows);
      if (acc.length >= total || rows.length < PAGE_SIZE) break;
      page++;
    }
    return acc;
  };

  const listarTodasEmpresas = async () => {
    let page = 1;
    let total = 0;
    let acc = [];
    while (true) {
      const resp = await apiAdminEnterprises.listar({ page, pageSize: PAGE_SIZE, status: "todos", busca: "" });
      const rows = resp?.data || [];
      total = resp?.total || rows.length;
      acc = acc.concat(rows);
      if (acc.length >= total || rows.length < PAGE_SIZE) break;
      page++;
    }
    return acc;
  };

  const montarPizzaUsuariosPorEmpresa = (usuarios) => {
    const mapa = new Map();
    for (const u of usuarios) {
      const nome = (u?.empresa_nome || "Sem empresa").trim() || "Sem empresa";
      mapa.set(nome, (mapa.get(nome) || 0) + 1);
    }
    const arr = Array.from(mapa, ([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);

    const TOP = 8;
    const top = arr.slice(0, TOP);
    const resto = arr.slice(TOP);
    const somaResto = resto.reduce((s, r) => s + r.value, 0);
    if (somaResto > 0) top.push({ name: "Outros", value: somaResto });
    return top;
  };

  const montarSeriePorDia = (items, campoData) => {
    const porDia = new Map();
    for (const it of items) {
      const raw = it?.[campoData];
      if (!raw) continue;
      const dia = String(raw).slice(0, 10);
      porDia.set(dia, (porDia.get(dia) || 0) + 1);
    }

    const linha = gerarLinhaDoTempo(DIAS_JANELA).map((d) => ({
      date: d,
      valor: porDia.get(d) || 0,
    }));
    return linha;
  };

  const carregarTudo = async () => {
    try {
      setLoading(true);
      setErro("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      await carregarContadores();

      const [usuarios, empresas] = await Promise.all([
        listarTodosUsuarios(),
        listarTodasEmpresas(),
      ]);

      setPizzaUsuariosPorEmpresa(montarPizzaUsuariosPorEmpresa(usuarios));
      setSerieUsuariosPorDia(montarSeriePorDia(usuarios, "date_added"));
      setSerieEmpresasPorDia(montarSeriePorDia(empresas, "created_at"));
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        navigate("/admin/login");
      } else {
        setErro("Erro ao carregar dados");
      }
    } finally {
      setLoading(false);
    }
  };

  const dadosLinha = tipoLinha === "usuarios" ? serieUsuariosPorDia : serieEmpresasPorDia;
  const tituloLinha = tipoLinha === "usuarios" ? "Cadastros de Usuários por dia" : "Cadastros de Empresas por dia";

  return (
    <AdminLayout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>

        {erro && (
          <div className="error-banner">
            {erro}
            <button onClick={carregarTudo}>Tentar novamente</button>
          </div>
        )}

        <div className="metricas-grid-simple">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner" />
              <p>Carregando...</p>
            </div>
          ) : (
            <>
              <div className="metrica-card">
                <h3>Usuários no App</h3>
                <div className="metrica-valor">{metricas.usuariosAtivos || 0}</div>
                <p className="metrica-desc">Ativos</p>
              </div>

              <div className="metrica-card">
                <h3>Empresas Cadastradas</h3>
                <div className="metrica-valor">{metricas.empresasAtivas || 0}</div>
                <p className="metrica-desc">Ativas</p>
              </div>

              <div className="metrica-card">
                <h3>Contatos Pendentes</h3>
                <div className="metrica-valor">{metricas.contatosPendentes || 0}</div>
                <p className="metrica-desc">Aguardando resposta</p>
              </div>
            </>
          )}
        </div>

        <div className="graficos-grid">
          <div className="grafico-card">
            <div className="grafico-header">
              <h3>Usuários por Empresa</h3>
              <p className="grafico-subtitle">Distribuição (Top empresas + Outros)</p>
            </div>
            <div className="grafico-area">
              {loading ? (
                <div className="loading-message">
                  <div className="loading-spinner" />
                  <p>Carregando gráfico...</p>
                </div>
              ) : pizzaUsuariosPorEmpresa.length === 0 ? (
                <p className="empty">Sem dados para exibir</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={pizzaUsuariosPorEmpresa} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {pizzaUsuariosPorEmpresa.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Linha */}
          <div className="grafico-card">
            <div className="grafico-header grafico-header-row">
              <div>
                <h3>{tituloLinha}</h3>
                <p className="grafico-subtitle">Últimos {DIAS_JANELA} dias</p>
              </div>
              <div className="toggle-linha">
                <button
                  className={tipoLinha === "usuarios" ? "on" : ""}
                  onClick={() => setTipoLinha("usuarios")}
                >
                  Usuários
                </button>
                <button
                  className={tipoLinha === "empresas" ? "on" : ""}
                  onClick={() => setTipoLinha("empresas")}
                >
                  Empresas
                </button>
              </div>
            </div>
            <div className="grafico-area">
              {loading ? (
                <div className="loading-message">
                  <div className="loading-spinner" />
                  <p>Carregando gráfico...</p>
                </div>
              ) : dadosLinha.length === 0 ? (
                <p className="empty">Sem dados para exibir</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={dadosLinha} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatarLabelBR} />
                    <YAxis allowDecimals={false} />
                    <ReTooltip labelFormatter={formatarLabelBR} />
                    <Line type="monotone" dataKey="valor" stroke="#409535" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboardPage;

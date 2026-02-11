import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import "./style/AdminDashboardPage.css";
import useNoindex from '../hooks/useNoindex';
import { apiAdminEnterprises } from "../services/apiAdminEnterprises";
import { apiAdminUsers } from "../services/apiAdminUsers";
import { apiAdminContatos } from "../services/apiAdminContatos";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  LineChart, Line, CartesianGrid, XAxis, YAxis
} from "recharts";

const PALETTE = ["#1E3A8A", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#0EA5E9", "#0284C7", "#7DD3FC", "#38BDF8", "#A5F3FC"];
const PAGE_SIZE = 100;

const FILTROS_TEMPO = [
  { label: "7 Dias", qtd: 7, unidade: "dia" },
  { label: "1 Mês", qtd: 30, unidade: "dia" },
  { label: "6 Meses", qtd: 6, unidade: "mes" },
  { label: "1 Ano", qtd: 12, unidade: "mes" },
];

function AdminDashboardPage() {
  useNoindex();
  const navigate = useNavigate();

  const [metricas, setMetricas] = useState({ empresasAtivas: 0, usuariosAtivos: 0, contatosPendentes: 0 });
  const [rawUsuarios, setRawUsuarios] = useState([]);
  const [rawEmpresas, setRawEmpresas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [tipoLinha, setTipoLinha] = useState("usuarios");
  const [filtroTempo, setFiltroTempo] = useState(FILTROS_TEMPO[1]);

  const [filtroCrescimento, setFiltroCrescimento] = useState("30d"); // '30d' | '1a'

  const [metricasAvancadas, setMetricasAvancadas] = useState({
    topDias: [],
    growth30d: { users: 0, companies: 0 },
    growth1a: { users: 0, companies: 0 }
  });
  const [pizzaData, setPizzaData] = useState([]);
  const [linhaData, setLinhaData] = useState([]);

  const formatarLabelX = (isoDate) => {
    if (!isoDate) return "";
    if (filtroTempo.unidade === "dia") {
      const [y, m, d] = isoDate.split("-");
      return `${d}/${m}`;
    } else {
      const [y, m] = isoDate.split("-");
      const date = new Date(Number(y), Number(m) - 1, 1);
      const mesNome = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      return `${mesNome}/${y.slice(-2)}`;
    }
  };

  const gerarTimeline = useCallback(() => {
    const keys = [];
    const hoje = new Date();
    const qtd = filtroTempo.qtd;
    if (filtroTempo.unidade === "dia") {
      for (let i = qtd - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(hoje.getDate() - i);
        keys.push(d.toISOString().slice(0, 10));
      }
    } else {
      for (let i = qtd - 1; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        keys.push(`${ano}-${mes}`);
      }
    }
    return keys;
  }, [filtroTempo]);

  const processarDadosLinha = useCallback((lista, campoData) => {
    if (!lista || lista.length === 0) return [];
    const contagem = new Map();
    for (const item of lista) {
      const dataBruta = item?.[campoData];
      if (!dataBruta) continue;
      let chave;
      if (filtroTempo.unidade === "dia") {
        chave = String(dataBruta).slice(0, 10);
      } else {
        chave = String(dataBruta).slice(0, 7);
      }
      contagem.set(chave, (contagem.get(chave) || 0) + 1);
    }
    const timeline = gerarTimeline();
    return timeline.map(dataKey => ({
      date: dataKey,
      valor: contagem.get(dataKey) || 0
    }));
  }, [filtroTempo, gerarTimeline]);

  const processarPizza = (lista) => {
    const mapa = new Map();
    for (const u of lista) {
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

  const calcularMetricasAvancadas = useCallback((users, enterprises) => {
    const hoje = new Date();
    const d30 = new Date(); d30.setDate(hoje.getDate() - 30);
    const d60 = new Date(); d60.setDate(hoje.getDate() - 60);
    const d365 = new Date(); d365.setDate(hoje.getDate() - 365);
    const d730 = new Date(); d730.setDate(hoje.getDate() - 730);

    const diasContador = [0, 0, 0, 0, 0, 0, 0];
    const todosRegistros = [...users.map(u => u.date_added), ...enterprises.map(e => e.created_at)];
    todosRegistros.forEach(dataString => {
      if (!dataString) return;
      const diaSemana = new Date(dataString).getDay();
      diasContador[diaSemana]++;
    });
    const nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const diasRankeados = diasContador
      .map((total, index) => ({ dia: nomesDias[index], total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 2)
      .filter(d => d.total > 0);

    const calcGrowth = (lista, campo, startCurrent, startPrev, endPrev) => {
      const current = lista.filter(i => { const d = new Date(i[campo]); return d >= startCurrent; }).length;
      const prev = lista.filter(i => { const d = new Date(i[campo]); return d >= startPrev && d < endPrev; }).length;

      if (prev > 0) return (((current - prev) / prev) * 100).toFixed(1);
      if (current > 0) return "100";
      return "0";
    };

    setMetricasAvancadas({
      topDias: diasRankeados.map(d => d.dia),
      growth30d: {
        users: calcGrowth(users, 'date_added', d30, d60, d30),
        companies: calcGrowth(enterprises, 'created_at', d30, d60, d30)
      },
      growth1a: {
        users: calcGrowth(users, 'date_added', d365, d730, d365),
        companies: calcGrowth(enterprises, 'created_at', d365, d730, d365)
      }
    });

  }, []);

  useEffect(() => { carregarTudo(); }, []);

  useEffect(() => {
    const listaAlvo = tipoLinha === "usuarios" ? rawUsuarios : rawEmpresas;
    const campoData = tipoLinha === "usuarios" ? "date_added" : "created_at";
    setLinhaData(processarDadosLinha(listaAlvo, campoData));

    if (rawUsuarios.length > 0 || rawEmpresas.length > 0) {
      calcularMetricasAvancadas(rawUsuarios, rawEmpresas);
    }
  }, [tipoLinha, filtroTempo, rawUsuarios, rawEmpresas, processarDadosLinha, calcularMetricasAvancadas]);

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

  const listarTodos = async (apiMetodo) => {
    let page = 1; let total = 0; let acc = [];
    while (true) {
      const resp = await apiMetodo({ page, pageSize: PAGE_SIZE, status: "todos", busca: "" });
      const rows = resp?.data || [];
      total = resp?.total || rows.length;
      acc = acc.concat(rows);
      if (acc.length >= total || rows.length < PAGE_SIZE) break;
      page++;
    }
    return acc;
  };

  const carregarTudo = async () => {
    try {
      setLoading(true); setErro("");
      const token = localStorage.getItem("adminToken");
      if (!token) { navigate("/admin/login"); return; }
      await carregarContadores();
      const [users, enterprises] = await Promise.all([
        listarTodos(apiAdminUsers.listar),
        listarTodos(apiAdminEnterprises.listar),
      ]);
      setRawUsuarios(users);
      setRawEmpresas(enterprises);
      setPizzaData(processarPizza(users));
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("adminToken"); navigate("/admin/login");
      } else { setErro("Erro ao carregar dados."); }
    } finally { setLoading(false); }
  };

  const currentGrowth = filtroCrescimento === '30d' ? metricasAvancadas.growth30d : metricasAvancadas.growth1a;
  const labelGrowth = filtroCrescimento === '30d' ? 'vs. últimos 30 dias' : 'vs. ano anterior';

  return (
    <AdminLayout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        {erro && <div className="error-banner">{erro} <button onClick={carregarTudo}>Tentar novamente</button></div>}

        <div className="metricas-layout-custom">

          <div className="metrica-card card-upper">
            <h3>Usuários</h3>
            <div className="metrica-valor">{metricas.usuariosAtivos}</div>
            <p className="metrica-desc">Total Ativos</p>
          </div>

          <div className="metrica-card card-upper">
            <h3>Empresas</h3>
            <div className="metrica-valor">{metricas.empresasAtivas}</div>
            <p className="metrica-desc">Total Cadastradas</p>
          </div>

          <div className="metrica-card card-upper">
            <h3>Contatos</h3>
            <div className="metrica-valor">{metricas.contatosPendentes}</div>
            <p className="metrica-desc">Pendentes</p>
          </div>

          <div className="metrica-card card-lower destaque-card">
            <h3>Dias de Maior Pico</h3>
            <div className="metrica-valor-texto">
              {metricasAvancadas.topDias.length > 0 ? metricasAvancadas.topDias.join(" e ") : "--"}
            </div>
            <p className="metrica-desc">Cadastros (Usuários + Empresas)</p>
          </div>

          <div className="metrica-card card-lower">
            <div className="card-header-row">
              <h3>Crescimento</h3>
              <div className="toggle-mini">
                <button
                  className={filtroCrescimento === '30d' ? 'active' : ''}
                  onClick={() => setFiltroCrescimento('30d')}>30 Dias</button>
                <button
                  className={filtroCrescimento === '1a' ? 'active' : ''}
                  onClick={() => setFiltroCrescimento('1a')}>1 Ano</button>
              </div>
            </div>

            <div className="growth-row">
              <div className={Number(currentGrowth.users) >= 0 ? "text-green" : "text-red"}>
                Usuários <strong>{currentGrowth.users > 0 ? '+' : ''}{currentGrowth.users}%</strong>
              </div>
              <div className={Number(currentGrowth.companies) >= 0 ? "text-green" : "text-red"}>
                Empresas <strong>{currentGrowth.companies > 0 ? '+' : ''}{currentGrowth.companies}%</strong>
              </div>
            </div>
            <p className="metrica-desc">{labelGrowth}</p>
          </div>

        </div>

        <div className="graficos-grid">
          <div className="grafico-card">
            <div className="grafico-header"><h3>Usuários por Empresa</h3><p className="grafico-subtitle">Distribuição total</p></div>
            <div className="grafico-area">
              {loading ? <p>Carregando...</p> : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={pizzaData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {pizzaData.map((entry, i) => <Cell key={`cell-${i}`} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <ReTooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grafico-card">
            <div className="grafico-header-complex">
              <div className="header-top">
                <div><h3>Evolução</h3><p className="grafico-subtitle">{filtroTempo.unidade === 'dia' ? 'Por dia' : 'Por mês'}</p></div>
                <div className="toggle-linha">
                  <button className={tipoLinha === "usuarios" ? "on" : ""} onClick={() => setTipoLinha("usuarios")}>Usuários</button>
                  <button className={tipoLinha === "empresas" ? "on" : ""} onClick={() => setTipoLinha("empresas")}>Empresas</button>
                </div>
              </div>
              <div className="filtro-tempo-container">
                {FILTROS_TEMPO.map((f) => (
                  <button key={f.label} className={`btn-filtro ${filtroTempo.label === f.label ? "ativo" : ""}`} onClick={() => setFiltroTempo(f)}>{f.label}</button>
                ))}
              </div>
            </div>

            <div className="grafico-area">
              {loading ? (
                <div className="loading-message"><p>Carregando...</p></div>
              ) : linhaData.length === 0 ? (
                <p className="empty">Sem dados neste período</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={linhaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tickFormatter={formatarLabelX} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} minTickGap={30} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <ReTooltip
                      labelFormatter={formatarLabelX} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Line type="monotone" dataKey="valor" name="Cadastros" stroke="#409535" strokeWidth={3} dot={filtroTempo.unidade === 'mes' || filtroTempo.qtd <= 30 ? { r: 4, strokeWidth: 2, fill: '#fff' } : false} activeDot={{ r: 6, strokeWidth: 0, fill: '#409535' }} animationDuration={1000} />
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Building2,
  CalendarRange,
  ChartColumnIncreasing,
  FileText,
  MapPinned,
  Trophy,
  Users,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import useNoindex from "../hooks/useNoindex";
import { apiAdminDashboard } from "../services/apiAdminDashboard";
import "./style/AdminEvaluationDashboardPage.css";

const QUICK_RANGES = [
  { label: "7 dias", days: 7 },
  { label: "15 dias", days: 15 },
  { label: "30 dias", days: 30 },
];

const TYPE_COLORS = {
  TabelaBR: "#0f766e",
  "CheckBR Resumido": "#2563eb",
  "CheckBR Detalhado": "#f59e0b",
};

const CHART_COLORS = ["#0f766e", "#2563eb", "#f59e0b", "#22c55e", "#ef4444", "#7c3aed"];

function formatDateInput(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getRangeFromDays(days) {
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setDate(dateTo.getDate() - (days - 1));

  return {
    dateFrom: formatDateInput(dateFrom),
    dateTo: formatDateInput(dateTo),
  };
}

function formatDateLabel(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

function formatFullDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatInteger(value) {
  return new Intl.NumberFormat("pt-BR").format(Number(value || 0));
}

let leafletLoader = null;

function ensureLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletLoader) {
    return leafletLoader;
  }

  leafletLoader = new Promise((resolve, reject) => {
    if (!document.getElementById("leaflet-stylesheet")) {
      const link = document.createElement("link");
      link.id = "leaflet-stylesheet";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (document.getElementById("leaflet-script")) {
      const waitForLeaflet = () => {
        if (window.L) {
          resolve(window.L);
        } else {
          setTimeout(waitForLeaflet, 50);
        }
      };
      waitForLeaflet();
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-script";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Não foi possível carregar o Leaflet."));
    document.body.appendChild(script);
  });

  return leafletLoader;
}

function DashboardMap({ points = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerRef = useRef(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const mountMap = async () => {
      if (!mapRef.current) return;

      try {
        const L = await ensureLeaflet();
        if (!isMounted || !mapRef.current) return;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
          });

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(mapInstanceRef.current);
        }

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 0);

        if (layerRef.current) {
          layerRef.current.clearLayers();
        } else {
          layerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
        }

        const validPoints = points
          .filter((point) => Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)))
          .slice(0, 150);

        if (!validPoints.length) {
          mapInstanceRef.current.setView([-14.235, -51.9253], 4);
          return;
        }

        const bounds = [];
        validPoints.forEach((point) => {
          const lat = Number(point.latitude);
          const lng = Number(point.longitude);
          bounds.push([lat, lng]);

          const marker = L.circleMarker([lat, lng], {
            radius: Math.max(7, Math.min(16, 5 + point.total)),
            color: "#0f766e",
            weight: 2,
            fillColor: "#22c55e",
            fillOpacity: 0.72,
          });

          marker.bindPopup(`
            <div style="min-width: 180px;">
              <strong>${point.location}</strong><br/>
              ${formatInteger(point.total)} avaliação(ões)<br/>
              <small>${lat}, ${lng}</small>
            </div>
          `);

          if (point.gpsUrl) {
            marker.on("click", () => {
              marker.openPopup();
            });
          }

          layerRef.current.addLayer(marker);
        });

        if (bounds.length === 1) {
          mapInstanceRef.current.setView(bounds[0], 12);
        } else {
          mapInstanceRef.current.fitBounds(bounds, { padding: [28, 28] });
        }

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 80);

        setMapError("");
      } catch (error) {
        console.error("Erro ao montar mapa do dashboard:", error);
        if (isMounted) {
          setMapError("Não foi possível carregar o mapa agora.");
        }
      }
    };

    mountMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      layerRef.current = null;
    };
  }, [points]);

  if (mapError) {
    return (
      <div className="eval-dashboard-map-empty">
        {mapError}
      </div>
    );
  }

  return (
    <div className="eval-dashboard-map-real">
      {points.length ? <div ref={mapRef} className="eval-dashboard-map-canvas" /> : (
        <div className="eval-dashboard-map-empty">
          Nenhuma avaliação com GPS no período filtrado.
        </div>
      )}
    </div>
  );
}

function AdminEvaluationDashboardPage() {
  useNoindex();

  const defaultPeriod = useMemo(() => getRangeFromDays(7), []);
  const [filters, setFilters] = useState({
    ...defaultPeriod,
    enterpriseId: "",
    userId: "",
  });
  const [activeQuickRange, setActiveQuickRange] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregarDashboard = async (nextFilters = filters, quickRange = activeQuickRange) => {
    try {
      setLoading(true);
      setError("");

      const response = await apiAdminDashboard.buscarAvaliacoes({
        date_from: nextFilters.dateFrom,
        date_to: nextFilters.dateTo,
        enterprise_id: nextFilters.enterpriseId || undefined,
        user_id: nextFilters.userId || undefined,
      });

      setFilters(nextFilters);
      setActiveQuickRange(quickRange);
      setData(response?.data || null);
    } catch (err) {
      console.error("Erro ao carregar dashboard analítico:", err);
      setError("Não foi possível carregar o dashboard agora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard(defaultPeriod, 7);
  }, [defaultPeriod]);

  const summaryCards = useMemo(() => {
    const summary = data?.summary || {};
    return [
      {
        title: "Total de avaliações",
        value: summary.total,
        icon: Activity,
        accent: "primary",
      },
      {
        title: "TabelaBR",
        value: summary.totalTabelaBr,
        icon: FileText,
        accent: "teal",
      },
      {
        title: "CheckBR Resumido",
        value: summary.totalCheckBrResumido,
        icon: ChartColumnIncreasing,
        accent: "blue",
      },
      {
        title: "CheckBR Detalhado",
        value: summary.totalCheckBrDetalhado,
        icon: Trophy,
        accent: "amber",
      },
      {
        title: "Empresas no período",
        value: summary.totalEnterprises,
        icon: Building2,
        accent: "slate",
      },
      {
        title: "Avaliadores ativos",
        value: summary.totalUsers,
        icon: Users,
        accent: "green",
      },
    ];
  }, [data]);

  const typeComparison = useMemo(() => data?.types || [], [data]);
  const evolutionData = useMemo(() => data?.evolution || [], [data]);
  const topCompanies = useMemo(() => data?.companies || [], [data]);
  const topUsers = useMemo(() => data?.users || [], [data]);
  const topManufacturers = useMemo(() => data?.manufacturers || [], [data]);
  const topCategories = useMemo(() => data?.categories || [], [data]);
  const mapPoints = useMemo(() => data?.mapPoints || [], [data]);
  const filterOptions = useMemo(() => data?.filters || { enterprises: [], users: [] }, [data]);

  return (
    <AdminLayout>
      <div className="eval-dashboard-page">
        <section className="eval-dashboard-hero">
          <div>
            <span className="eval-dashboard-kicker">Análise Geral de Avaliações</span>
            <h1>Dashboard</h1>
            <p>
              Acompanhe a atuação da equipe em campo e compare o desempenho entre
              TabelaBR, CheckBR Resumido e CheckBR Detalhado.
            </p>
          </div>

          <div className="eval-dashboard-period-card">
            <span>Período analisado</span>
            <strong>
              {formatFullDate(data?.period?.dateFrom || filters.dateFrom)} até{" "}
              {formatFullDate(data?.period?.dateTo || filters.dateTo)}
            </strong>
          </div>
        </section>

        <section className={`eval-dashboard-filter-panel ${loading ? "is-loading" : ""}`}>
          <div className="eval-dashboard-filter-header">
            <div>
              <span className="eval-dashboard-kicker">Filtros</span>
              <h2>Período</h2>
            </div>
            <CalendarRange size={20} />
          </div>

          <div className="eval-dashboard-quick-ranges">
            {QUICK_RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                className={activeQuickRange === range.days ? "is-active" : ""}
                disabled={loading}
                onClick={() => carregarDashboard(getRangeFromDays(range.days), range.days)}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="eval-dashboard-filter-grid">
            <label>
              <span>Data inicial</span>
              <input
                type="date"
                value={filters.dateFrom}
                disabled={loading}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, dateFrom: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Data final</span>
              <input
                type="date"
                value={filters.dateTo}
                disabled={loading}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, dateTo: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Empresa</span>
              <select
                value={filters.enterpriseId}
                disabled={loading}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    enterpriseId: event.target.value,
                    userId: "",
                  }))
                }
              >
                <option value="">Todas</option>
                {filterOptions.enterprises.map((enterprise) => (
                  <option key={enterprise.value} value={String(enterprise.value)}>
                    {enterprise.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Usuário</span>
              <select
                value={filters.userId}
                disabled={loading}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, userId: event.target.value }))
                }
              >
                <option value="">Todos</option>
                {filterOptions.users.map((user) => (
                  <option key={user.value} value={String(user.value)}>
                    {user.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="eval-dashboard-apply"
              disabled={loading}
              onClick={() => carregarDashboard(filters, null)}
            >
              {loading ? "Carregando..." : "Atualizar Dashboard"}
            </button>
          </div>
        </section>

        {error && <div className="eval-dashboard-error">{error}</div>}

        <section className="eval-dashboard-summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className={`eval-dashboard-summary-card accent-${card.accent}`}>
                <div className="eval-dashboard-summary-card__icon">
                  <Icon size={22} />
                </div>
                <div>
                  <span>{card.title}</span>
                  <strong>{formatInteger(card.value)}</strong>
                </div>
              </article>
            );
          })}
        </section>

        <section className="eval-dashboard-grid">
          <article className="eval-dashboard-card eval-dashboard-card--wide">
            <header className="eval-dashboard-card__header">
              <div>
                <span className="eval-dashboard-card__eyebrow">Evolução por data</span>
                <h3>Volume de avaliações no período</h3>
              </div>
            </header>
            <div className="eval-dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="dashboardTabela" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="dashboardCheckResumo" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="dashboardCheckDetalhado" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                  <XAxis dataKey="date" tickFormatter={formatDateLabel} stroke="#6b7280" />
                  <YAxis allowDecimals={false} stroke="#6b7280" />
                  <Tooltip
                    formatter={(value) => formatInteger(value)}
                    labelFormatter={(value) => formatFullDate(value)}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="tabelabr"
                    name="TabelaBR"
                    stroke="#0f766e"
                    fill="url(#dashboardTabela)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="checkbrResumido"
                    name="CheckBR Resumido"
                    stroke="#2563eb"
                    fill="url(#dashboardCheckResumo)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="checkbrDetalhado"
                    name="CheckBR Detalhado"
                    stroke="#f59e0b"
                    fill="url(#dashboardCheckDetalhado)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="eval-dashboard-card">
            <header className="eval-dashboard-card__header">
              <div>
                <span className="eval-dashboard-card__eyebrow">Comparativo por tipo</span>
                <h3>TabelaBR vs CheckBR</h3>
              </div>
            </header>
            <div className="eval-dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeComparison}
                    dataKey="total"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={94}
                    paddingAngle={3}
                  >
                    {typeComparison.map((entry) => (
                      <Cell
                        key={entry.label}
                        fill={TYPE_COLORS[entry.label] || CHART_COLORS[0]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatInteger(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="eval-dashboard-card">
            <header className="eval-dashboard-card__header">
              <div>
                <span className="eval-dashboard-card__eyebrow">Agrupamento por empresa</span>
                <h3>Quem mais avaliou no período</h3>
              </div>
            </header>
            <div className="eval-dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCompanies} layout="vertical" margin={{ left: 16, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                  <XAxis type="number" allowDecimals={false} stroke="#6b7280" />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={140}
                    tick={{ fill: "#334155", fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => formatInteger(value)} />
                  <Bar dataKey="total" name="Avaliações" radius={[0, 10, 10, 0]} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="eval-dashboard-card">
            <header className="eval-dashboard-card__header">
              <div>
                <span className="eval-dashboard-card__eyebrow">Agrupamento por marca</span>
                <h3>Marcas mais avaliadas</h3>
              </div>
            </header>
            <div className="eval-dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topManufacturers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                  <XAxis dataKey="label" tick={{ fill: "#334155", fontSize: 12 }} interval={0} angle={-18} textAnchor="end" height={72} />
                  <YAxis allowDecimals={false} stroke="#6b7280" />
                  <Tooltip formatter={(value) => formatInteger(value)} />
                  <Bar dataKey="total" name="Avaliações" radius={[10, 10, 0, 0]} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="eval-dashboard-card">
            <header className="eval-dashboard-card__header">
              <div>
                <span className="eval-dashboard-card__eyebrow">Agrupamento por categoria</span>
                <h3>Categorias em destaque</h3>
              </div>
            </header>
            <div className="eval-dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                  <XAxis dataKey="label" tick={{ fill: "#334155", fontSize: 12 }} interval={0} angle={-18} textAnchor="end" height={72} />
                  <YAxis allowDecimals={false} stroke="#6b7280" />
                  <Tooltip formatter={(value) => formatInteger(value)} />
                  <Bar dataKey="total" name="Avaliações" radius={[10, 10, 0, 0]} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="eval-dashboard-card eval-dashboard-card--wide">
            <header className="eval-dashboard-card__header">
              <div>
                <span className="eval-dashboard-card__eyebrow">Mapa de atuação</span>
                <h3>Onde as avaliações aconteceram</h3>
              </div>
              <div className="eval-dashboard-card__meta">
                <MapPinned size={18} />
                <span>{formatInteger(data?.summary?.totalWithGps || 0)} avaliações com GPS</span>
              </div>
            </header>

            <div className="eval-dashboard-map-layout">
              <DashboardMap points={mapPoints} />

              <div className="eval-dashboard-location-list">
                <h4>Pontos com maior volume</h4>
                <ul>
                  {mapPoints.slice(0, 8).map((point) => (
                    <li key={`${point.latitude}-${point.longitude}-${point.location}`}>
                      <div>
                        <strong>{point.location}</strong>
                        <span>
                          {point.latitude}, {point.longitude}
                        </span>
                      </div>
                      <em>{formatInteger(point.total)}</em>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <article className="eval-dashboard-card eval-dashboard-card--wide">
            <header className="eval-dashboard-card__header">
              <div>
                <span className="eval-dashboard-card__eyebrow">Ranking de usuários</span>
                <h3>Quem mais produziu avaliações</h3>
              </div>
            </header>
            <div className="eval-dashboard-ranking">
              {topUsers.map((user, index) => (
                <article key={`${user.id}-${user.label}`} className="eval-dashboard-ranking__item">
                  <span className="eval-dashboard-ranking__position">{String(index + 1).padStart(2, "0")}</span>
                  <div className="eval-dashboard-ranking__content">
                    <strong>{user.label}</strong>
                    <span>{formatInteger(user.total)} avaliações no período</span>
                    <div className="eval-dashboard-status-chips">
                      <span className="eval-dashboard-status-chip status-ok">
                        OK {formatInteger(user.totalOk)}
                      </span>
                      <span className="eval-dashboard-status-chip status-incomplete">
                        Incompleta {formatInteger(user.totalIncomplete)}
                      </span>
                      <span className="eval-dashboard-status-chip status-deleted">
                        Deletada {formatInteger(user.totalDeleted)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminEvaluationDashboardPage;

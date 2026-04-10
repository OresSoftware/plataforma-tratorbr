import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  User,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import useNoindex from "../hooks/useNoindex";
import { apiAdminEvaluations } from "../services/apiAdminEvaluations";
import "./style/AdminEvaluationsPage.css";

const INITIAL_FILTERS = {
  user_id: "",
  date_from: "",
  date_to: "",
  manufacturer_id: "",
  category_id: "",
  enterprise_id: "",
};

const INITIAL_FILTER_OPTIONS = {
  users: [],
  manufacturers: [],
  categories: [],
  enterprises: [],
};

function getEvaluationListCacheKey(moduleType) {
  return `admin-evaluations-list:v6:${normalizeModuleType(moduleType)}`;
}

function normalizeFilters(source = {}) {
  return Object.keys(INITIAL_FILTERS).reduce((accumulator, key) => {
    accumulator[key] = String(source?.[key] || "");
    return accumulator;
  }, {});
}

function readEvaluationListCache(moduleType) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(getEvaluationListCacheKey(moduleType));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return parsed;
  } catch (error) {
    console.warn("Não foi possível restaurar o cache da listagem de avaliações:", error);
    return null;
  }
}

function hasUsableEvaluationListCache(cachedState) {
  if (!cachedState || typeof cachedState !== "object") return false;
  return !String(cachedState.error || "").trim();
}

function writeEvaluationListCache(moduleType, value) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(getEvaluationListCacheKey(moduleType), JSON.stringify(value));
  } catch (error) {
    console.warn("Não foi possível salvar o cache da listagem de avaliações:", error);
  }
}

function normalizeModuleType(moduleType) {
  return String(moduleType || "").toLowerCase() === "checkbr" ? "checkbr" : "tabelabr";
}

function getModuleLabel(moduleType) {
  return normalizeModuleType(moduleType) === "checkbr" ? "CheckBR" : "TabelaBR";
}

function formatDate(value) {
  if (!value) return "--/--/----";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--/--/----"
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
}

function formatTime(value) {
  if (!value) return "--:--";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--:--"
    : new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function formatCurrency(value) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function buildCategoryImageUrl(fileName) {
  const normalized = String(fileName || "").trim();
  if (!normalized) return "";
  return `/images/category/${normalized.split("/").pop()}`;
}

function buildManufacturerImageUrl(fileName) {
  const normalized = String(fileName || "").trim();
  if (!normalized) return "";
  return `/images/manufacturer/${normalized.split("/").pop()}`;
}

function buildUserPhotoUrl(userId, fileName) {
  const normalized = String(fileName || "").trim();
  if (!normalized || !userId) return "";
  return `/images/fotos/${userId}/${normalized.split("/").pop()}`;
}

function getDisplayEvaluationId(evaluation = {}) {
  const userId = Number(evaluation.user_id || 0);
  const avaliadorId = Number(evaluation.avaliador_id || 0);
  return userId && avaliadorId ? `${userId}.${avaliadorId}` : String(evaluation.avaliador_id || "");
}

function getEvaluationStatusMeta(status) {
  switch (String(status || "").trim().toUpperCase()) {
    case "A":
      return { label: "OK", modifier: "ok" };
    case "D":
      return { label: "Deletada", modifier: "deleted" };
    case "G":
      return { label: "Incompleta", modifier: "incomplete" };
    default:
      return null;
  }
}

function FilterField({ label, children }) {
  return (
    <label className="evaluation-filter-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ImageTile({ src, alt, fallbackLabel, tone = "category" }) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (!src || errored) {
    if (tone === "equipment") {
      return null;
    }

    return (
      <div className={`evaluation-image-tile evaluation-image-tile--fallback evaluation-image-tile--${tone}`}>
        <FileText size={20} />
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <div className={`evaluation-image-tile evaluation-image-tile--${tone}`}>
      <img src={src} alt={alt} onError={() => setErrored(true)} />
    </div>
  );
}

export default function AdminEvaluationsPage({ moduleType = "tabelabr" }) {
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();
  const normalizedModule = normalizeModuleType(moduleType);
  const moduleLabel = getModuleLabel(normalizedModule);
  const showScore = normalizedModule === "checkbr";

  useNoindex();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [filterOptions, setFilterOptions] = useState(INITIAL_FILTER_OPTIONS);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [downloadingId, setDownloadingId] = useState("");
  const [stateReady, setStateReady] = useState(false);
  const skipInitialFiltersLoadRef = useRef(false);
  const skipInitialEvaluationsLoadRef = useRef(false);

  useEffect(() => {
    const cachedState = readEvaluationListCache(normalizedModule);
    const canReuseCachedState = hasUsableEvaluationListCache(cachedState);

    if (cachedState) {
      setFilters(normalizeFilters(cachedState.filters));
      setAppliedFilters(normalizeFilters(cachedState.appliedFilters || cachedState.filters));
      setFilterOptions(cachedState.filterOptions || INITIAL_FILTER_OPTIONS);
      setEvaluations(Array.isArray(cachedState.evaluations) ? cachedState.evaluations : []);
      setPage(Math.max(1, Number.parseInt(cachedState.page || "1", 10) || 1));
      setTotal(Number(cachedState.total || 0));
      setError(canReuseCachedState ? "" : "");
      setLoading(!canReuseCachedState);
      setFiltersLoading(!canReuseCachedState);
      skipInitialFiltersLoadRef.current = canReuseCachedState;
      skipInitialEvaluationsLoadRef.current = canReuseCachedState;
      setStateReady(true);

      if (Number.isFinite(Number(cachedState.scrollY))) {
        requestAnimationFrame(() => {
          window.scrollTo(0, Number(cachedState.scrollY || 0));
        });
      }

      return;
    }

    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setFilterOptions(INITIAL_FILTER_OPTIONS);
    setEvaluations([]);
    setPage(1);
    setTotal(0);
    setError("");
    setLoading(true);
    setFiltersLoading(true);
    setStateReady(true);
  }, [normalizedModule]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filtersBlocked = filtersLoading || loading;

  const loadFilters = useCallback(async (params = {}) => {
    setFiltersLoading(true);
    try {
      const response = await apiAdminEvaluations.listarFiltros(normalizedModule, params);
      setFilterOptions(response?.data || INITIAL_FILTER_OPTIONS);
    } catch (requestError) {
      console.error("Erro ao carregar filtros das avaliações:", requestError);
      setFilterOptions(INITIAL_FILTER_OPTIONS);
    } finally {
      setFiltersLoading(false);
    }
  }, [normalizedModule]);

  const loadEvaluations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiAdminEvaluations.listar(normalizedModule, {
        ...appliedFilters,
        page,
        pageSize,
      });

      setEvaluations(response?.data || []);
      setTotal(Number(response?.total || 0));
    } catch (requestError) {
      console.error("Erro ao carregar avaliações:", requestError);
      setEvaluations([]);
      setTotal(0);
      setError(
        requestError?.response?.data?.error ||
          "Não foi possível carregar as avaliações deste módulo."
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, normalizedModule, page, pageSize]);

  useEffect(() => {
    if (!stateReady) return;
    if (skipInitialFiltersLoadRef.current) {
      skipInitialFiltersLoadRef.current = false;
      return;
    }

    loadFilters(appliedFilters);
  }, [stateReady, loadFilters, appliedFilters]);

  useEffect(() => {
    if (!stateReady) return;
    if (skipInitialEvaluationsLoadRef.current) {
      skipInitialEvaluationsLoadRef.current = false;
      return;
    }

    loadEvaluations();
  }, [stateReady, loadEvaluations]);

  const persistCurrentState = useCallback(
    (scrollY = typeof window !== "undefined" ? window.scrollY : 0) => {
      if (!stateReady) return;

      writeEvaluationListCache(normalizedModule, {
        filters,
        appliedFilters,
        filterOptions,
        evaluations,
        page,
        total,
        error,
        scrollY,
      });
    },
    [stateReady, normalizedModule, filters, appliedFilters, filterOptions, evaluations, page, total, error]
  );

  useEffect(() => {
    persistCurrentState();
  }, [persistCurrentState]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleFilterChange = (field) => (event) => {
    if (filtersBlocked) return;
    setFilters((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    if (filtersBlocked) return;
    setFiltersLoading(true);
    setLoading(true);
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    if (filtersBlocked) return;
    setFiltersLoading(true);
    setLoading(true);
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const openPdf = (evaluation) => {
    return (async () => {
      try {
        setDownloadingId(getDisplayEvaluationId(evaluation));
        const { blob, fileName } = await apiAdminEvaluations.baixarPdf(
          evaluation.user_id,
          evaluation.avaliador_id
        );
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objectUrl);
      } catch (requestError) {
        console.error("Erro ao baixar PDF da avaliação:", requestError);
        const message =
          requestError?.response?.data?.error ||
          "Não foi possível gerar o PDF desta avaliação agora.";
        window.alert(message);
      } finally {
        setDownloadingId("");
      }
    })();
  };

  const openDetail = (evaluation) => {
    persistCurrentState(window.scrollY);
    navigate(`/admin/avaliacoes/${normalizedModule}/${evaluation.user_id}/${evaluation.avaliador_id}`);
  };

  return (
    <AdminLayout>
      <div className="evaluation-page">
        <section className="evaluation-page__hero">
          <div>
            <h1>{moduleLabel}</h1>
            <p className="evaluation-page__subtitle">Consulte as avaliações do {moduleLabel} feitas pelos usuários.</p>
          </div>

          <div className="evaluation-page__summary">
            <div className="evaluation-summary-card">
              <span>Total no escopo</span>
              <strong>{total}</strong>
            </div>
          </div>
        </section>

        <section className="evaluation-filters-card">
          <div className="evaluation-filters-card__header">
            <div>
              <h2>
                <Filter size={18} />
                Filtros
              </h2>
              <p>Filtre por usuário, período, marca, categoria e empresa.</p>
            </div>
            {filtersLoading && <span className="evaluation-filters-card__loading">Atualizando filtros...</span>}
          </div>

          <form className={`evaluation-filters-form ${filtersBlocked ? "evaluation-filters-form--blocked" : ""}`} onSubmit={handleApplyFilters}>
            <fieldset className="evaluation-filters-grid" disabled={filtersBlocked}>
            <FilterField label="Usuário">
              <select value={filters.user_id} onChange={handleFilterChange("user_id")}>
                <option value="">Todos</option>
                {filterOptions.users.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label || `Usuário ${option.value}`}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Data inicial">
              <input type="date" value={filters.date_from} onChange={handleFilterChange("date_from")} />
            </FilterField>

            <FilterField label="Data final">
              <input type="date" value={filters.date_to} onChange={handleFilterChange("date_to")} />
            </FilterField>

            <FilterField label="Marca">
              <select value={filters.manufacturer_id} onChange={handleFilterChange("manufacturer_id")}>
                <option value="">Todas</option>
                {filterOptions.manufacturers.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Categoria">
              <select value={filters.category_id} onChange={handleFilterChange("category_id")}>
                <option value="">Todas</option>
                {filterOptions.categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Empresa">
              <select value={filters.enterprise_id} onChange={handleFilterChange("enterprise_id")}>
                <option value="">Todas</option>
                {filterOptions.enterprises.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <div className="evaluation-filters-actions">
              <button type="submit" className="evaluation-btn evaluation-btn--primary">
                Aplicar filtros
              </button>
              <button type="button" className="evaluation-btn evaluation-btn--ghost" onClick={handleClearFilters}>
                <RefreshCw size={16} />
                Limpar
              </button>
            </div>
            </fieldset>
          </form>
        </section>

        {error ? <div className="evaluation-feedback evaluation-feedback--error">{error}</div> : null}

        <section className="evaluation-list-section">
          <div className="evaluation-list-section__header">
            <div>
              <h2>{moduleLabel}</h2>
              <p>Ordenação: mais recente primeiro e depois por ID decrescente.</p>
            </div>
          </div>

          {loading ? (
            <div className="evaluation-empty-state">Carregando avaliações...</div>
          ) : evaluations.length === 0 ? (
            <div className="evaluation-empty-state">Nenhuma avaliação encontrada com os filtros atuais.</div>
          ) : (
            <div className="evaluation-cards-grid">
              {evaluations.map((evaluation) => {
                const categoryImageUrl = buildCategoryImageUrl(evaluation.category_image);
                const manufacturerImageUrl = buildManufacturerImageUrl(evaluation.manufacturer_image);
                const equipmentImageUrl = buildUserPhotoUrl(evaluation.user_id, evaluation.image_equipamento);
                const displayModel =
                  evaluation.model_name ||
                  evaluation.base_model_name ||
                  evaluation.version_name ||
                  "Modelo não informado";
                const displayUser = [evaluation.user_firstname, evaluation.user_lastname]
                  .filter(Boolean)
                  .join(" ");
                const displayEnterprise =
                  evaluation.enterprise_fantasia ||
                  evaluation.enterprise_razao ||
                  "Empresa não informada";
                const displayId = getDisplayEvaluationId(evaluation);
                const statusMeta = getEvaluationStatusMeta(evaluation.status);
                const checklistTypeLabel =
                  normalizedModule === "checkbr"
                    ? evaluation.checklist_tipo_name || ""
                    : "";

                return (
                  <article className="evaluation-card" key={displayId}>
                    <div className="evaluation-card__line evaluation-card__line--meta">
                      <span>
                        <Calendar size={14} />
                        {formatDate(evaluation.data)}
                      </span>
                      <span>
                        <Clock3 size={14} />
                        {formatTime(evaluation.data)}
                      </span>
                      <span>
                        <FileText size={14} />
                        {displayId}
                      </span>
                      {statusMeta ? (
                        <span
                          className={`evaluation-status-badge evaluation-status-badge--${statusMeta.modifier}`}
                        >
                          {statusMeta.label}
                        </span>
                      ) : null}
                      {checklistTypeLabel ? (
                        <span className="evaluation-card__meta-chip">{evaluation.checklist_tipo_name}</span>
                      ) : null}
                    </div>

                    <div className="evaluation-card__line evaluation-card__line--title">
                      <h3>{evaluation.descricao || `Avaliação ${displayId}`}</h3>
                    </div>

                    <div className="evaluation-card__line evaluation-card__line--media">
                      <div className="evaluation-card__media">
                        <ImageTile
                          src={categoryImageUrl}
                          alt={evaluation.category_name || "Categoria"}
                          fallbackLabel="Categoria"
                          tone="category"
                        />
                        <ImageTile
                          src={manufacturerImageUrl}
                          alt={evaluation.manufacturer_name || "Fabricante"}
                          fallbackLabel="Marca"
                          tone="manufacturer"
                        />
                        {equipmentImageUrl ? (
                          <ImageTile
                            src={equipmentImageUrl}
                            alt={`Foto do equipamento ${displayId}`}
                            fallbackLabel="Equipamento"
                            tone="equipment"
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="evaluation-card__line">
                      <p className="evaluation-card__info">Modelo: {displayModel}</p>
                    </div>

                    <div className="evaluation-card__line">
                      <p className="evaluation-card__info">Ano: {evaluation.year || "N/A"}</p>
                    </div>

                    {showScore ? (
                      <div className="evaluation-card__line">
                        <p className="evaluation-card__info">Nota: {evaluation.nota_name || "N/A"}</p>
                      </div>
                    ) : null}

                    <div className="evaluation-card__line evaluation-card__line--values">
                      <div className="evaluation-card__values">
                        <div>
                          <span>Consumidor</span>
                        <strong>{formatCurrency(evaluation.consumidor_valor)}</strong>
                      </div>
                      <div>
                        <span>Revenda</span>
                        <strong>{formatCurrency(evaluation.revendedor_valor)}</strong>
                      </div>
                      <div>
                        <span>Repasse</span>
                        <strong>{formatCurrency(evaluation.repasse_valor)}</strong>
                      </div>
                      </div>
                    </div>

                    <div className="evaluation-card__line">
                      <p className="evaluation-card__context-text">
                        <User size={14} />
                        <span>{displayUser || `Usuário ${evaluation.user_id}`}</span>
                      </p>
                    </div>

                    <div className="evaluation-card__line">
                      <p className="evaluation-card__context-text">
                        <Building2 size={14} />
                        <span>{displayEnterprise}</span>
                      </p>
                    </div>

                    <div className="evaluation-card__line evaluation-card__line--actions">
                      <div className="evaluation-card__actions">
                        <button
                          type="button"
                          className="evaluation-btn evaluation-btn--primary"
                          onClick={() => openDetail(evaluation)}
                        >
                          <Eye size={16} />
                          Visualizar
                        </button>
                        <button
                          type="button"
                          className="evaluation-btn evaluation-btn--ghost"
                          disabled={downloadingId === displayId}
                          onClick={() => openPdf(evaluation)}
                        >
                          <Download size={16} />
                          {downloadingId === displayId ? "Gerando..." : "Gerar PDF"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="evaluation-pagination">
              <button
                type="button"
                className="evaluation-pagination__button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <span>
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                className="evaluation-pagination__button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </AdminLayout>
  );
}

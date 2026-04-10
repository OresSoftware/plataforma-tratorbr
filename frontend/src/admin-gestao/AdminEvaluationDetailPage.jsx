import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock3,
  Download,
  FileText,
  MapPin,
  RotateCcw,
  User,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import useNoindex from "../hooks/useNoindex";
import { apiAdminEvaluations } from "../services/apiAdminEvaluations";
import "./style/AdminEvaluationDetailPage.css";

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

function buildImageUrl(basePath, fileName) {
  const normalized = String(fileName || "").trim();
  if (!normalized) return "";
  return `${basePath}/${normalized.split("/").pop()}`;
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

function buildGpsLink(evaluation = {}) {
  const directUrl = String(evaluation.gps_url || "").trim();
  if (directUrl) return directUrl;

  const latitude = String(evaluation.gps_latitude || "").trim();
  const longitude = String(evaluation.gps_longitude || "").trim();
  if (latitude && longitude) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }

  const address = String(
    evaluation.gps_endereco || evaluation.proprietario_local || ""
  ).trim();
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return "";
}

function MediaFrame({ src, alt, label, onMediaError }) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if ((!src || errored) && (label === "Serial" || label === "Equipamento")) {
    return null;
  }

  return (
    <div className="evaluation-detail-media">
      {src && !errored ? (
        <img
          src={src}
          alt={alt}
          onError={() => {
            setErrored(true);
            onMediaError?.();
          }}
        />
      ) : (
        <div className="evaluation-detail-media__fallback">
          <FileText size={24} />
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}

function SignatureFrame({ src, alt, label }) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (!src || errored) return null;

  return (
    <div className="evaluation-detail-signature">
      <span>{label}</span>
      <div className="evaluation-detail-signature__frame">
        <img src={src} alt={alt} onError={() => setErrored(true)} />
      </div>
    </div>
  );
}

function DetailField({ label, value, multiline = false, className = "", allowEmpty = false }) {
  if ((!value && value !== 0) && !allowEmpty) return null;

  return (
    <div
      className={`evaluation-detail-field ${multiline ? "evaluation-detail-field--multiline" : ""} ${className}`.trim()}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function AdminEvaluationDetailPage() {
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();
  const { userId, avaliadorId, module } = useParams();

  useNoindex();

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [hiddenPhotoKeys, setHiddenPhotoKeys] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadEvaluation() {
      setLoading(true);
      setError("");

      try {
        const response = await apiAdminEvaluations.buscarPorId(userId, avaliadorId);
        if (!isMounted) return;
        setEvaluation(response?.data || null);
      } catch (requestError) {
        console.error("Erro ao carregar detalhe da avaliação:", requestError);
        if (!isMounted) return;
        setEvaluation(null);
        setError(
          requestError?.response?.data?.error ||
            "Não foi possível carregar os detalhes desta avaliação."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEvaluation();

    return () => {
      isMounted = false;
    };
  }, [avaliadorId, userId]);

  const resolvedModule = normalizeModuleType(evaluation?.module_type || module);
  const moduleLabel = getModuleLabel(resolvedModule);
  const displayEnterprise = evaluation?.enterprise_fantasia || evaluation?.enterprise_razao;
  const displayUser = [evaluation?.user_firstname, evaluation?.user_lastname]
    .filter(Boolean)
    .join(" ");
  const displayVersion =
    (evaluation?.version_concat_name || "")
      .replace(/\s*•\s*/g, "\n") ||
    evaluation?.version_manual ||
    evaluation?.version_name ||
    "Versão não informada";
  const displayModel =
    evaluation?.model_name ||
    evaluation?.base_model_name ||
    "Modelo não informado";
  const displayMarket = evaluation?.quality_name || evaluation?.nota_name || "N/A";
  const displayScore = evaluation?.nota_name || "N/A";
  const displayPropertyLabel = evaluation?.propriedade_name || "Propriedade";
  const displayPropertyValue =
    evaluation?.propriedade_description ||
    evaluation?.propriedade_valor ||
    "Não informado";
  const displayDescription = evaluation?.obs || "";
  const displayId = getDisplayEvaluationId(evaluation || {});
  const statusMeta = getEvaluationStatusMeta(evaluation?.status);
  const categoryImageUrl = useMemo(
    () => buildImageUrl("/images/category", evaluation?.category_image),
    [evaluation?.category_image]
  );
  const manufacturerImageUrl = useMemo(
    () => buildImageUrl("/images/manufacturer", evaluation?.manufacturer_image),
    [evaluation?.manufacturer_image]
  );
  const evaluatorSignatureUrl = useMemo(
    () => buildUserPhotoUrl(evaluation?.user_id, evaluation?.user_assinatura_avaliador),
    [evaluation?.user_id, evaluation?.user_assinatura_avaliador]
  );
  const proprietorSignatureUrl = useMemo(
    () => buildUserPhotoUrl(evaluation?.user_id, evaluation?.proprietario_assinatura_reponsavel),
    [evaluation?.user_id, evaluation?.proprietario_assinatura_reponsavel]
  );
  const gpsLink = useMemo(
    () => buildGpsLink(evaluation || {}),
    [
      evaluation?.gps_url,
      evaluation?.gps_latitude,
      evaluation?.gps_longitude,
      evaluation?.gps_endereco,
      evaluation?.proprietario_local,
    ]
  );
  const equipmentPhotos = useMemo(() => {
    return (Array.isArray(evaluation?.equipment_photos) ? evaluation.equipment_photos : [])
      .map((photo, index) => ({
        ...photo,
        key: `${photo.source || "photo"}-${photo.avaliador_foto_id || index}-${photo.image || index}`,
        url: buildUserPhotoUrl(evaluation?.user_id, photo.image),
      }))
      .filter((photo) => photo.url);
  }, [evaluation?.equipment_photos, evaluation?.user_id]);
  const serialPhotos = useMemo(() => {
    return (Array.isArray(evaluation?.serial_photos) ? evaluation.serial_photos : [])
      .map((photo, index) => ({
        ...photo,
        key: `serial-${photo.source || "photo"}-${photo.avaliador_foto_id || index}-${photo.image || index}`,
        url: buildUserPhotoUrl(evaluation?.user_id, photo.image),
      }))
      .filter((photo) => photo.url);
  }, [evaluation?.serial_photos, evaluation?.user_id]);
  const visibleSerialPhoto = useMemo(
    () => serialPhotos.find((photo) => !hiddenPhotoKeys[photo.key]) || null,
    [serialPhotos, hiddenPhotoKeys]
  );
  const checklistGroups = useMemo(() => {
    return (Array.isArray(evaluation?.checklist) ? evaluation.checklist : []).map((group, groupIndex) => ({
      ...group,
      perguntas: (Array.isArray(group?.perguntas) ? group.perguntas : []).map((item, itemIndex) => ({
        ...item,
        fotos: (Array.isArray(item?.fotos) ? item.fotos : [])
          .map((photo, photoIndex) => ({
            ...photo,
            key: `checklist-${group.bloco_id || groupIndex}-${item.basepergunta_id || itemIndex}-${photo.avaliador_foto_id || photoIndex}-${photo.image || photoIndex}`,
            url: buildUserPhotoUrl(evaluation?.user_id, photo.image),
          }))
          .filter((photo) => photo.url),
      })),
    }));
  }, [evaluation?.checklist, evaluation?.user_id]);

  useEffect(() => {
    setHiddenPhotoKeys({});
    setPreviewPhoto(null);
    setPreviewZoom(1);
  }, [evaluation?.user_id, evaluation?.avaliador_id, evaluation?.equipment_photos, evaluation?.serial_photos]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const openPdf = () => {
    return (async () => {
      try {
        setDownloadingPdf(true);
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
        setDownloadingPdf(false);
      }
    })();
  };

  const openPhotoPreview = (photo) => {
    setPreviewPhoto(photo);
    setPreviewZoom(1);
  };

  const closePhotoPreview = () => {
    setPreviewPhoto(null);
    setPreviewZoom(1);
  };

  const handlePreviewWheel = (event) => {
    event.preventDefault();
    setPreviewZoom((current) => {
      const next = current + (event.deltaY < 0 ? 0.25 : -0.25);
      return Math.max(1, Math.min(4, Number(next.toFixed(2))));
    });
  };

  return (
    <AdminLayout>
      <div className="evaluation-detail-page">
        <div className="evaluation-detail-page__topbar">
          <button
            type="button"
            className="evaluation-detail-back"
            onClick={() => navigate(`/admin/avaliacoes/${resolvedModule}`)}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          {evaluation ? (
            <button type="button" className="evaluation-detail-pdf" disabled={downloadingPdf} onClick={openPdf}>
              <Download size={16} />
              {downloadingPdf ? "Gerando..." : "Gerar PDF"}
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="evaluation-detail-feedback">Carregando avaliação...</div>
        ) : error ? (
          <div className="evaluation-detail-feedback evaluation-detail-feedback--error">{error}</div>
        ) : !evaluation ? (
          <div className="evaluation-detail-feedback">Avaliação não encontrada.</div>
        ) : (
          <>
            <section className="evaluation-detail-hero">
              <div>
                <p className="evaluation-detail-hero__eyebrow">{moduleLabel}</p>
                <h1>{evaluation.descricao || `Avaliação ${displayId}`}</h1>
                <div className="evaluation-detail-hero__meta">
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
                  {resolvedModule === "checkbr" && evaluation.checklist_tipo_name ? (
                    <span>
                      <FileText size={14} />
                      {evaluation.checklist_tipo_name}
                    </span>
                  ) : null}
                  {statusMeta ? (
                    <span className={`evaluation-status-badge evaluation-status-badge--${statusMeta.modifier}`}>
                      {statusMeta.label}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="evaluation-detail-hero__context">
                {displayEnterprise ? (
                  <span>
                    <Building2 size={14} />
                    {displayEnterprise}
                  </span>
                ) : null}
                {displayUser ? (
                  <span>
                    <User size={14} />
                    {displayUser}
                  </span>
                ) : null}
              </div>
            </section>

            <section className="evaluation-detail-equipment">
              <div className="evaluation-detail-equipment__media">
                <MediaFrame
                  src={categoryImageUrl}
                  alt={evaluation.category_name || "Categoria do equipamento"}
                  label="Categoria"
                />
                <MediaFrame
                  src={manufacturerImageUrl}
                  alt={evaluation.manufacturer_name || "Fabricante"}
                  label="Fabricante"
                />
              </div>

              <div className="evaluation-detail-equipment__content">
                <h2>Dados do Equipamento</h2>
                <div className="evaluation-detail-equipment__layout">
                  <div className="evaluation-detail-equipment__side">
                    <DetailField label="Modelo" value={displayModel} />
                    <DetailField label="Ano" value={evaluation.year || "N/A"} />
                    <DetailField label="Nota" value={displayScore} />
                    <DetailField label="Mercado" value={displayMarket} />
                    <DetailField
                      label={displayPropertyLabel}
                      value={displayPropertyValue}
                      multiline
                      className="evaluation-detail-field--fill"
                    />
                  </div>

                  <div className="evaluation-detail-equipment__version">
                    <DetailField label="Versão" value={displayVersion} multiline className="evaluation-detail-field--fill" />
                    <DetailField
                      label="Descrição"
                      value={displayDescription}
                      multiline
                      allowEmpty
                      className="evaluation-detail-field--fill"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="evaluation-detail-values">
              <div className="evaluation-detail-values__head">
                <h2>Tipo de Avaliação</h2>
              </div>

              <div className="evaluation-detail-values__grid">
                <div className="evaluation-value-card">
                  <span>Consumidor</span>
                  <strong>{formatCurrency(evaluation.consumidor_valor)}</strong>
                </div>
                <div className="evaluation-value-card">
                  <span>Revenda</span>
                  <strong>{formatCurrency(evaluation.revendedor_valor)}</strong>
                </div>
                <div className="evaluation-value-card">
                  <span>Repasse</span>
                  <strong>{formatCurrency(evaluation.repasse_valor)}</strong>
                </div>
                <div className="evaluation-value-card evaluation-value-card--outlined">
                  <span>Valor Equipamento Novo</span>
                  <strong>{formatCurrency(evaluation.valor_basemodel)}</strong>
                </div>
              </div>
            </section>

            <section className="evaluation-detail-info-grid">
              <div className="evaluation-detail-panel">
                <h3>Avaliador</h3>
                <DetailField label="Nome" value={displayUser || "N/A"} />
                <DetailField label="E-mail" value={evaluation.user_email} />
                <DetailField label="Telefone" value={evaluation.user_fone} />
                <DetailField label="Cidade / UF" value={[evaluation.user_cidade, evaluation.user_uf].filter(Boolean).join(" / ")} />
                <DetailField label="Cargo" value={evaluation.user_cargo} />
                <SignatureFrame
                  src={evaluatorSignatureUrl}
                  alt={`Assinatura do avaliador ${displayUser || displayId}`}
                  label="Assinatura do avaliador"
                />
              </div>

              <div className="evaluation-detail-panel">
                <h3>Empresa vinculada</h3>
                <DetailField label="Empresa" value={displayEnterprise || "N/A"} />
                <DetailField label="Matriz" value={evaluation.enterprise_matriz_fantasia || evaluation.enterprise_matriz_razao} />
                <DetailField label="E-mail" value={evaluation.enterprise_email} />
                <DetailField label="Telefone" value={evaluation.enterprise_fone} />
                <DetailField label="Cidade / UF" value={[evaluation.enterprise_cidade, evaluation.enterprise_uf].filter(Boolean).join(" / ")} />
              </div>

              <div className="evaluation-detail-panel">
                <h3>Proprietário do equipamento</h3>
                <DetailField label="Local" value={evaluation.proprietario_local} />
                <DetailField label="Endereço" value={evaluation.gps_endereco} multiline />
                <DetailField label="Proprietário" value={evaluation.proprietario_nome} />
                <DetailField label="Responsável" value={evaluation.proprietario_responsavel_nome} />
                <DetailField label="CPF do responsável" value={evaluation.proprietario_responsavel_cpf} />
                <SignatureFrame
                  src={proprietorSignatureUrl}
                  alt={`Assinatura do responsável da avaliação ${displayId}`}
                  label="Assinatura do responsável"
                />
                {gpsLink ? (
                  <div className="evaluation-detail-panel__actions">
                    <a
                      href={gpsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evaluation-detail-link"
                    >
                      <MapPin size={14} />
                      Abrir localização
                    </a>
                  </div>
                ) : null}
              </div>
            </section>

            {(evaluation.serial_text_full || visibleSerialPhoto) ? (
              <section className="evaluation-detail-photos">
                <h2>Serial do Equipamento</h2>
                <div className="evaluation-detail-serial evaluation-detail-serial--inline">
                  {evaluation.serial_text_full ? (
                    <div className="evaluation-detail-serial-card">
                      <span>Serial</span>
                      <strong>{evaluation.serial_text_full}</strong>
                    </div>
                  ) : null}

                  {visibleSerialPhoto ? (
                    <button
                      type="button"
                      className="evaluation-detail-photo-card evaluation-detail-photo-card--serial"
                      onClick={() => openPhotoPreview(visibleSerialPhoto)}
                    >
                      <img
                        src={visibleSerialPhoto.url}
                        alt={visibleSerialPhoto.obs || visibleSerialPhoto.comentario || "Foto do serial"}
                        onError={() =>
                          setHiddenPhotoKeys((previous) => ({
                            ...previous,
                            [visibleSerialPhoto.key]: true,
                          }))
                        }
                      />
                      {visibleSerialPhoto.obs || visibleSerialPhoto.comentario ? (
                        <small>{visibleSerialPhoto.obs || visibleSerialPhoto.comentario}</small>
                      ) : null}
                    </button>
                  ) : null}
                </div>
              </section>
            ) : null}

            {equipmentPhotos.filter((photo) => !hiddenPhotoKeys[photo.key]).length ? (
              <section className="evaluation-detail-photos">
                <h2>Fotos do Equipamento</h2>
                <div className="evaluation-detail-photos__grid">
                  {equipmentPhotos.map((photo, index) => {
                    if (hiddenPhotoKeys[photo.key]) return null;

                    return (
                      <button
                        type="button"
                        key={photo.key}
                        className="evaluation-detail-photo-card"
                        onClick={() => openPhotoPreview(photo)}
                      >
                        <img
                          src={photo.url}
                          alt={photo.obs || photo.comentario || `Foto ${index + 1}`}
                          onError={() =>
                            setHiddenPhotoKeys((previous) => ({
                              ...previous,
                              [photo.key]: true,
                            }))
                          }
                        />
                        {photo.obs || photo.comentario ? <small>{photo.obs || photo.comentario}</small> : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {resolvedModule === "checkbr" && checklistGroups.length ? (
              <section className="evaluation-detail-checklist">
                <h2>Resultado do Checklist</h2>

                {checklistGroups.map((group) => (
                  <article key={group.bloco_id || group.nome} className="evaluation-checklist-group">
                    <div className="evaluation-checklist-group__title">{group.nome || "Grupo"}</div>

                    <div className="evaluation-checklist-group__head">
                      <span>Pergunta</span>
                      <span>Resposta</span>
                      <span>Observação</span>
                    </div>

                    <div className="evaluation-checklist-group__body">
                      {group.perguntas.map((item, itemIndex) => (
                        <div
                          key={`${group.bloco_id || "grupo"}-${item.basepergunta_id || itemIndex}`}
                          className="evaluation-checklist-item"
                        >
                          <div className="evaluation-checklist-item__grid">
                            <div className="evaluation-checklist-item__cell">
                              <small>Pergunta</small>
                              <strong>{item.pergunta || "-"}</strong>
                            </div>
                            <div className="evaluation-checklist-item__cell">
                              <small>Resposta</small>
                              <strong>{item.resposta || "-"}</strong>
                            </div>
                            <div className="evaluation-checklist-item__cell">
                              <small>Observação</small>
                              <strong>{item.obs || "-"}</strong>
                            </div>
                          </div>

                          {item.fotos?.filter((photo) => !hiddenPhotoKeys[photo.key]).length ? (
                            <div className="evaluation-checklist-item__photos">
                              {item.fotos.map((photo, photoIndex) => {
                                if (hiddenPhotoKeys[photo.key]) return null;

                                return (
                                  <button
                                    type="button"
                                    key={photo.key}
                                    className="evaluation-checklist-photo"
                                    onClick={() => openPhotoPreview(photo)}
                                  >
                                    <img
                                      src={photo.url}
                                      alt={photo.obs || photo.comentario || `Foto da pergunta ${photoIndex + 1}`}
                                      onError={() =>
                                        setHiddenPhotoKeys((previous) => ({
                                          ...previous,
                                          [photo.key]: true,
                                        }))
                                      }
                                    />
                                    {photo.obs || photo.comentario ? (
                                      <small>{photo.obs || photo.comentario}</small>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            ) : null}

            {previewPhoto ? (
              <div className="evaluation-detail-lightbox" role="dialog" aria-modal="true" onClick={closePhotoPreview}>
                <div className="evaluation-detail-lightbox__dialog" onClick={(event) => event.stopPropagation()}>
                  <div className="evaluation-detail-lightbox__toolbar">
                    <div className="evaluation-detail-lightbox__zoom-actions">
                      <button
                        type="button"
                        className="evaluation-detail-lightbox__action"
                        onClick={() => setPreviewZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))))}
                        disabled={previewZoom <= 1}
                      >
                        <ZoomOut size={16} />
                        Menos zoom
                      </button>
                      <button
                        type="button"
                        className="evaluation-detail-lightbox__action"
                        onClick={() => setPreviewZoom((current) => Math.min(4, Number((current + 0.25).toFixed(2))))}
                        disabled={previewZoom >= 4}
                      >
                        <ZoomIn size={16} />
                        Mais zoom
                      </button>
                      <button
                        type="button"
                        className="evaluation-detail-lightbox__action"
                        onClick={() => setPreviewZoom(1)}
                        disabled={previewZoom === 1}
                      >
                        <RotateCcw size={16} />
                        Resetar
                      </button>
                    </div>
                    <button
                      type="button"
                      className="evaluation-detail-lightbox__close"
                      onClick={closePhotoPreview}
                    >
                      <X size={16} />
                      Fechar
                    </button>
                  </div>
                  <div className="evaluation-detail-lightbox__media" onWheel={handlePreviewWheel}>
                    <img
                      src={previewPhoto.url}
                      alt={previewPhoto.obs || previewPhoto.comentario || "Foto da avaliação"}
                      style={{ width: `${previewZoom * 100}%`, maxWidth: "none" }}
                    />
                  </div>
                  <div className="evaluation-detail-lightbox__caption">
                    {previewPhoto.obs || previewPhoto.comentario ? <p>{previewPhoto.obs || previewPhoto.comentario}</p> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

const axios = require("axios");
const pool = require("../config/db");
const { canAccessEnterpriseId } = require("../services/panelAuthService");
const {
  buildEvaluationModuleFilter,
  buildEvaluationVisibilityFilter,
  getAppPdfBaseUrls,
  getEvaluationDisplayId,
  getPdfRouteByEvaluation,
  normalizeEvaluationModule,
  signAppPdfToken,
} = require("../services/adminEvaluationService");

const LIST_SELECT_SQL = `
  av.avaliador_id,
  av.user_id,
  av.data,
  av.descricao,
  av.status,
  av.checklist_id,
  av.checklist_tipo_name,
  av.category_id,
  av.category_name,
  av.category_image,
  av.manufacturer_id,
  av.manufacturer_name,
  av.manufacturer_image,
  av.model_id,
  av.model_name,
  av.base_model_name,
  av.version_name,
  av.version_concat_name,
  av.version_manual,
  av.year,
  av.total_nota,
  av.nota_name,
  av.valor_basemodel,
  av.consumidor_valor,
  av.revendedor_valor,
  av.repasse_valor,
  av.image_equipamento,
  av.image_serial,
  av.enterprise_id,
  av.enterprise_fantasia,
  av.enterprise_razao,
  av.enterprise_matriz_id,
  av.enterprise_matriz_fantasia,
  av.enterprise_matriz_razao,
  av.user_firstname,
  av.user_lastname,
  av.user_cargo_poder,
  CASE
    WHEN COALESCE(av.checklist_id, 0) > 0 THEN 'checkbr'
    ELSE 'tabelabr'
  END AS module_type
`;

const DETAIL_SELECT_SQL = `
  av.*,
  CASE
    WHEN COALESCE(av.checklist_id, 0) > 0 THEN 'checkbr'
    ELSE 'tabelabr'
  END AS module_type
`;

function isNonEmptyValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function isISODate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
}

function toPositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getEvaluationKeys(req) {
  return {
    userId: toPositiveInt(
      req.params.userId || req.query.user_id || req.body?.user_id
    ),
    avaliadorId: toPositiveInt(
      req.params.avaliadorId || req.params.id || req.query.avaliador_id || req.body?.avaliador_id
    ),
  };
}

function normalizePhotoFileName(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized.split("/").pop() : "";
}

function buildChecklistDataFromRows(checklistRows = [], photoRows = []) {
  const groups = [];
  const groupsMap = new Map();
  const photosByQuestion = new Map();

  photoRows.forEach((row) => {
    const questionId = Number(row.avaliador_resposta_id || 0);
    const photoType = Number(row.tipo || 0);
    const image = normalizePhotoFileName(row.image);

    if (!questionId || !image || (photoType !== 3 && photoType !== 4)) return;

    const currentPhotos = photosByQuestion.get(questionId) || [];
    currentPhotos.push({
      avaliador_resposta_id: questionId,
      avaliador_foto_id: Number(row.avaliador_foto_id || 0),
      tipo: photoType,
      image,
      comentario: String(row.comentario || "").trim(),
      obs: String(row.comentario || "").trim(),
      source: "checklist",
    });
    photosByQuestion.set(questionId, currentPhotos);
  });

  checklistRows.forEach((row) => {
    const blockId = Number(row.bloco_id || 0);

    if (!groupsMap.has(blockId)) {
      const group = {
        bloco_id: blockId,
        nome: row.bloco_name || `Bloco ${blockId}`,
        perguntas: [],
      };
      groupsMap.set(blockId, group);
      groups.push(group);
    }

    const questionId = Number(row.basepergunta_id || 0);
    groupsMap.get(blockId).perguntas.push({
      basepergunta_id: questionId,
      pergunta: row.pergunta_name || "",
      resposta: isNonEmptyValue(row.version_name) ? String(row.version_name).trim() : "",
      obs: isNonEmptyValue(row.obs) ? String(row.obs).trim() : "",
      fotos: photosByQuestion.get(questionId) || [],
    });
  });

  groups.forEach((group) => {
    group.perguntas.sort(
      (left, right) =>
        (Number(left.basepergunta_id) || 0) - (Number(right.basepergunta_id) || 0)
    );
  });

  return groups;
}

function ensureEvaluationVisibility(req, res) {
  const visibility = buildEvaluationVisibilityFilter(req.admin, { alias: "av" });

  if (!req.admin?.user_id || !visibility) {
    res.status(403).json({
      ok: false,
      error: "Sessão inválida para visualizar avaliações.",
    });
    return null;
  }

  if (visibility.scope.mode === "manager") {
    if (!visibility.scope.scopeValue || visibility.scope.cargoPower < 0) {
      res.status(403).json({
        ok: false,
        error: "Seu usuário não possui escopo válido para visualizar avaliações.",
      });
      return null;
    }
  }

  return visibility;
}

async function buildEvaluationQueryContext(req, res, moduleType) {
  const visibility = ensureEvaluationVisibility(req, res);
  if (!visibility) return null;

  const normalizedModule = normalizeEvaluationModule(moduleType);
  const moduleFilter = buildEvaluationModuleFilter(normalizedModule, "av");
  const where = [visibility.where, moduleFilter.where];
  const params = [...visibility.params, ...moduleFilter.params];

  const userId = toPositiveInt(req.query.user_id);
  const enterpriseId = toPositiveInt(req.query.enterprise_id);
  const manufacturerId = toPositiveInt(req.query.manufacturer_id);
  const categoryId = toPositiveInt(req.query.category_id);
  const dateFrom = String(req.query.date_from || "").trim();
  const dateTo = String(req.query.date_to || "").trim();

  if (userId) {
    if (visibility.scope.mode === "self" && userId !== visibility.scope.selfUserId) {
      res.status(403).json({
        ok: false,
        error: "Seu usuário só pode visualizar as próprias avaliações.",
      });
      return null;
    }

    where.push("av.user_id = ?");
    params.push(userId);
  }

  if (enterpriseId) {
    if (visibility.scope.mode === "self") {
      res.status(403).json({
        ok: false,
        error: "Seu usuário só pode visualizar as próprias avaliações.",
      });
      return null;
    }

    if (visibility.scope.mode !== "global") {
      const canAccessEnterprise = await canAccessEnterpriseId(req.admin, enterpriseId);
      if (!canAccessEnterprise) {
        res.status(403).json({
          ok: false,
          error: "Você só pode visualizar avaliações dentro do seu escopo permitido.",
        });
        return null;
      }
    }

    where.push("av.enterprise_id = ?");
    params.push(enterpriseId);
  }

  if (manufacturerId) {
    where.push("av.manufacturer_id = ?");
    params.push(manufacturerId);
  }

  if (categoryId) {
    where.push("av.category_id = ?");
    params.push(categoryId);
  }

  if (dateFrom && isISODate(dateFrom) && dateTo && isISODate(dateTo)) {
    where.push("av.data BETWEEN ? AND ?");
    params.push(`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`);
  } else if (dateFrom && isISODate(dateFrom)) {
    where.push("av.data >= ?");
    params.push(`${dateFrom} 00:00:00`);
  } else if (dateTo && isISODate(dateTo)) {
    where.push("av.data <= ?");
    params.push(`${dateTo} 23:59:59`);
  }

  return {
    moduleType: normalizedModule,
    visibility,
    whereSql: where.join(" AND "),
    params,
  };
}

async function listEvaluationFilters(req, res, moduleType) {
  try {
    const context = await buildEvaluationQueryContext(req, res, moduleType);
    if (!context) return;

    const baseWhere = context.whereSql;
    const baseParams = context.params;

    const [users] = await pool.query(
      `
        SELECT DISTINCT
          av.user_id AS value,
          COALESCE(
            NULLIF(TRIM(CONCAT(COALESCE(av.user_firstname, ''), ' ', COALESCE(av.user_lastname, ''))), ''),
            CONCAT('Usuário ', av.user_id)
          ) AS label
        FROM vw_avaliador av
        WHERE ${baseWhere}
          AND av.user_id IS NOT NULL
        ORDER BY label ASC
      `,
      baseParams
    );

    const [manufacturers] = await pool.query(
      `
        SELECT DISTINCT
          av.manufacturer_id AS value,
          av.manufacturer_name AS label
        FROM vw_avaliador av
        WHERE ${baseWhere}
          AND av.manufacturer_id IS NOT NULL
          AND av.manufacturer_name IS NOT NULL
          AND av.manufacturer_name <> ''
        ORDER BY label ASC
      `,
      baseParams
    );

    const [categories] = await pool.query(
      `
        SELECT DISTINCT
          av.category_id AS value,
          av.category_name AS label
        FROM vw_avaliador av
        WHERE ${baseWhere}
          AND av.category_id IS NOT NULL
          AND av.category_name IS NOT NULL
          AND av.category_name <> ''
        ORDER BY label ASC
      `,
      baseParams
    );

    const [enterprises] = await pool.query(
      `
        SELECT DISTINCT
          av.enterprise_id AS value,
          COALESCE(av.enterprise_fantasia, av.enterprise_razao, CONCAT('Empresa ', av.enterprise_id)) AS label
        FROM vw_avaliador av
        WHERE ${baseWhere}
          AND av.enterprise_id IS NOT NULL
        ORDER BY label ASC
      `,
      baseParams
    );

    res.json({
      ok: true,
      data: {
        users,
        manufacturers,
        categories,
        enterprises,
      },
    });
  } catch (error) {
    console.error(`listEvaluationFilters(${moduleType}):`, error);
    res.status(500).json({
      ok: false,
      error: "Erro ao carregar os filtros das avaliações.",
    });
  }
}

function createListHandler(moduleType) {
  return async function listarAvaliacoes(req, res) {
    try {
      const context = await buildEvaluationQueryContext(req, res, moduleType);
      if (!context) return;

      const page = Math.max(1, Number.parseInt(req.query.page || "1", 10));
      const pageSize = Math.min(100, Math.max(6, Number.parseInt(req.query.pageSize || "12", 10)));
      const offset = (page - 1) * pageSize;

      const [rows] = await pool.query(
        `
          SELECT
            ${LIST_SELECT_SQL}
          FROM vw_avaliador av
          WHERE ${context.whereSql}
          ORDER BY av.data DESC, av.avaliador_id DESC, av.user_id DESC
          LIMIT ? OFFSET ?
        `,
        [...context.params, pageSize, offset]
      );

      const [[{ total }]] = await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM vw_avaliador av
          WHERE ${context.whereSql}
        `,
        context.params
      );

      res.json({
        ok: true,
        data: rows,
        total,
        page,
        pageSize,
        moduleType: context.moduleType,
      });
    } catch (error) {
      console.error(`listarAvaliacoes(${moduleType}):`, error);
      res.status(500).json({
        ok: false,
        error: "Erro ao listar avaliações.",
      });
    }
  };
}

async function buscarAvaliacaoPorId(req, res) {
  try {
    const visibility = ensureEvaluationVisibility(req, res);
    if (!visibility) return;

    const { userId, avaliadorId } = getEvaluationKeys(req);
    if (!userId || !avaliadorId) {
      return res.status(400).json({
        ok: false,
        error: "Avaliação inválida.",
      });
    }

    const [rows] = await pool.query(
      `
        SELECT
          ${DETAIL_SELECT_SQL}
        FROM vw_avaliador av
        WHERE av.user_id = ?
          AND av.avaliador_id = ?
          AND ${visibility.where}
        LIMIT 1
      `,
      [userId, avaliadorId, ...visibility.params]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: "Avaliação não encontrada dentro do seu escopo de acesso.",
      });
    }

    const evaluation = rows[0];
    const [photoRows] = await pool.query(
      `
        SELECT
          user_id,
          avaliador_id,
          avaliador_resposta_id,
          avaliador_foto_id,
          tipo,
          image,
          comentario
        FROM ocbr_avaliador_foto
        WHERE user_id = ?
          AND avaliador_id = ?
          AND status = 'A'
          AND image IS NOT NULL
          AND image <> ''
        ORDER BY tipo ASC, avaliador_resposta_id ASC, avaliador_foto_id ASC
      `,
      [evaluation.user_id, evaluation.avaliador_id]
    );

    let checklist = [];
    if (String(evaluation.module_type || "").toLowerCase() === "checkbr") {
      const [checklistRows] = await pool.query(
        `
          SELECT
            user_id,
            avaliador_id,
            basepergunta_id,
            bloco_id,
            bloco_name,
            pergunta_name,
            version_name,
            obs
          FROM avaliador_respostas_view
          WHERE user_id = ?
            AND avaliador_id = ?
          ORDER BY bloco_id ASC, basepergunta_id ASC
        `,
        [evaluation.user_id, evaluation.avaliador_id]
      );

      checklist = buildChecklistDataFromRows(checklistRows, photoRows);
    }

    const seenImages = new Set();
    const equipmentPhotos = [];
    const serialPhotos = [];
    const pushPhoto = (collection, fileName, metadata = {}) => {
      const image = normalizePhotoFileName(fileName);
      if (!image || seenImages.has(image)) return;

      seenImages.add(image);
      collection.push({
        image,
        label: metadata.label || "Foto",
        comentario: metadata.comentario || "",
        obs: metadata.obs || metadata.comentario || "",
        tipo: metadata.tipo || 0,
        avaliador_foto_id: metadata.avaliador_foto_id || 0,
        avaliador_resposta_id: metadata.avaliador_resposta_id || 0,
        source: metadata.source || "table",
      });
    };

    photoRows.forEach((row) => {
      const observation = String(row.comentario || "").trim();

      const photoType = Number(row.tipo || 0);
      if (photoType === 1) {
        pushPhoto(serialPhotos, row.image, {
          label: "",
          comentario: observation,
          obs: observation,
          tipo: photoType,
          avaliador_foto_id: row.avaliador_foto_id,
          avaliador_resposta_id: row.avaliador_resposta_id,
          source: "table",
        });
      } else if (photoType === 2) {
        pushPhoto(equipmentPhotos, row.image, {
          label: "",
          comentario: observation,
          obs: observation,
          tipo: photoType,
          avaliador_foto_id: row.avaliador_foto_id,
          avaliador_resposta_id: row.avaliador_resposta_id,
          source: "table",
        });
      }
    });

    pushPhoto(equipmentPhotos, evaluation.image_equipamento, {
      label: "",
      comentario: "",
      obs: "",
      tipo: 2,
      source: "view_equipment",
    });

    pushPhoto(serialPhotos, evaluation.image_serial, {
      label: "",
      comentario: "",
      obs: "",
      tipo: 1,
      source: "view_serial",
    });

    evaluation.equipment_photos = equipmentPhotos;
    evaluation.serial_photos = serialPhotos;
    evaluation.photos = equipmentPhotos;
    evaluation.checklist = checklist;

    res.json({
      ok: true,
      data: evaluation,
    });
  } catch (error) {
    console.error("buscarAvaliacaoPorId:", error);
    res.status(500).json({
      ok: false,
      error: "Erro ao carregar os detalhes da avaliação.",
    });
  }
}

async function baixarPdfAvaliacao(req, res) {
  try {
    const visibility = ensureEvaluationVisibility(req, res);
    if (!visibility) return;

    const { userId, avaliadorId } = getEvaluationKeys(req);
    if (!userId || !avaliadorId) {
      return res.status(400).json({
        ok: false,
        error: "Avaliação inválida para gerar PDF.",
      });
    }

    const [rows] = await pool.query(
      `
        SELECT
          av.avaliador_id,
          av.user_id,
          av.descricao,
          av.checklist_id
        FROM vw_avaliador av
        WHERE av.user_id = ?
          AND av.avaliador_id = ?
          AND ${visibility.where}
        LIMIT 1
      `,
      [userId, avaliadorId, ...visibility.params]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: "Avaliação não encontrada dentro do seu escopo de acesso.",
      });
    }

    const evaluation = rows[0];
    const token = signAppPdfToken({
      user_id: evaluation.user_id,
      email: req.admin?.email || req.admin?.username || "painel@tratorbr.com",
    });

    if (!token) {
      return res.status(500).json({
        ok: false,
        error: "A integração do PDF não está configurada no painel.",
      });
    }

    const pdfPath = getPdfRouteByEvaluation(evaluation);
    const displayId = getEvaluationDisplayId(evaluation) || String(evaluation.avaliador_id);
    const fallbackName = `${normalizeEvaluationModule(
      Number(evaluation.checklist_id || 0) > 0 ? "checkbr" : "tabelabr"
    )}-${displayId}.pdf`;
    const baseUrls = getAppPdfBaseUrls();

    let lastError = null;

    for (const baseUrl of baseUrls) {
      try {
        const response = await axios.get(`${baseUrl}${pdfPath}`, {
          params: {
            user_id: evaluation.user_id,
            avaliador_id: evaluation.avaliador_id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "arraybuffer",
          timeout: 120000,
          validateStatus: () => true,
        });

        if (response.status >= 200 && response.status < 300) {
          const contentType = response.headers["content-type"] || "application/pdf";
          const contentDisposition =
            response.headers["content-disposition"] ||
            `attachment; filename="${fallbackName}"`;

          res.setHeader("Content-Type", contentType);
          res.setHeader("Content-Disposition", contentDisposition);
          return res.send(Buffer.from(response.data));
        }

        lastError = {
          baseUrl,
          status: response.status,
          body: Buffer.from(response.data || []).toString("utf8").slice(0, 400),
        };
      } catch (error) {
        lastError = {
          baseUrl,
          message: error.message,
          code: error.code,
        };
      }
    }

    console.error("baixarPdfAvaliacao:", lastError);
    return res.status(502).json({
      ok: false,
      error: "Não foi possível gerar o PDF desta avaliação agora.",
    });
  } catch (error) {
    console.error("baixarPdfAvaliacao:", error);
    res.status(500).json({
      ok: false,
      error: "Erro ao gerar o PDF da avaliação.",
    });
  }
}

module.exports = {
  baixarPdfAvaliacao,
  buscarAvaliacaoPorId,
  listarCheckBr: createListHandler("checkbr"),
  listarCheckBrFiltros: (req, res) => listEvaluationFilters(req, res, "checkbr"),
  listarTabelaBr: createListHandler("tabelabr"),
  listarTabelaBrFiltros: (req, res) => listEvaluationFilters(req, res, "tabelabr"),
};

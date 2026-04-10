const pool = require("../config/db");
const { buildEvaluationVisibilityFilter } = require("../services/adminEvaluationService");

const TYPE_CASE_SQL = `
  CASE
    WHEN COALESCE(av.checklist_id, 0) = 0 THEN 'TabelaBR'
    WHEN LOWER(COALESCE(av.checklist_tipo_name, '')) LIKE '%detalh%' THEN 'CheckBR Detalhado'
    ELSE 'CheckBR Resumido'
  END
`;

function isISODate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
}

function formatDateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getDefaultDateRange() {
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setDate(dateTo.getDate() - 6);

  return {
    dateFrom: formatDateOnly(dateFrom),
    dateTo: formatDateOnly(dateTo),
  };
}

function normalizeDateRange(query = {}) {
  const fallback = getDefaultDateRange();
  let dateFrom = isISODate(query.date_from) ? String(query.date_from).trim() : fallback.dateFrom;
  let dateTo = isISODate(query.date_to) ? String(query.date_to).trim() : fallback.dateTo;

  if (dateFrom > dateTo) {
    const swap = dateFrom;
    dateFrom = dateTo;
    dateTo = swap;
  }

  return { dateFrom, dateTo };
}

function ensureVisibility(req, res) {
  const visibility = buildEvaluationVisibilityFilter(req.admin, { alias: "av" });

  if (!req.admin?.user_id || !visibility) {
    res.status(403).json({
      ok: false,
      error: "Sessão inválida para visualizar o dashboard.",
    });
    return null;
  }

  if (visibility.scope.mode === "manager") {
    if (!visibility.scope.scopeValue || visibility.scope.cargoPower < 0) {
      res.status(403).json({
        ok: false,
        error: "Seu usuário não possui escopo válido para visualizar este dashboard.",
      });
      return null;
    }
  }

  return visibility;
}

function buildDashboardContext(req, res) {
  const visibility = ensureVisibility(req, res);
  if (!visibility) return null;

  const { dateFrom, dateTo } = normalizeDateRange(req.query);
  const where = [visibility.where, "av.data BETWEEN ? AND ?"];
  const params = [
    ...visibility.params,
    `${dateFrom} 00:00:00`,
    `${dateTo} 23:59:59`,
  ];
  const enterpriseId = Number.parseInt(req.query.enterprise_id || "0", 10);
  const userId = Number.parseInt(req.query.user_id || "0", 10);

  if (Number.isFinite(enterpriseId) && enterpriseId > 0) {
    where.push("av.enterprise_id = ?");
    params.push(enterpriseId);
  }

  if (Number.isFinite(userId) && userId > 0) {
    where.push("av.user_id = ?");
    params.push(userId);
  }

  return {
    visibility,
    period: { dateFrom, dateTo },
    selectedEnterpriseId: Number.isFinite(enterpriseId) && enterpriseId > 0 ? enterpriseId : 0,
    selectedUserId: Number.isFinite(userId) && userId > 0 ? userId : 0,
    whereSql: where.join(" AND "),
    params,
  };
}

function normalizeRows(rows = [], limit = 8) {
  return rows.slice(0, limit).map((row) => ({
    id: Number(row.id || 0),
    label: row.label || "Não informado",
    total: Number(row.total || 0),
  }));
}

async function obterDashboardAvaliacoes(req, res) {
  try {
    const context = buildDashboardContext(req, res);
    if (!context) return;

    const filterOptionsBaseWhere = [context.visibility.where, "av.data BETWEEN ? AND ?"];
    const filterOptionsBaseParams = [
      ...context.visibility.params,
      `${context.period.dateFrom} 00:00:00`,
      `${context.period.dateTo} 23:59:59`,
    ];
    const usersFilterWhere = [...filterOptionsBaseWhere];
    const usersFilterParams = [...filterOptionsBaseParams];

    if (context.selectedEnterpriseId) {
      usersFilterWhere.push("av.enterprise_id = ?");
      usersFilterParams.push(context.selectedEnterpriseId);
    }

    const [summaryRows] = await pool.query(
      `
        SELECT
          COUNT(*) AS total,
          COUNT(DISTINCT av.user_id) AS total_users,
          COUNT(DISTINCT av.enterprise_id) AS total_enterprises,
          SUM(CASE WHEN COALESCE(av.checklist_id, 0) = 0 THEN 1 ELSE 0 END) AS total_tabelabr,
          SUM(CASE WHEN COALESCE(av.checklist_id, 0) > 0 AND LOWER(COALESCE(av.checklist_tipo_name, '')) LIKE '%detalh%' THEN 1 ELSE 0 END) AS total_checkbr_detalhado,
          SUM(CASE WHEN COALESCE(av.checklist_id, 0) > 0 AND LOWER(COALESCE(av.checklist_tipo_name, '')) NOT LIKE '%detalh%' THEN 1 ELSE 0 END) AS total_checkbr_resumido,
          SUM(CASE WHEN av.gps_latitude IS NOT NULL AND av.gps_longitude IS NOT NULL THEN 1 ELSE 0 END) AS total_with_gps
        FROM vw_avaliador av
        WHERE ${context.whereSql}
      `,
      context.params
    );

    const [evolutionRows] = await pool.query(
      `
        SELECT
          DATE(av.data) AS ref_date,
          COUNT(*) AS total,
          SUM(CASE WHEN COALESCE(av.checklist_id, 0) = 0 THEN 1 ELSE 0 END) AS tabelabr,
          SUM(CASE WHEN COALESCE(av.checklist_id, 0) > 0 AND LOWER(COALESCE(av.checklist_tipo_name, '')) LIKE '%detalh%' THEN 1 ELSE 0 END) AS checkbr_detalhado,
          SUM(CASE WHEN COALESCE(av.checklist_id, 0) > 0 AND LOWER(COALESCE(av.checklist_tipo_name, '')) NOT LIKE '%detalh%' THEN 1 ELSE 0 END) AS checkbr_resumido
        FROM vw_avaliador av
        WHERE ${context.whereSql}
        GROUP BY DATE(av.data)
        ORDER BY ref_date ASC
      `,
      context.params
    );

    const [companyRows] = await pool.query(
      `
        SELECT
          av.enterprise_id AS id,
          COALESCE(av.enterprise_fantasia, av.enterprise_razao, CONCAT('Empresa ', av.enterprise_id)) AS label,
          COUNT(*) AS total
        FROM vw_avaliador av
        WHERE ${context.whereSql}
        GROUP BY av.enterprise_id, label
        ORDER BY total DESC, label ASC
        LIMIT 12
      `,
      context.params
    );

    const [userRows] = await pool.query(
      `
        SELECT
          av.user_id AS id,
          COALESCE(
            NULLIF(TRIM(CONCAT(COALESCE(av.user_firstname, ''), ' ', COALESCE(av.user_lastname, ''))), ''),
            CONCAT('Usuário ', av.user_id)
          ) AS label,
          COUNT(*) AS total,
          SUM(CASE WHEN av.status = 'A' THEN 1 ELSE 0 END) AS total_ok,
          SUM(CASE WHEN av.status = 'G' THEN 1 ELSE 0 END) AS total_incomplete,
          SUM(CASE WHEN av.status = 'D' THEN 1 ELSE 0 END) AS total_deleted
        FROM vw_avaliador av
        WHERE ${context.whereSql}
        GROUP BY av.user_id, label
        ORDER BY total DESC, label ASC
        LIMIT 12
      `,
      context.params
    );

    const [manufacturerRows] = await pool.query(
      `
        SELECT
          av.manufacturer_id AS id,
          COALESCE(av.manufacturer_name, 'Marca não informada') AS label,
          COUNT(*) AS total
        FROM vw_avaliador av
        WHERE ${context.whereSql}
        GROUP BY av.manufacturer_id, label
        ORDER BY total DESC, label ASC
        LIMIT 10
      `,
      context.params
    );

    const [categoryRows] = await pool.query(
      `
        SELECT
          av.category_id AS id,
          COALESCE(av.category_name, 'Categoria não informada') AS label,
          COUNT(*) AS total
        FROM vw_avaliador av
        WHERE ${context.whereSql}
        GROUP BY av.category_id, label
        ORDER BY total DESC, label ASC
        LIMIT 10
      `,
      context.params
    );

    const [typeRows] = await pool.query(
      `
        SELECT
          ${TYPE_CASE_SQL} AS label,
          COUNT(*) AS total
        FROM vw_avaliador av
        WHERE ${context.whereSql}
        GROUP BY label
        ORDER BY total DESC, label ASC
      `,
      context.params
    );

    const [mapRows] = await pool.query(
      `
        SELECT
          ROUND(av.gps_latitude, 5) AS latitude,
          ROUND(av.gps_longitude, 5) AS longitude,
          COALESCE(
            NULLIF(CONCAT_WS(' / ', NULLIF(av.enterprise_cidade, ''), NULLIF(av.enterprise_uf, '')), ''),
            NULLIF(CONCAT_WS(' / ', NULLIF(av.user_cidade, ''), NULLIF(av.user_uf, '')), ''),
            'Localização informada'
          ) AS location,
          MAX(NULLIF(av.gps_url, '')) AS gps_url,
          COUNT(*) AS total
        FROM vw_avaliador av
        WHERE ${context.whereSql}
          AND av.gps_latitude IS NOT NULL
          AND av.gps_longitude IS NOT NULL
        GROUP BY latitude, longitude, location
        ORDER BY total DESC, location ASC
        LIMIT 150
      `,
      context.params
    );

    const [enterpriseFilterRows] = await pool.query(
      `
        SELECT
          av.enterprise_id AS value,
          COALESCE(av.enterprise_fantasia, av.enterprise_razao, CONCAT('Empresa ', av.enterprise_id)) AS label
        FROM vw_avaliador av
        WHERE ${filterOptionsBaseWhere.join(" AND ")}
        GROUP BY av.enterprise_id, label
        ORDER BY label ASC
      `,
      filterOptionsBaseParams
    );

    const [userFilterRows] = await pool.query(
      `
        SELECT
          av.user_id AS value,
          COALESCE(
            NULLIF(TRIM(CONCAT(COALESCE(av.user_firstname, ''), ' ', COALESCE(av.user_lastname, ''))), ''),
            CONCAT('Usuário ', av.user_id)
          ) AS label
        FROM vw_avaliador av
        WHERE ${usersFilterWhere.join(" AND ")}
        GROUP BY av.user_id, label
        ORDER BY label ASC
      `,
      usersFilterParams
    );

    const summary = summaryRows?.[0] || {};

    res.json({
      ok: true,
      data: {
        period: context.period,
        summary: {
          total: Number(summary.total || 0),
          totalUsers: Number(summary.total_users || 0),
          totalEnterprises: Number(summary.total_enterprises || 0),
          totalTabelaBr: Number(summary.total_tabelabr || 0),
          totalCheckBrResumido: Number(summary.total_checkbr_resumido || 0),
          totalCheckBrDetalhado: Number(summary.total_checkbr_detalhado || 0),
          totalWithGps: Number(summary.total_with_gps || 0),
        },
        evolution: evolutionRows.map((row) => ({
          date: formatDateOnly(row.ref_date),
          total: Number(row.total || 0),
          tabelabr: Number(row.tabelabr || 0),
          checkbrResumido: Number(row.checkbr_resumido || 0),
          checkbrDetalhado: Number(row.checkbr_detalhado || 0),
        })),
        companies: normalizeRows(companyRows, 12),
        users: userRows.slice(0, 12).map((row) => ({
          id: Number(row.id || 0),
          label: row.label || "Não informado",
          total: Number(row.total || 0),
          totalOk: Number(row.total_ok || 0),
          totalIncomplete: Number(row.total_incomplete || 0),
          totalDeleted: Number(row.total_deleted || 0),
        })),
        manufacturers: normalizeRows(manufacturerRows, 10),
        categories: normalizeRows(categoryRows, 10),
        types: normalizeRows(typeRows, 10),
        mapPoints: mapRows.map((row) => ({
          latitude: Number(row.latitude || 0),
          longitude: Number(row.longitude || 0),
          location: row.location || "Localização informada",
          total: Number(row.total || 0),
          gpsUrl: row.gps_url || "",
        })),
        filters: {
          enterprises: enterpriseFilterRows.map((row) => ({
            value: Number(row.value || 0),
            label: row.label || "Empresa não informada",
          })),
          users: userFilterRows.map((row) => ({
            value: Number(row.value || 0),
            label: row.label || "Usuário não informado",
          })),
          selectedEnterpriseId: context.selectedEnterpriseId,
          selectedUserId: context.selectedUserId,
        },
      },
    });
  } catch (error) {
    console.error("obterDashboardAvaliacoes:", error);
    res.status(500).json({
      ok: false,
      error: "Erro ao carregar o dashboard de avaliações.",
    });
  }
}

module.exports = {
  obterDashboardAvaliacoes,
};

const db = require('../config/db');
const fetch = require('node-fetch');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

function isPrivateIp(ip) {
  if (!ip) return true;
  const s = String(ip).toLowerCase();
  if (s === '::1' || s === 'localhost') return true;
  if (s.startsWith('::ffff:')) return isPrivateIp(s.replace('::ffff:', ''));
  if (s.includes(':')) return s.startsWith('fc') || s.startsWith('fd');
  return (
    s.startsWith('10.') ||
    s.startsWith('192.168.') ||
    s.startsWith('127.') ||
    (s.startsWith('172.') && (() => {
      const b = parseInt(s.split('.')[1], 10);
      return b >= 16 && b <= 31;
    })())
  );
}

async function hasLocationColumns() {
  try {
    const [rows] = await db.query(`SHOW COLUMNS FROM admin_ips LIKE 'last_city'`);
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

async function fetchJson(url, opt = {}) {
  try {
    const r = await fetch(url, { ...opt, timeout: 7000 });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    return { __err: e.message || String(e) };
  }
}

async function geoLookupFull(ip) {
  if (!ip || isPrivateIp(ip)) return { data: null, errors: ['private-or-empty'] };

  const errors = [];

  {
    const j = await fetchJson(`https://ipapi.co/${ip}/json/`);
    if (!j.__err && j && !j.error) {
      return {
        data: {
          city: j.city || null,
          region: j.region || j.region_code || null,
          country: j.country_name || j.country || null,
          lat: j.latitude != null ? Number(j.latitude) : null,
          lon: j.longitude != null ? Number(j.longitude) : null,
          source: 'ipapi'
        },
        errors
      };
    }
    errors.push(`ipapi.co:${j?.__err || j?.reason || j?.error || 'unknown'}`);
  }

  {
    const k = await fetchJson(`https://ipwho.is/${ip}`);
    if (!k.__err && k && k.success) {
      return {
        data: {
          city: k.city || null,
          region: k.region || k.region_code || null,
          country: k.country || k.country_code || null,
          lat: k.latitude != null ? Number(k.latitude) : null,
          lon: k.longitude != null ? Number(k.longitude) : null,
          source: 'ipwho.is'
        },
        errors
      };
    }
    errors.push(`ipwho.is:${k?.__err || k?.message || 'unknown'}`);
  }

  {
    const h = await fetchJson(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,message`);
    if (!h.__err && h && h.status === 'success') {
      return {
        data: {
          city: h.city || null,
          region: h.regionName || null,
          country: h.country || null,
          lat: h.lat != null ? Number(h.lat) : null,
          lon: h.lon != null ? Number(h.lon) : null,
          source: 'ip-api.com'
        },
        errors
      };
    }
    errors.push(`ip-api.com:${h?.__err || h?.message || 'unknown'}`);
  }

  return { data: null, errors };
}

async function geoCidadeEstado(ip) {
  const { data } = await geoLookupFull(ip);
  if (!data) return '';
  const parts = [];
  if (data.city) parts.push(data.city);
  if (data.region) parts.push(data.region);
  return parts.join(' - ');
}

async function getAdminByRole(role) {
  const [rows] = await db.query(
    `SELECT id, username FROM admins WHERE role = ? AND ativo = 1 LIMIT 1`,
    [role]
  );
  if (!rows.length) throw new Error(`Admin com role "${role}" não encontrado`);
  return rows[0];
}

exports.listarIpsAutorizados = async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      req.connection?.remoteAddress;

    console.log('=== DEBUG STATUS ONLINE ===');
    console.log('IP do cliente detectado:', clientIP);
    console.log('Admin logado:', req.admin);

    const withLoc = await hasLocationColumns();
    const selectLoc = withLoc
      ? `, ai.last_city, ai.last_region, ai.last_country, ai.last_lat, ai.last_lon,
           ai.last_seen_at, ai.last_lookup_at, ai.last_lookup_src`
      : ``;

    const [rows] = await db.query(
      `SELECT ai.id, ai.ip, ai.ativo, ai.descricao, 
              a.id as admin_id, a.username AS login, a.role, a.ultimo_login
              ${selectLoc}
         FROM admin_ips ai
         JOIN admins a ON a.id = ai.admin_id
        WHERE a.role IN ('master','gestor')
        ORDER BY 
          CASE WHEN a.ultimo_login > DATE_SUB(NOW(), INTERVAL 30 MINUTE) THEN 0 ELSE 1 END,
          CASE WHEN a.role = 'master' THEN 0 ELSE 1 END,
          ai.descricao ASC`
    );

    const ips = rows.map((r) => {
      const isOnline = r.ultimo_login && new Date(r.ultimo_login) > new Date(Date.now() - 30 * 60 * 1000);
      const isCurrentIP = clientIP && (
        r.ip === clientIP ||
        (r.ip === '::1' && (clientIP === '127.0.0.1' || clientIP === '::1')) ||
        (r.ip === '127.0.0.1' && (clientIP === '::1' || clientIP === '127.0.0.1')) ||
        (r.ip === 'localhost' && (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost')) ||
        (clientIP === 'localhost' && (r.ip === '127.0.0.1' || r.ip === '::1'))
      );
      const actuallyOnline = isOnline && isCurrentIP;

      let localText = '—';
      if (withLoc) {
        const city = r.last_city || null;
        const region = r.last_region || null;
        const country = r.last_country || null;
        if (city || region || country) {
          localText =
            `${city || ''}${city && region ? ' - ' : ''}${region || ''}${(city || region) && country ? ', ' : ''}${country || ''}`
              .trim()
              .replace(/^[-, ]+|[-, ]+$/g, '');
          if (!localText) localText = '—';
        }
      }

      return {
        id: r.id,
        login: r.login,
        role: r.role,
        ip: r.ip,
        ativo: !!r.ativo,
        online: actuallyOnline,
        descricao: r.descricao || '',
        local: localText,
        ...(withLoc ? {
          last_seen_at: r.last_seen_at || null,
          last_lookup_at: r.last_lookup_at || null,
          last_lookup_src: r.last_lookup_src || null,
          last_lat: r.last_lat || null,
          last_lon: r.last_lon || null,
        } : {})
      };
    });

    console.log('=== FIM DEBUG ===');

    res.json({ ips, total: ips.length });
  } catch (e) {
    console.error('listarIpsAutorizados', e);
    res.status(500).json({ message: 'Erro ao listar IPs' });
  }
};

exports.adicionarIpAutorizado = async (req, res) => {
  const { ip, descricao, targetRole } = req.body;

  console.log('Dados recebidos:', { ip, descricao, targetRole });

  if (!ip || !String(ip).trim()) {
    return res.status(400).json({ message: 'IP é obrigatório' });
  }
  const role = String(targetRole || '').toLowerCase();
  console.log('Role processado:', role);

  if (!['master', 'gestor'].includes(role)) {
    return res.status(400).json({ message: 'Perfil inválido (master ou gestor)' });
  }

  try {
    const targetAdmin = await getAdminByRole(role);
    console.log('Admin encontrado:', targetAdmin);

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `TratorBR (${targetAdmin.username} - ${ip.trim()})`,
      issuer: 'TratorBR',
    });

    await db.query(
      `INSERT INTO admin_ips (admin_id, ip, descricao, twofa_secret, ativo)
       VALUES (?, ?, ?, ?, 1)`,
      [targetAdmin.id, ip.trim(), descricao || null, secret.base32]
    );

    console.log('IP inserido na admin_ips com admin_id:', targetAdmin.id, 'role:', role);

    const [currentAdmin] = await db.query(
      `SELECT ips_autorizados FROM admins WHERE id = ?`,
      [targetAdmin.id]
    );

    let currentIps = [];
    if (currentAdmin[0]?.ips_autorizados) {
      try {
        currentIps = currentAdmin[0].ips_autorizados.split(',').map(ip => ip.trim()).filter(Boolean);
      } catch (e) {
        console.log('Erro ao parsear IPs existentes:', e);
      }
    }

    if (!currentIps.includes(ip.trim())) currentIps.push(ip.trim());

    await db.query(
      `UPDATE admins SET ips_autorizados = ? WHERE id = ?`,
      [currentIps.join(','), targetAdmin.id]
    );

    console.log('Campo ips_autorizados atualizado:', currentIps.join(','));

    const qr_data_url = await qrcode.toDataURL(secret.otpauth_url);

    res.status(201).json({
      message: 'IP adicionado',
      twofa: {
        secret: secret.base32,
        otpauth_url: secret.otpauth_url,
        qr_data_url
      }
    });
  } catch (e) {
    console.error('adicionarIpAutorizado', e);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este IP já está cadastrado para esse perfil' });
    }
    res.status(500).json({ message: 'Erro ao adicionar IP' });
  }
};

exports.removerIpAutorizado = async (req, res) => {
  try {
    const { id } = req.params;
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      req.connection?.remoteAddress;

    const [ipData] = await db.query(
      `SELECT ai.ip, ai.admin_id, a.username 
         FROM admin_ips ai 
         JOIN admins a ON a.id = ai.admin_id 
        WHERE ai.id = ?`,
      [id]
    );

    if (!ipData.length) {
      return res.status(404).json({ message: 'IP não encontrado' });
    }

    const { ip: ipToRemove, admin_id, username } = ipData[0];
    const isOwnIP = clientIP && (ipToRemove === clientIP ||
      (ipToRemove === '::1' && clientIP === '127.0.0.1') ||
      (ipToRemove === '127.0.0.1' && clientIP === '::1'));

    if (isOwnIP) {
      return res.status(403).json({
        message: 'Não é possível remover seu próprio IP. Esta operação deve ser feita diretamente no banco de dados.'
      });
    }

    console.log('Removendo IP:', ipToRemove, 'do admin:', username);

    const [deleteResult] = await db.query(`DELETE FROM admin_ips WHERE id = ?`, [id]);
    if (!deleteResult.affectedRows) {
      return res.status(404).json({ message: 'IP não encontrado' });
    }

    console.log('IP removido da tabela admin_ips');

    const [currentAdmin] = await db.query(
      `SELECT ips_autorizados FROM admins WHERE id = ?`,
      [admin_id]
    );

    if (currentAdmin[0]?.ips_autorizados) {
      try {
        let currentIps = currentAdmin[0].ips_autorizados.split(',').map(ip => ip.trim()).filter(Boolean);
        currentIps = currentIps.filter(ip => ip !== ipToRemove);
        const newIpsString = currentIps.length > 0 ? currentIps.join(',') : null;
        await db.query(
          `UPDATE admins SET ips_autorizados = ? WHERE id = ?`,
          [newIpsString, admin_id]
        );
        console.log('Campo ips_autorizados atualizado:', newIpsString);
      } catch (e) {
        console.log('Erro ao atualizar ips_autorizados:', e);
      }
    }

    const shouldForceLogout = req.admin && req.admin.id === admin_id;

    res.json({
      message: 'IP removido de ambas as tabelas',
      forceLogout: shouldForceLogout,
      removedIP: ipToRemove,
      affectedAdmin: username
    });
  } catch (e) {
    console.error('removerIpAutorizado', e);
    res.status(500).json({ message: 'Erro ao remover IP' });
  }
};

exports.refreshIpLocation = async (req, res) => {
  try {
    const id = req.params.id;

    const withLoc = await hasLocationColumns();
    if (!withLoc) {
      return res.status(409).json({
        message: 'Colunas de localização não encontradas. Aplique a migração antes de usar esta rota.'
      });
    }

    const [rows] = await db.query(
      `SELECT id, ip FROM admin_ips WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
    const rec = rows[0];

    if (isPrivateIp(rec.ip)) {
      return res.status(200).json({ message: 'IP privado/localhost não geolocalizável', skipped: true });
    }

    const { data, errors } = await geoLookupFull(rec.ip);
    if (!data) {
      console.warn('[refreshIpLocation] geo lookup falhou para', rec.ip, '->', errors);
      return res.status(502).json({ message: 'Falha ao resolver localização agora, tente mais tarde', providerErrors: errors });
    }

    await db.query(
      `UPDATE admin_ips
         SET last_city = ?, last_region = ?, last_country = ?,
             last_lat = ?, last_lon = ?, last_lookup_at = NOW(), last_lookup_src = ?
       WHERE id = ?`,
      [data.city, data.region, data.country, data.lat, data.lon, data.source, id]
    );

    res.json({ message: 'Localização atualizada', geo: data });
  } catch (err) {
    console.error('refreshIpLocation', err);
    res.status(500).json({ message: 'Erro ao atualizar localização' });
  }
};

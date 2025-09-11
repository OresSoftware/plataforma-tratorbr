// backend/src/services/ipLocation.js
// Resolve cidade/UF/país/lat/lon a partir do IP com cache no banco feito por quem chama.
// Suporta (opcional) MaxMind local (GeoLite2-City.mmdb) e fallback em ipapi.co

const axios = require('axios');
let maxmindReader = null;

// Carrega MaxMind se MAXMIND_DB_PATH estiver configurado
async function ensureMaxMind() {
  if (!process.env.MAXMIND_DB_PATH) return null;
  if (maxmindReader) return maxmindReader;
  try {
    const maxmind = require('maxmind');
    maxmindReader = await maxmind.open(process.env.MAXMIND_DB_PATH);
    return maxmindReader;
  } catch (e) {
    console.warn('[ipLocation] MaxMind indisponível:', e.message);
    return null;
  }
}

function isPrivate(ip) {
  if (!ip) return true;
  const v4 = ip.includes('.');
  if (ip === '::1') return true;
  if (!v4) {
    // ipv6 privadas (simplificado)
    return ip.startsWith('fc') || ip.startsWith('fd');
  }
  // ipv4 privadas/comuns
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('127.') ||
    (ip.startsWith('172.') && (() => {
      const b = parseInt(ip.split('.')[1], 10);
      return b >= 16 && b <= 31;
    })())
  );
}

/** Retorna { city, region, country, lat, lon, source } ou null */
async function lookupIp(ip) {
  try {
    if (!ip || isPrivate(ip)) return null;

    // 1) Tenta MaxMind local
    const mm = await ensureMaxMind();
    if (mm) {
      const r = mm.get(ip);
      if (r) {
        return {
          city:   r?.city?.names?.en || r?.city?.names?.pt || null,
          region: r?.subdivisions?.[0]?.names?.en || null,
          country:r?.country?.names?.en || null,
          lat:    r?.location?.latitude ?? null,
          lon:    r?.location?.longitude ?? null,
          source: 'maxmind'
        };
      }
    }

    // 2) Fallback simples: ipapi.co (gratuito / limitado)
    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 6000 });
    if (data?.error) return null;

    return {
      city:   data?.city || null,
      region: data?.region || data?.region_code || null,
      country:data?.country_name || data?.country || null,
      lat:    (data?.latitude != null ? Number(data.latitude) : null),
      lon:    (data?.longitude != null ? Number(data.longitude) : null),
      source: 'ipapi'
    };
  } catch (err) {
    console.warn('[ipLocation] lookup falhou para', ip, err.message);
    return null;
  }
}

module.exports = { lookupIp, isPrivate };

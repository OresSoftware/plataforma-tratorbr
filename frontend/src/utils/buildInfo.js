function extractBuildHashFromFileName(fileName = "") {
  const normalized = String(fileName || "").trim();
  const match = normalized.match(/-([A-Za-z0-9_-]{6,})\.(?:js|css)$/);
  return match?.[1] || "";
}

function readBuildHashFromScripts() {
  if (typeof document === "undefined") return "";

  const scripts = Array.from(document.querySelectorAll("script[src]"));
  const assetScript = scripts.find((script) => /\/assets\/index-[^/]+\.(?:js|css)$/.test(script.src));
  if (!assetScript?.src) return "";

  try {
    const pathname = new URL(assetScript.src, window.location.origin).pathname;
    return extractBuildHashFromFileName(pathname.split("/").pop() || "");
  } catch {
    return extractBuildHashFromFileName(assetScript.src.split("/").pop() || "");
  }
}

function readBuildHashFromImportMeta() {
  try {
    if (!import.meta?.url) return "";
    const pathname = new URL(import.meta.url).pathname;
    return extractBuildHashFromFileName(pathname.split("/").pop() || "");
  } catch {
    return "";
  }
}

export function getBuildHashLabel() {
  return readBuildHashFromScripts() || readBuildHashFromImportMeta() || "local";
}

export function getBuildTimeLabel() {
  if (typeof __APP_BUILD_TIME__ === "undefined") return "";

  const raw = String(__APP_BUILD_TIME__ || "").trim();
  if (!raw) return "";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(parsed);
}

export function getEnvironmentLabel() {
  if (typeof window === "undefined") return "APP";

  const host = String(window.location.hostname || "").toLowerCase();

  if (
    host.includes("tratorbradmin") ||
    host.includes("landingpage-dev") ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return "DEV";
  }

  return "PROD";
}

export function getAdminAllowedPages(admin = {}) {
  const pages = new Set();
  const storedPages = Array.isArray(admin?.allowedPages)
    ? admin.allowedPages
    : Array.isArray(admin?.permissoes)
      ? admin.permissoes
      : [];

  storedPages.forEach((page) => {
    const pageKey = typeof page === "string" ? page : page?.page_key;
    if (pageKey) pages.add(pageKey);
  });

  const userGroupId = Number(admin?.user_group_id || 0);
  const enterpriseId = Number(admin?.enterprise_id || 0);

  if (userGroupId === 1 || userGroupId === 2) {
    pages.add("growth");
    pages.add("dashboard");
    pages.add("usuarios");
    pages.add("empresas");
    pages.add("contatos");
  } else if (userGroupId === 3) {
    pages.add("dashboard");
    pages.add("usuarios");
    pages.add("empresas");
  } else if (userGroupId === 4) {
    pages.add("dashboard");
    pages.add("usuarios");
    if (enterpriseId > 0) {
      pages.add("empresas");
    } else {
      pages.delete("empresas");
    }
  }

  if (userGroupId !== 1 && userGroupId !== 2) {
    pages.delete("growth");
    pages.delete("contatos");
  }

  return Array.from(pages);
}

export function hasAdminPagePermission(admin = {}, pageKey) {
  const allowedPages = getAdminAllowedPages(admin);
  return allowedPages.some((page) => page === pageKey || page?.page_key === pageKey);
}

export function getAdminHomeRoute(admin = {}) {
  if (admin?.home_path) {
    return admin.home_path;
  }

  const userGroupId = Number(admin?.user_group_id || 0);
  return userGroupId === 1 || userGroupId === 2 ? "/admin/growth" : "/admin/dashboard";
}

export function getAdminFirstAllowedRoute(admin = {}) {
  const preferredRoutes = [
    ["growth", "/admin/growth"],
    ["dashboard", "/admin/dashboard"],
    ["empresas", "/admin/empresas"],
    ["usuarios", "/admin/usuarios"],
    ["contatos", "/admin/contato"],
  ];

  for (const [pageKey, route] of preferredRoutes) {
    if (hasAdminPagePermission(admin, pageKey)) {
      return route;
    }
  }

  return getAdminHomeRoute(admin);
}

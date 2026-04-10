import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAdminFirstAllowedRoute, getAdminHomeRoute, getAdminAllowedPages } from "../utils/adminNavigation";

export default function ProtectedRoute({ children, requireMaster = false, requiredPermission = null }) {
  const location = useLocation();
  const token = localStorage.getItem("adminToken");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkPermission = () => {
      try {
        // Se não há token, redireciona para login
        if (!token) {
          setRedirectPath("/admin/login");
          setIsLoading(false);
          return;
        }

        const admin = JSON.parse(localStorage.getItem("adminData") || "{}");
        const allowedPages = getAdminAllowedPages(admin);

        if (requireMaster) {
          setRedirectPath(getAdminHomeRoute(admin));
          setIsLoading(false);
          return;
        }

        if (!requiredPermission) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        const hasPermission = allowedPages.some(
          (p) => p === requiredPermission || p?.page_key === requiredPermission
        );

        if (hasPermission) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        const firstAllowedPage = getFirstAllowedPage(admin, allowedPages);
        setRedirectPath(firstAllowedPage || "/admin/acesso-negado");
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao verificar permissão:", error);
        setRedirectPath("/admin/login");
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [token, requireMaster, requiredPermission]);

  // Função para mapear permissões para rotas
  const getFirstAllowedPage = (admin, permissoes) => {
    if (!permissoes || permissoes.length === 0) {
      return null;
    }
    return getAdminFirstAllowedRoute(admin);
  };

  // Se está carregando, mostrar loading
  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "18px",
            color: "#333",
            marginBottom: "20px"
          }}>
            Verificando permissões...
          </div>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #15383E",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }}>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  // Se precisa redirecionar
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Se está autorizado, renderizar o elemento
  if (isAuthorized) {
    return children;
  }

  // Fallback (não deveria chegar aqui)
  return <Navigate to="/admin/login" replace />;
}

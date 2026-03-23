import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requireMaster = false, requiredPermission = null }) {
  const location = useLocation();
  const token = localStorage.getItem("adminToken");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkPermission = () => {
      try {
        if (!token) {
          setRedirectPath("/admin/login");
          setIsLoading(false);
          return;
        }

        const admin = JSON.parse(localStorage.getItem("adminData") || "{}");

        if (requireMaster) {
          if (admin?.role !== "master") {
            setRedirectPath("/admin/dashboard");
            setIsLoading(false);
            return;
          }
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        if (admin?.role === "master") {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        if (admin?.role === "funcionario") {
          if (!requiredPermission) {
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          }

          const hasPermission = admin.permissoes?.some(
            p => p === requiredPermission || p.page_key === requiredPermission
          );

          if (hasPermission) {
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          }

          const firstAllowedPage = getFirstAllowedPage(admin.permissoes);

          if (firstAllowedPage) {
            setRedirectPath(firstAllowedPage);
          } else {
            setRedirectPath("/admin/acesso-negado");
          }

          setIsLoading(false);
          return;
        }

        setRedirectPath("/admin/login");
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao verificar permissão:", error);
        setRedirectPath("/admin/login");
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [token, requireMaster, requiredPermission]);

  const getFirstAllowedPage = (permissoes) => {
    if (!permissoes || permissoes.length === 0) {
      return null;
    }

    const pageKeyToRoute = {
      "dashboard": "/admin/dashboard",
      "usuarios": "/admin/usuarios",
      "empresas": "/admin/empresas",
      "contatos": "/admin/contato",
      "ips": "/admin/ips"
    };

    for (const perm of permissoes) {
      const pageKey = typeof perm === "string" ? perm : perm.page_key;
      if (pageKeyToRoute[pageKey]) {
        return pageKeyToRoute[pageKey];
      }
    }

    return null;
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5" }}>
        <div style={{
          textAlign: "center"
        }}>
          <div style={{ fontSize: "18px", color: "#333", marginBottom: "20px" }}>
            Verificando permissões...
          </div>
          <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #15383E", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}>
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

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (isAuthorized) {
    return children;
  }

  return <Navigate to="/admin/login" replace />;
}

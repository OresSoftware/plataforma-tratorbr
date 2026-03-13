import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isUsuarioLogado } from "../services/apiUserAuth";

export default function ProtectedRouteUser({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const logado = isUsuarioLogado();
        setIsAuthorized(logado);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", color: "#333", marginBottom: "20px" }}>
                        Verificando acesso...
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

    if (!isAuthorized) {
        return <Navigate to="/entrar" replace />;
    }

    return children;
}
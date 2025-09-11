import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requireMaster = false }) {
  const location = useLocation();
  const token = localStorage.getItem("adminToken");

  // Se não há token, redireciona para login
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Se requer master, verifica o role
  if (requireMaster) {
    const admin = JSON.parse(localStorage.getItem("adminData") || "{}");
    if (admin?.role !== "master") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
}


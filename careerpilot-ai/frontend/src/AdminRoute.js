import React from "react";

import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  const email = localStorage.getItem("email");

  const isAdmin = email === "admin@careerpilot.ai";

  if (!token || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;

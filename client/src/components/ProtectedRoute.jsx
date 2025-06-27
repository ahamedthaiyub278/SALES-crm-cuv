import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isAllowed, setIsAllowed] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        setIsAllowed(false); 
      } else if (allowedRoles && !allowedRoles.includes(role)) { //un know n apo
        setIsAllowed("unauthorized"); 
      } else {
        setIsAllowed(true); 
      }
    };

    checkAccess();
  }, [location.pathname]);

  if (isAllowed === null) {
    return <LoadingScreen />;
  }

  if (isAllowed === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAllowed === "unauthorized") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

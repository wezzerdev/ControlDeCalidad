import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPermissions } from '../../data/mockData';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: keyof UserPermissions;
}

export function PermissionGuard({ children, permission }: PermissionGuardProps) {
  const { user } = useAuth();
  
  // If not logged in, ProtectedRoute should have caught it, but safety first
  if (!user) return <Navigate to="/login" replace />;

  // If permissions are defined and specifically set to false for this section
  if (user.permissions && user.permissions[permission] === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground">
          No tienes permisos suficientes para acceder a esta sección.
          <br />
          Contacta a tu administrador si crees que es un error.
        </p>
      </div>
    );
  }
  
  return <>{children}</>;
}

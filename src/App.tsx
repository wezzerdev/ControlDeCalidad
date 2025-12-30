import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { CompanyProvider } from './context/CompanyContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PermissionGuard } from './components/common/PermissionGuard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Normas } from './pages/Normas';
import { Proyectos } from './pages/Proyectos';
import { Muestras } from './pages/Muestras';
import Ensayos from './pages/Ensayos';
import Certificados from './pages/Certificados';
import Account from './pages/Account';
import Planes from './pages/Planes';
import Settings from './pages/Settings';
import Home from './pages/Home';
import { ForgotPassword } from './pages/ForgotPassword';
import Inventarios from './pages/Inventarios';
import Resultados from './pages/Resultados';
import Auditoria from './pages/Auditoria';
import Notificaciones from './pages/Notificaciones';
import Verification from './pages/Verification';

import { Privacy } from './pages/legal/Privacy';
import { Terms } from './pages/legal/Terms';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CompanyProvider>
            <DataProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/legal/privacy" element={<Privacy />} />
                  <Route path="/legal/terms" element={<Terms />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify/:type/:id" element={<Verification />} />
                  
                  {/* Redirects for legacy routes */}
                  <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/normas" element={<Navigate to="/app/normas" replace />} />
                  <Route path="/proyectos" element={<Navigate to="/app/proyectos" replace />} />
                  <Route path="/muestras" element={<Navigate to="/app/muestras" replace />} />
                  <Route path="/ensayos" element={<Navigate to="/app/ensayos" replace />} />
                  <Route path="/certificados" element={<Navigate to="/app/certificados" replace />} />
                  
                  <Route path="/app" element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="normas" element={<Normas />} />
                    <Route path="proyectos" element={
                      <PermissionGuard permission="access_proyectos">
                        <Proyectos />
                      </PermissionGuard>
                    } />
                    <Route path="muestras" element={
                      <PermissionGuard permission="access_muestras">
                        <Muestras />
                      </PermissionGuard>
                    } />
                    <Route path="ensayos" element={
                      <PermissionGuard permission="access_ensayos">
                        <Ensayos />
                      </PermissionGuard>
                    } />
                    <Route path="certificados" element={
                      <PermissionGuard permission="access_certificados">
                        <Certificados />
                      </PermissionGuard>
                    } />
                    <Route path="inventarios" element={
                      <PermissionGuard permission="access_inventarios">
                        <Inventarios />
                      </PermissionGuard>
                    } />
                    <Route path="resultados" element={
                      <PermissionGuard permission="access_resultados">
                        <Resultados />
                      </PermissionGuard>
                    } />
                    <Route path="auditoria" element={
                      <PermissionGuard permission="access_auditoria">
                        <Auditoria />
                      </PermissionGuard>
                    } />
                    <Route path="notificaciones" element={
                      <PermissionGuard permission="access_notificaciones">
                        <Notificaciones />
                      </PermissionGuard>
                    } />
                    <Route path="account" element={<Account />} />
                    <Route path="planes" element={<Planes />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<div className="p-8">Página no encontrada</div>} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </DataProvider>
          </CompanyProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

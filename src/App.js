import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import OperatorList from './pages/admin/OperatorList';
import OperatorDetail from './pages/admin/OperatorDetail';
import Unauthorized from './pages/Unauthorized';
import AddOperateur from './pages/admin/AddOperateur';
import EditOperateur from './pages/admin/EditOperateur';
import AdminRoutes from './routes/AdminRoutes';
import OperatorRoutes from './routes/OperatorRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Routes protégées pour admin - regroupées */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Route>


        {/* Routes protégées pour opérateur */}
        <Route element={<ProtectedRoute allowedRoles={['operateur']} />}>
          <Route path="/operateur/*" element={<OperatorRoutes />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="/" element={
          localStorage.getItem('adminToken') ? <Navigate to="/admin/dashboard" replace /> :
            localStorage.getItem('operateurToken') ? <Navigate to="/operateur/dashboard" replace /> :
              <Navigate to="/login" replace />
        } />

        {/* Route fallback pour les URLs inexistantes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
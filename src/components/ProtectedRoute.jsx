import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const adminToken = localStorage.getItem('adminToken');
    const operatorToken = localStorage.getItem('operateurToken');

    if (!adminToken && !operatorToken) {
        return <Navigate to="/login" replace />;
    }

    if (adminToken && allowedRoles.includes('admin')) {
        return <Outlet />;
    }

    if (operatorToken && allowedRoles.includes('operateur')) {
        return <Outlet />;
    }

    // Si le token ne correspond pas au rôle requis
    return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
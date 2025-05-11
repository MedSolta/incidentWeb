import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import OperatorList from '../pages/admin/OperatorList';
import AdminDashboard from '../pages/admin/AdminDashboard';
import EditOperateur from '../pages/admin/EditOperateur';
import AddOperateur from '../pages/admin/AddOperateur';
import OperatorDetail from '../pages/admin/OperatorDetail';
import TechnicienList from '../pages/admin/TechnicienList';
import EditTechnicien from '../pages/admin/EditTechnicien';
import TechnicienDetail from '../pages/admin/TechnicienDetail';
import AddTechnicien from '../pages/admin/AddTechnicien ';
import AdminProfile from '../pages/admin/AdminProfile';
import MessagesPage from '../pages/admin/MessagesPage';
import MessagesPageOp from '../pages/admin/MessagesPagesOp';


const AdminRoutes = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeItem, setActiveItem] = useState('tableau-de-bord');

    return (
        <AdminLayout
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
        >
            <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="operator-list" element={<OperatorList />} />
                <Route path="operator-detail/:id" element={<OperatorDetail />} />
                <Route path="operator-add" element={<AddOperateur />} />
                <Route path="operator-edit/:id" element={<EditOperateur />} />
                <Route path="technicien-edit/:id" element={<EditTechnicien />} />
                <Route path="technicien-detail/:id" element={<TechnicienDetail />} />
                <Route path="technicien-list" element={<TechnicienList />} />
                <Route path="technicien-add" element={<AddTechnicien />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="messages/technicien" element={<MessagesPage />} />
                <Route path="messages/operateur" element={<MessagesPageOp />} />

            </Routes>
        </AdminLayout>
    );
};

export default AdminRoutes;
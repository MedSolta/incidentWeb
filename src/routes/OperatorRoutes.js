import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import OperateurLayout from '../components/OperateurLayout';
import OperateurDashboard from '../pages/operateur/OperateurDashboard';
import OperateurProfile from '../pages/operateur/OperateurProfile';
import MessagesPage from '../pages/operateur/MessagesPage';
import AddMission from '../pages/operateur/AddMission';
import MissionsList from '../pages/operateur/MissionsList';

const OperatorRoutes = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeItem, setActiveItem] = useState('dashboard');

    return (
        <OperateurLayout
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
        >
            <Routes>
                <Route path="dashboard" element={<OperateurDashboard />} />
                <Route path="profile" element={<OperateurProfile />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="add-mission" element={<AddMission />} />
                <Route path="missions" element={<MissionsList />} />
            </Routes>
        </OperateurLayout>
    );
};

export default OperatorRoutes;

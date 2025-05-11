import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import OperateurForm from '../../components/OperateurForm';

const AddOperateur = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/operateur/register', formData);
            navigate('/admin/operator-list');
        } catch (err) {
            if (err.response?.status === 400) {
                setError('Email déja utilisé');
            }
            setError(err.response?.data?.message || "Erreur lors de l'ajout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>

            <OperateurForm
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/operator-list')}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default AddOperateur;
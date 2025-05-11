import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import OperateurForm from '../../components/OperateurForm';

const EditOperateur = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const fetchOperateur = async () => {
            try {
                const response = await api.get(`/operateurs/${id}`);
                setInitialData(response.data);
            } catch (err) {
                setError("Erreur lors du chargement");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOperateur();
    }, [id]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            await api.put(`/operateurs/${id}`, formData);
            navigate('/admin/operator-list');
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la modification");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !initialData) return <div className="text-center my-5">Chargement...</div>;

    return (

        <div>
            <OperateurForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/operator-list')}
                loading={loading}
                error={error}
            />
        </div >
    );
};

export default EditOperateur;
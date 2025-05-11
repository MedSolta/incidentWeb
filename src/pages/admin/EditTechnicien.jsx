import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import TechnicienForm from '../../components/TechnicienForm';

const EditTechnicien = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const fetchTechnicien = async () => {
            try {
                const response = await api.get(`/techniciens/${id}`);
                setInitialData(response.data);
            } catch (err) {
                setError("Erreur lors du chargement du technicien");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTechnicien();
    }, [id]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const formDataToSend = new FormData();

            // Ajoute tous les champs au FormData
            Object.keys(formData).forEach(key => {
                if (key === 'file') {
                    if (formData[key] instanceof File) {
                        formDataToSend.append('file', formData[key]);
                    }
                    // Si file est une string (URL existante), on ne l'envoie pas
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            await api.put(`/techniciens/${id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/admin/technicien-list');
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
            <TechnicienForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/technicien-list')}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default EditTechnicien;
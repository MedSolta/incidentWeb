import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TechnicienForm from '../../components/TechnicienForm';

const AddTechnicien = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError(null);

        try {
            // Pas besoin de créer un nouveau FormData car TechnicienForm
            // envoie déjà un objet FormData correctement structuré
            const response = await api.post('/auth/technicien/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data) {
                navigate('/admin/technicien-list', {
                    state: { success: 'Technicien ajouté avec succès' }
                });
            }
        } catch (err) {
            let errorMessage = "Erreur lors de l'ajout du technicien";

            if (err.response) {
                // Erreur du serveur
                if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data?.errors) {
                    errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
                }
            } else if (err.message) {
                // Erreur de validation côté client
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error('Erreur détaillée:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <TechnicienForm
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/technicien-list')}
                loading={loading}
                error={error}
                onError={setError}
            />
        </div>
    );
};

export default AddTechnicien;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { PlusCircle, Search, Eye, Calendar, MapPin } from 'lucide-react';
import api from '../../utils/api';

const MissionsList = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                // Récupérer l'ID de l'opérateur connecté
                const user = JSON.parse(localStorage.getItem('operateurInfo'));
                if (!user || !user.id) {
                    throw new Error("Impossible de récupérer les informations de l'opérateur connecté");
                }

                const response = await api.get(`/incidents/operateur/${user.id}`);
                setMissions(response.data);
            } catch (err) {
                console.error('Erreur lors du chargement des missions:', err);
                setError(err.response?.data?.message || "Une erreur est survenue lors du chargement des missions");
            } finally {
                setLoading(false);
            }
        };

        fetchMissions();
    }, []);

    // Filtrer les missions en fonction du terme de recherche
    const filteredMissions = missions.filter(mission =>
        mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.adresse.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fonction pour formater la date
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Fonction pour obtenir le statut avec badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge bg="warning">En attente</Badge>;
            case 'in_progress':
                return <Badge bg="info">En cours</Badge>;
            case 'completed':
                return <Badge bg="success">Terminée</Badge>;
            case 'cancelled':
                return <Badge bg="danger">Annulée</Badge>;
            default:
                return <Badge bg="secondary">Non assignée</Badge>;
        }
    };

    return (
        <div className="container-fluid py-4">
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">Mes Missions</h2>
                        <Link to="/operateur/add-mission" className="btn btn-primary">
                            <PlusCircle size={18} className="me-2" />
                            Nouvelle Mission
                        </Link>
                    </div>

                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <div className="mb-4">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <Search size={18} className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Rechercher une mission..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Chargement des missions...</p>
                        </div>
                    ) : filteredMissions.length === 0 ? (
                        <div className="text-center my-5">
                            <p className="mb-3 text-muted">Aucune mission trouvée</p>
                            <Link to="/operateur/add-mission" className="btn btn-outline-primary">
                                <PlusCircle size={18} className="me-2" />
                                Créer une nouvelle mission
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Titre</th>
                                        <th>Client</th>
                                        <th>Lieu</th>
                                        <th>Date</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMissions.map((mission) => (
                                        <tr key={mission.id}>
                                            <td className="fw-medium">{mission.titre}</td>
                                            <td>{mission.nom}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <MapPin size={16} className="text-muted me-1" />
                                                    <span>{mission.code_postal}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Calendar size={16} className="text-muted me-1" />
                                                    <span>{formatDate(mission.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(mission.status)}</td>
                                            <td>
                                                <Link to={`/operateur/mission/${mission.id}`} className="btn btn-sm btn-outline-primary">
                                                    <Eye size={16} className="me-1" />
                                                    Détails
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default MissionsList;
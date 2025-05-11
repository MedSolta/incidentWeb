import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { ArrowLeft, Edit, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const OperatorDetail = () => {
    const { id } = useParams();
    const [operateur, setOperateur] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOperateur = async () => {
            try {
                const response = await api.get(`/operateurs/${id}`);
                setOperateur(response.data);
            } catch (err) {
                setError('Opérateur non trouvé');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOperateur();
    }, [id]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="container py-4">
            <Alert variant="danger" className="d-flex align-items-center">
                <span className="me-2">✕</span>
                <div>{error}</div>
            </Alert>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button
                    variant="light"
                    onClick={() => navigate(-1)}
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                >
                    <ArrowLeft size={18} />
                    <span>Retour</span>
                </Button>

                <Button
                    variant="primary"
                    onClick={() => navigate(`/admin/operator-edit/${operateur.id}`)}
                    className="d-flex align-items-center gap-2 px-4 py-2"
                >
                    <Edit size={16} />
                    <span>Modifier</span>
                </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-light py-4 px-4 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h4 fw-bold mb-1">
                                {operateur.nom || operateur.Name}
                            </h1>
                            <div className="text-muted small">ID: {operateur.id}</div>
                        </div>

                        <span className={`badge rounded-pill ${operateur.disabled ? 'bg-danger-light text-danger' : 'bg-success-light text-success'}`}>
                            {operateur.disabled ? 'Désactivé' : 'Actif'}
                        </span>
                    </div>
                </div>

                <Card.Body className="p-0">
                    <Row className="g-0">
                        <Col md={6} className="border-end p-4">
                            <div className="mb-4">
                                <h5 className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <User size={18} />
                                    <span>Informations personnelles</span>
                                </h5>
                                <div className="ps-4">
                                    <div className="mb-3">
                                        <div className="text-muted small">Nom complet</div>
                                        <div className="fw-medium">{operateur.nom || operateur.name}</div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-muted small">Email</div>
                                        <div className="fw-medium d-flex align-items-center gap-2">
                                            <Mail size={16} className="text-primary" />
                                            <a href={`mailto:${operateur.email}`} className="text-decoration-none">
                                                {operateur.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col md={6} className="p-4">
                            <div className="mb-4">
                                <h5 className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <Phone size={18} />
                                    <span>Coordonnées</span>
                                </h5>
                                <div className="ps-4">
                                    <div className="mb-3">
                                        <div className="text-muted small">Téléphone</div>
                                        <div className="fw-medium d-flex align-items-center gap-2">
                                            <Phone size={16} className="text-primary" />
                                            <a href={`tel:${operateur.telephone}`} className="text-decoration-none">
                                                {operateur.telephone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <Calendar size={18} />
                                    <span>Dates</span>
                                </h5>
                                <div className="ps-4">
                                    <div>
                                        <div className="text-muted small">Date de création</div>
                                        <div className="fw-medium">
                                            {new Date(operateur.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default OperatorDetail;
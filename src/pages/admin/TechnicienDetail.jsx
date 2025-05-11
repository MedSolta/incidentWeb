import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { ArrowLeft, Edit, MapPin, User, Mail, Phone, Clock } from 'lucide-react';

const TechnicienDetail = () => {
    const { id } = useParams();
    const [technicien, setTechnicien] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTechnicien = async () => {
            try {
                const response = await api.get(`/techniciens/${id}`);
                setTechnicien(response.data);
            } catch (err) {
                setError('Technicien non trouvé');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTechnicien();
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

    if (!technicien) return (
        <div className="container py-4">
            <Alert variant="warning">
                Aucune donnée disponible
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
                    onClick={() => navigate(`/admin/technicien-edit/${technicien.id}`)}
                    className="d-flex align-items-center gap-2 px-4 py-2"
                >
                    <Edit size={16} />
                    <span>Modifier</span>
                </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-light py-4 px-4 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            {/* Photo de profil en cercle */}
                            <div className="position-relative">
                                {technicien.file ? (
                                    <div
                                        className="rounded-circle overflow-hidden"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            border: '3px solid #fff',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <img
                                            src={`${technicien.file}`}
                                            alt={`${technicien.prenom} ${technicien.nom}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            border: '3px solid #fff',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                            fontSize: '32px'
                                        }}
                                    >
                                        {technicien.prenom.charAt(0)}{technicien.nom.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h1 className="h4 fw-bold mb-1">
                                    {technicien.prenom} {technicien.nom}
                                </h1>
                                <div className="text-muted small d-flex align-items-center gap-2">
                                    <span className="bg-light rounded-pill px-3 py-1 d-inline-flex align-items-center">
                                        <span className="text-primary fw-medium me-1">ID:</span>
                                        {technicien.id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <span className={`badge rounded-pill ${technicien.disponibilite ? 'bg-success-light text-success' : 'bg-secondary-light text-secondary'}`}>
                                {technicien.disponibilite ? 'Disponible' : 'Indisponible'}
                            </span>
                            <span className={`badge rounded-pill ${technicien.acceptation ? 'bg-primary-light text-primary' : 'bg-warning-light text-warning'}`}>
                                {technicien.acceptation ? 'Accepté' : 'En attente'}
                            </span>
                        </div>
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
                                        <div className="fw-medium">{technicien.prenom} {technicien.nom}</div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-muted small">Email</div>
                                        <div className="fw-medium d-flex align-items-center gap-2">
                                            <Mail size={16} className="text-primary" />
                                            <a href={`mailto:${technicien.email}`} className="text-decoration-none">
                                                {technicien.email}
                                            </a>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted small">Téléphone</div>
                                        <div className="fw-medium d-flex align-items-center gap-2">
                                            <Phone size={16} className="text-primary" />
                                            <a href={`tel:${technicien.telephone}`} className="text-decoration-none">
                                                {technicien.telephone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col md={6} className="p-4">
                            <div className="mb-4">
                                <h5 className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <MapPin size={18} />
                                    <span>Localisation</span>
                                </h5>
                                <div className="ps-4">
                                    <div className="mb-3">
                                        <div className="text-muted small">Code postal</div>
                                        <div className="fw-medium">{technicien.code_postal}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <Clock size={18} />
                                    <span>Activité</span>
                                </h5>
                                <div className="ps-4">
                                    <div>
                                        <div className="text-muted small">Dernière connexion</div>
                                        <div className="fw-medium">
                                            {technicien.date_login ? new Date(technicien.date_login).toLocaleString() : 'Jamais connecté'}
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

export default TechnicienDetail;
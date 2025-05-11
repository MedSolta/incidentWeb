import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { ArrowLeft, Send, FileText, MapPin, Phone, Info, User, Tag } from 'lucide-react';
import api from '../../utils/api';

const AddMission = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        code_postal: '',
        fiche_technique: '',
        telephone: '',
        details: '',
        titre: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Récupérer l'ID de l'opérateur connecté depuis le localStorage
            const user = JSON.parse(localStorage.getItem('operateurInfo'));
            if (!user || !user.id) {
                throw new Error("Impossible de récupérer les informations de l'opérateur connecté");
            }

            // Ajouter l'ID de l'opérateur au formData
            const missionData = {
                ...formData,
                id_operateur: user.id
            };

            const response = await api.post('/operateurs/add-mision/new', missionData);

            setSuccess('Mission ajoutée avec succès');
            setFormData({
                nom: '',
                adresse: '',
                code_postal: '',
                fiche_technique: '',
                telephone: '',
                details: '',
                titre: ''
            });
            setValidated(false);

            // Rediriger après 2 secondes
            setTimeout(() => {
                navigate('/operateur/missions');
            }, 2000);

        } catch (err) {
            console.error('Erreur lors de l\'ajout de la mission:', err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'ajout de la mission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <Card className="border-0 shadow-lg">
                        <Card.Body className="p-5">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 className="fw-bold text-primary">Nouvelle Mission</h2>
                                    <p className="text-muted">Remplissez les informations pour créer une nouvelle mission</p>
                                </div>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => navigate(-1)}
                                    className="d-flex align-items-center"
                                >
                                    <ArrowLeft size={18} className="me-2" />
                                    Retour
                                </Button>
                            </div>

                            {error && (
                                <Alert variant="danger" className="mb-4">
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success" className="mb-4">
                                    {success}
                                </Alert>
                            )}

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="d-flex align-items-center">
                                                <Tag size={16} className="me-2 text-primary" />
                                                Titre de la mission
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="titre"
                                                value={formData.titre}
                                                onChange={handleChange}
                                                placeholder="Ex: Réparation système électrique"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Veuillez saisir un titre pour la mission
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="d-flex align-items-center">
                                                <User size={16} className="me-2 text-primary" />
                                                Nom du client
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleChange}
                                                placeholder="Ex: Entreprise XYZ"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Veuillez saisir le nom du client
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="d-flex align-items-center">
                                                <MapPin size={16} className="me-2 text-primary" />
                                                Adresse
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="adresse"
                                                value={formData.adresse}
                                                onChange={handleChange}
                                                placeholder="Ex: 123 Rue de Paris"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Veuillez saisir l'adresse
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="d-flex align-items-center">
                                                <MapPin size={16} className="me-2 text-primary" />
                                                Code postal
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="code_postal"
                                                value={formData.code_postal}
                                                onChange={handleChange}
                                                placeholder="Ex: 75001"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Veuillez saisir le code postal
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="d-flex align-items-center">
                                                <Phone size={16} className="me-2 text-primary" />
                                                Téléphone
                                            </Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="telephone"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                                placeholder="Ex: 0123456789"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Veuillez saisir un numéro de téléphone
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="d-flex align-items-center">
                                                <FileText size={16} className="me-2 text-primary" />
                                                Fiche technique
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fiche_technique"
                                                value={formData.fiche_technique}
                                                onChange={handleChange}
                                                placeholder="Ex: Modèle XYZ-123"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Veuillez saisir les informations techniques
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="d-flex align-items-center">
                                        <Info size={16} className="me-2 text-primary" />
                                        Détails de la mission
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="details"
                                        value={formData.details}
                                        onChange={handleChange}
                                        placeholder="Décrivez la mission en détail..."
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Veuillez saisir les détails de la mission
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => navigate(-1)}
                                        className="me-md-2"
                                        disabled={loading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="d-flex align-items-center"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} className="me-2" />
                                                Créer la mission
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AddMission;
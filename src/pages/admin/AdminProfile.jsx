import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Alert, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import { Edit, Save, X, Eye, EyeOff, User, Mail, Phone, Lock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';

const AdminProfile = () => {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const response = await api.get('/admins/profile');
                setAdminData(response.data.data);
                setFormData(response.data.data);
                setFieldErrors({});
            } catch (err) {
                setError('Erreur lors du chargement du profil');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminProfile();
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    }, [fieldErrors]);

    const validateForm = () => {
        const errors = {};
        if (!formData.nom?.trim()) errors.nom = "Le nom est requis";
        if (!formData.prenom?.trim()) errors.prenom = "Le prénom est requis";
        if (!formData.email?.includes('@')) errors.email = "Email invalide";
        if (!formData.tel?.match(/^[0-9]{8}$/)) errors.tel = "Numéro invalide (8 chiffres)";

        if (formData.newPassword && formData.newPassword.length < 5) {
            errors.newPassword = "Le mot de passe doit contenir au moins 5 caractères";
        }
        if (formData.newPassword && !formData.currentPassword) {
            errors.currentPassword = "Le mot de passe actuel est requis pour changer le mot de passe";
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setEditLoading(true);
        setError('');
        setFieldErrors({});

        try {
            const response = await api.put('/admins/profile', formData);
            setAdminData(response.data.data);
            setShowModal(false);
        } catch (err) {
            setShowModal(true);

            if (err.response?.data?.errors) {
                const serverErrors = {};
                err.response.data.errors.forEach(error => {
                    serverErrors[error.path] = error.message;
                });
                setFieldErrors(serverErrors);
            }
            else if (err.response?.status === 401) {
                setFieldErrors({
                    currentPassword: err.response.data?.message || 'Mot de passe actuel incorrect'
                });
            }
            else {
                setError(err.response?.data?.message || 'Erreur lors de la modification');
            }
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Chargement...</span>
            </Spinner>
        </div>
    );

    if (error) return (
        <div className="container py-4">
            <Alert variant="danger" className="shadow-sm">
                <div className="d-flex align-items-center">
                    <X className="me-2" />
                    {error}
                </div>
            </Alert>
        </div>
    );

    if (!adminData) return (
        <div className="container py-4">
            <Alert variant="warning" className="shadow-sm">
                Aucune donnée disponible
            </Alert>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <Card className="border-0 shadow-sm rounded-lg overflow-hidden">
                        <Card.Header className="bg-primary text-white py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="h5 mb-0 d-flex align-items-center">
                                    <User className="me-2" size={20} />
                                    Mon Profil Administrateur
                                </h2>
                                <Badge bg="light" text="primary" className="fs-6">
                                    Administrateur
                                </Badge>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-4">
                                        <h5 className="text-primary mb-3 d-flex align-items-center">
                                            <User className="me-2" size={18} />
                                            Informations personnelles
                                        </h5>
                                        <div className="ps-4">
                                            <div className="mb-3">
                                                <div className="text-muted small">Nom</div>
                                                <div className="fw-bold fs-5">{adminData.nom}</div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="text-muted small">Prénom</div>
                                                <div className="fw-bold fs-5">{adminData.prenom}</div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="text-muted small">Email</div>
                                                <div className="fw-bold fs-5 d-flex align-items-center">
                                                    <Mail className="me-2" size={16} />
                                                    {adminData.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-4">
                                        <h5 className="text-primary mb-3 d-flex align-items-center">
                                            <Phone className="me-2" size={18} />
                                            Contact
                                        </h5>
                                        <div className="ps-4">
                                            <div className="mb-3">
                                                <div className="text-muted small">Téléphone</div>
                                                <div className="fw-bold fs-5 d-flex align-items-center">
                                                    <Phone className="me-2" size={16} />
                                                    {adminData.tel}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="text-muted small">Dernière modification</div>
                                                <div className="fw-bold fs-5 d-flex align-items-center">
                                                    <Calendar className="me-2" size={16} />
                                                    {format(new Date(adminData.date_login), 'dd/MM/yyyy HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-4">
                                <Button
                                    variant="primary"
                                    onClick={() => setShowModal(true)}
                                    className="d-flex align-items-center gap-2 px-4 py-2"
                                >
                                    <Edit size={18} />
                                    Modifier le profil
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="d-flex align-items-center">
                        <Edit className="me-2" size={20} />
                        Modifier le profil
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        {error && (
                            <Alert variant="danger" className="d-flex align-items-center">
                                <X className="me-2" size={18} />
                                {error}
                            </Alert>
                        )}

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-flex align-items-center">
                                        <User className="me-2" size={16} />
                                        Nom
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nom"
                                        value={formData.nom || ''}
                                        onChange={handleInputChange}
                                        isInvalid={!!fieldErrors.nom}
                                        className="py-2"
                                    />
                                    {fieldErrors.nom && (
                                        <Form.Text className="text-danger small">{fieldErrors.nom}</Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-flex align-items-center">
                                        <User className="me-2" size={16} />
                                        Prénom
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom || ''}
                                        onChange={handleInputChange}
                                        isInvalid={!!fieldErrors.prenom}
                                        className="py-2"
                                    />
                                    {fieldErrors.prenom && (
                                        <Form.Text className="text-danger small">{fieldErrors.prenom}</Form.Text>
                                    )}
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-flex align-items-center">
                                        <Mail className="me-2" size={16} />
                                        Email
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        isInvalid={!!fieldErrors.email}
                                        className="py-2"
                                    />
                                    {fieldErrors.email && (
                                        <Form.Text className="text-danger small">{fieldErrors.email}</Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-flex align-items-center">
                                        <Phone className="me-2" size={16} />
                                        Téléphone
                                    </Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="tel"
                                        minLength={8}
                                        maxLength={8}
                                        value={formData.tel || ''}
                                        onChange={handleInputChange}
                                        isInvalid={!!fieldErrors.tel}
                                        className="py-2"
                                    />
                                    {fieldErrors.tel && (
                                        <Form.Text className="text-danger small">{fieldErrors.tel}</Form.Text>
                                    )}
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-flex align-items-center">
                                        <Lock className="me-2" size={16} />
                                        Mot de passe actuel
                                        <span className="text-danger ms-1">*</span>
                                    </Form.Label>
                                    <div className="input-group">
                                        <Form.Control
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            onChange={handleInputChange}
                                            isInvalid={!!fieldErrors.currentPassword}
                                            className="py-2"
                                            placeholder="Entrez votre mot de passe actuel"
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="d-flex align-items-center"
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </div>
                                    {fieldErrors.currentPassword && (
                                        <Form.Text className="text-danger small">{fieldErrors.currentPassword}</Form.Text>
                                    )}
                                    <Form.Text className="text-muted small">
                                        Requis pour toute modification
                                    </Form.Text>
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-flex align-items-center">
                                        <Lock className="me-2" size={16} />
                                        Nouveau mot de passe
                                    </Form.Label>
                                    <div className="input-group">
                                        <Form.Control
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            onChange={handleInputChange}
                                            isInvalid={!!fieldErrors.newPassword}
                                            className="py-2"
                                            placeholder="Laissez vide pour ne pas changer"
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="d-flex align-items-center"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </div>
                                    {fieldErrors.newPassword && (
                                        <Form.Text className="text-danger small">{fieldErrors.newPassword}</Form.Text>
                                    )}
                                    <Form.Text className="text-muted small">
                                        Minimum 5 caractères
                                    </Form.Text>
                                </Form.Group>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowModal(false)}
                            disabled={editLoading}
                            className="px-4 py-2"
                        >
                            <X size={18} className="me-2" />
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={editLoading}
                            className="px-4 py-2 d-flex align-items-center gap-2"
                        >
                            {editLoading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <Save size={18} />
                            )}
                            Enregistrer les modifications
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProfile;
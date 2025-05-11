import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import { Edit, Save, X, Eye, EyeOff, User, Mail, Phone, Lock, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';
import OperateurForm from '../../components/OperateurForm';

const OperateurProfile = () => {
    const [operateurData, setOperateurData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        const fetchOperateurProfile = async () => {
            try {
                const response = await api.get('/operateurs/profile/me');
                setOperateurData(response.data);
                setFieldErrors({});
            } catch (err) {
                setError('Erreur lors du chargement du profil');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOperateurProfile();
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validatePasswordForm = () => {
        const errors = {};
        if (!passwordData.currentPassword) errors.currentPassword = "Le mot de passe actuel est requis";
        if (!passwordData.newPassword) errors.newPassword = "Le nouveau mot de passe est requis";
        if (passwordData.newPassword && passwordData.newPassword.length < 6) {
            errors.newPassword = "Le mot de passe doit contenir au moins 6 caractères";
        }
        if (!passwordData.confirmPassword) errors.confirmPassword = "La confirmation du mot de passe est requise";
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "Les mots de passe ne correspondent pas";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = async (formData) => {
        setEditLoading(true);
        try {
            console.log(formData);
            const response = await api.put('/operateurs/profile/me/a', formData);
            setOperateurData(response.data);
            // Mettre à jour les informations dans localStorage
            const operateurInfo = JSON.parse(localStorage.getItem('operateurInfo')) || {};
            localStorage.setItem('operateurInfo', JSON.stringify({
                ...operateurInfo,
                name: formData.name || `${formData.prenom} ${formData.nom}`.trim(),
                email: formData.email,
                telephone: formData.telephone
            }));

            setShowModal(false);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la mise à jour du profil");
        } finally {
            setEditLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        setLoading(true);
        try {
            await api.put('/operateurs/change-password/me', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setError(null);
        } catch (err) {
            if (err.response?.status === 401) {
                setFieldErrors({
                    ...fieldErrors,
                    currentPassword: "Mot de passe actuel incorrect"
                });
            } else {
                setError(err.response?.data?.message || "Erreur lors du changement de mot de passe");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !operateurData) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Chargement...</span>
            </Spinner>
        </div>
    );

    if (error && !operateurData) return (
        <div className="container py-4">
            <Alert variant="danger" className="shadow-sm">
                <div className="d-flex align-items-center">
                    <X className="me-2" />
                    {error}
                </div>
            </Alert>
        </div>
    );

    if (!operateurData) return (
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
                                    Mon Profil Opérateur
                                </h2>
                                <Badge bg="light" text="primary" className="fs-6">
                                    Opérateur
                                </Badge>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && (
                                <Alert variant="danger" className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <X className="me-2" />
                                        {error}
                                    </div>
                                </Alert>
                            )}

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-4">
                                        <h5 className="text-primary mb-3 d-flex align-items-center">
                                            <User className="me-2" size={18} />
                                            Informations personnelles
                                        </h5>
                                        <div className="ps-4">
                                            <div className="mb-3">
                                                <div className="text-muted small">Name</div>
                                                <div className="fw-bold fs-5">{operateurData.name}</div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="text-muted small">Email</div>
                                                <div className="fw-bold fs-5 d-flex align-items-center">
                                                    <Mail className="me-2" size={16} />
                                                    {operateurData.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-4">
                                        <h5 className="text-primary mb-3 d-flex align-items-center">
                                            <Phone className="me-2" size={18} />
                                            Contact et localisation
                                        </h5>
                                        <div className="ps-4">
                                            <div className="mb-3">
                                                <div className="text-muted small">Téléphone</div>
                                                <div className="fw-bold fs-5 d-flex align-items-center">
                                                    <Phone className="me-2" size={16} />
                                                    {operateurData.telephone}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="text-muted small">Code postal</div>
                                                <div className="fw-bold fs-5 d-flex align-items-center">
                                                    <MapPin className="me-2" size={16} />
                                                    {operateurData.code_postal || 'Non renseigné'}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="text-muted small">Dernière connexion</div>
                                                <div className="fw-bold fs-5 d-flex align-items-center">
                                                    <Calendar className="me-2" size={16} />
                                                    {operateurData.date_login ?
                                                        format(new Date(operateurData.date_login), 'dd/MM/yyyy HH:mm') :
                                                        'Jamais connecté'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-4 gap-3">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setShowPasswordModal(true)}
                                    className="d-flex align-items-center gap-2 px-4 py-2"
                                >
                                    <Lock size={18} />
                                    Changer le mot de passe
                                </Button>
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

            {/* Modal de modification du profil avec OperateurForm */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="d-flex align-items-center">
                        <Edit className="me-2" size={20} />
                        Modifier le profil
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <OperateurForm
                        initialData={{
                            id: operateurData.id,
                            name: operateurData.name || `${operateurData.prenom} ${operateurData.nom}`.trim(),
                            email: operateurData.email,
                            telephone: operateurData.telephone
                        }}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowModal(false)}
                        loading={editLoading}
                        error={error}
                        isModal={true}
                    />
                </Modal.Body>
            </Modal>

            {/* Modal de changement de mot de passe */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="d-flex align-items-center">
                        <Lock className="me-2" size={20} />
                        Changer le mot de passe
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePasswordSubmit}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label>Mot de passe actuel</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    isInvalid={!!fieldErrors.currentPassword}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </Button>
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.currentPassword}
                                </Form.Control.Feedback>
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nouveau mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                isInvalid={!!fieldErrors.newPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {fieldErrors.newPassword}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                isInvalid={!!fieldErrors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {fieldErrors.confirmPassword}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowPasswordModal(false)}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className="d-flex align-items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" animation="border" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default OperateurProfile;


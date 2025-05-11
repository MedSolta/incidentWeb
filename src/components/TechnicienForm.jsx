import React from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Save, ArrowLeft, Upload, User } from 'lucide-react';

const TechnicienForm = ({
    initialData = {
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        code_postal: '',
        disponibilite: false,
        acceptation: false,
        file: null
    },
    onSubmit,
    onCancel,
    loading = false,
    error = null,
    onError = () => { } // Ajout de la prop onError
}) => {
    const [formData, setFormData] = React.useState(initialData);
    const [preview, setPreview] = React.useState(null);
    const [fileError, setFileError] = React.useState(null);
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Initialisation une seule fois
    React.useEffect(() => {
        if (!isInitialized) {
            if (initialData.file) {
                if (typeof initialData.file === 'string') {
                    setPreview(
                        initialData.file.startsWith('http')
                            ? initialData.file
                            : `${process.env.REACT_APP_API_URL}${initialData.file}`
                    );
                } else if (initialData.file instanceof File) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result);
                    reader.readAsDataURL(initialData.file);
                }
            }
            setIsInitialized(true);
        }
    }, [initialData, isInitialized]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileError(null);

        if (file.size > 2 * 1024 * 1024) {
            setFileError('La taille du fichier ne doit pas dépasser 2MB');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            setFileError('Seuls les formats JPG, JPEG et PNG sont acceptés');
            return;
        }

        setFormData(prev => ({ ...prev, file }));

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFileError(null);

        // Validation côté client avant soumission
        const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'code_postal'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            onError(`Veuillez remplir les champs obligatoires : ${missingFields.join(', ')}`);
            return;
        }

        const formDataToSend = new FormData();

        // Ajout des champs avec conversion des booléens
        Object.keys(formData).forEach(key => {
            if (key !== 'file') {
                const value = typeof formData[key] === 'boolean'
                    ? formData[key].toString()
                    : formData[key];
                formDataToSend.append(key, value);
            }
        });

        // Gestion du fichier
        if (formData.file instanceof File) {
            formDataToSend.append('file', formData.file);
        } else if (typeof formData.file === 'string' && formData.file.startsWith('http')) {
            formDataToSend.append('fileUrl', formData.file);
        }

        onSubmit(formDataToSend);
    };

    const formatPhone = (value) => {
        if (!value) return '';
        return value.replace(/\D/g, '').slice(0, 8);
    };

    const renderAvatar = () => {
        if (preview) {
            return (
                <img
                    src={preview}
                    alt="Preview"
                    className="rounded-circle shadow-sm"
                    style={avatarStyle}
                    onError={handleImageError}
                />
            );
        }

        return (
            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm"
                style={{ ...avatarStyle, border: '3px dashed #dee2e6' }}>
                <User size={32} className="text-muted" />
            </div>
        );
    };

    const avatarStyle = {
        width: '120px',
        height: '120px',
        objectFit: 'cover',
        border: '3px solid #e9ecef'
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${formData.nom}+${formData.prenom}&background=random`;
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <Card className="border-0 shadow-lg">
                        <Card.Body className="p-5">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 className="fw-bold text-primary">
                                        {initialData.id ? 'Modifier Technicien' : 'Nouveau Technicien'}
                                    </h2>
                                    <p className="text-muted">
                                        {initialData.id ? 'Mettez à jour les informations du technicien' : 'Remplissez les informations du nouveau technicien'}
                                    </p>
                                </div>
                                <Button
                                    variant="outline-secondary"
                                    onClick={onCancel}
                                    className="d-flex align-items-center"
                                    disabled={loading}
                                >
                                    <ArrowLeft size={18} className="me-2" />
                                    Retour
                                </Button>
                            </div>

                            {(error || fileError) && (
                                <Alert variant="danger" className="rounded-lg">
                                    {error || fileError}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit} encType="multipart/form-data">
                                <Row className="mb-4">
                                    <Col md={3}>
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="position-relative mb-3">
                                                {renderAvatar()}
                                                <label
                                                    htmlFor="photo-upload"
                                                    className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 shadow cursor-pointer"
                                                    style={{ transform: 'translateY(25%)' }}
                                                >
                                                    <Upload size={16} color="white" />
                                                    <Form.Control
                                                        id="photo-upload"
                                                        type="file"
                                                        accept="image/jpeg, image/png, image/jpg"
                                                        onChange={handleFileChange}
                                                        className="d-none"
                                                        disabled={loading}
                                                    />
                                                </label>
                                            </div>
                                            <small className="text-muted text-center">
                                                Taille max: 2MB<br />
                                                Formats: JPG, PNG
                                            </small>
                                        </div>
                                    </Col>
                                    <Col md={9}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium">Nom</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="nom"
                                                        value={formData.nom}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="Nom du technicien"
                                                        disabled={loading}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium">Prénom</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="prenom"
                                                        value={formData.prenom}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="Prénom du technicien"
                                                        disabled={loading}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="email@exemple.com"
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Téléphone</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text">+216</span>
                                                <Form.Control
                                                    type="tel"
                                                    name="telephone"
                                                    value={formatPhone(formData.telephone)}
                                                    onChange={(e) => {
                                                        const formatted = formatPhone(e.target.value);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            telephone: formatted
                                                        }));
                                                    }}
                                                    required
                                                    placeholder="12345678"
                                                    disabled={loading}
                                                    maxLength={8}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Code Postal</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="code_postal"
                                                value={formData.code_postal}
                                                onChange={handleChange}
                                                required
                                                placeholder="Code postal"
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium d-block">Statut</Form.Label>
                                            <div className="d-flex gap-4 mt-2">
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="disponibilite"
                                                        name="disponibilite"
                                                        checked={formData.disponibilite}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    />
                                                    <label className="form-check-label fw-medium" htmlFor="disponibilite">
                                                        Disponible
                                                    </label>
                                                </div>
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="acceptation"
                                                        name="acceptation"
                                                        checked={formData.acceptation}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    />
                                                    <label className="form-check-label fw-medium" htmlFor="acceptation">
                                                        Accepté
                                                    </label>
                                                </div>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid mt-5">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                        size="lg"
                                        className="fw-bold py-2"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                En cours...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} className="me-2" />
                                                {initialData.id ? 'Mettre à jour' : 'Enregistrer'}
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

export default TechnicienForm;
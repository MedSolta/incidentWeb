import React from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Save, ArrowLeft } from 'lucide-react';

const OperateurForm = ({
    initialData = {
        name: '',
        email: '',
        telephone: ''
    },
    onSubmit,
    onCancel,
    loading = false,
    error = null,
    isModal = false // Nouveau paramètre pour indiquer si le formulaire est dans une modal
}) => {
    const [formData, setFormData] = React.useState(initialData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Assurez-vous que toutes les propriétés requises sont présentes
        const dataToSubmit = {
            ...formData,
            // Ajoutez des valeurs par défaut si nécessaire
            name: formData.name || '',
            email: formData.email || '',
            telephone: formData.telephone || ''
        };
        
        onSubmit(dataToSubmit);
    };

    // Si le formulaire est dans une modal, on ne rend pas la Card
    if (isModal) {
        return (
            <div className="p-4">
                {error && (
                    <Alert variant="danger" className="rounded-lg">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-medium">Nom complet</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Nom complet"
                            className="py-2 border-2"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-medium">Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="email@exemple.com"
                            className="py-2 border-2"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-medium">Téléphone</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text py-2">+216</span>
                            <Form.Control
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                required
                                minLength={8}
                                maxLength={8}
                                placeholder="61 234 578"
                                className="py-2 border-2"
                            />
                        </div>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button
                            variant="outline-secondary"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className="d-flex align-items-center"
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
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <Card className="border-0 shadow-lg">
                        <Card.Body className="p-5">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 className="fw-bold text-primary">
                                        {initialData.id ? 'Modifier Opérateur' : 'Nouvel Opérateur'}
                                    </h2>
                                    <p className="text-muted">
                                        {initialData.id ? 'Mettez à jour les informations' : 'Ajoutez un nouvel opérateur'}
                                    </p>
                                </div>
                                <Button
                                    variant="outline-secondary"
                                    onClick={onCancel}
                                    className="d-flex align-items-center"
                                >
                                    <ArrowLeft size={18} className="me-2" />
                                    Retour
                                </Button>
                            </div>

                            {error && (
                                <Alert variant="danger" className="rounded-lg">
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium">Nom complet</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nom complet"
                                        className="py-2 border-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="email@exemple.com"
                                        className="py-2 border-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium">Téléphone</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text py-2">+216</span>
                                        <Form.Control
                                            type="tel"
                                            name="telephone"
                                            value={formData.telephone}
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                            maxLength={8}
                                            placeholder="61 234 578"
                                            className="py-2 border-2"
                                        />
                                    </div>
                                </Form.Group>

                                <div className="d-grid mt-4">
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

export default OperateurForm;

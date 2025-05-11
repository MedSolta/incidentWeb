import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Input from '../../components/Input';
import Button from '../../components/Button';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('operateurToken');
        delete api.defaults.headers.common['Authorization'];
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', formData);
            const tokenKey = data.user.role === 'admin' ? 'adminToken' : 'operateurToken';
            localStorage.setItem(tokenKey, data.token);
            
            // Enregistrer les informations de l'utilisateur dans localStorage
            if (data.user.role === 'admin') {
                localStorage.setItem('adminInfo', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name || `${data.user.nom || ''} ${data.user.prenom || ''}`.trim(),
                    email: data.user.email,
                    role: data.user.role,
                    telephone: data.user.telephone || data.user.tel
                }));
            } else {
                localStorage.setItem('operateurInfo', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name || `${data.user.nom || ''} ${data.user.prenom || ''}`.trim(),
                    email: data.user.email,
                    role: data.user.role,
                    telephone: data.user.telephone || data.user.tel
                }));
            }
            
            navigate(`/${data.user.role}/dashboard`);
            console.log(data.user.role);

        } catch (err) {
            handleLoginError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginError = (err) => {
        const errorMap = {
            401: 'Email ou mot de passe incorrect',
            403: 'Votre compte n\'est pas encore vérifié',
            429: 'Trop de tentatives. Veuillez réessayer plus tard',
            500: 'Erreur serveur'
        };
        setError(errorMap[err.response?.status] || err.response?.data?.message || 'Erreur de connexion');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-vh-100 d-flex align-items-center" style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-primary">S'authentifier</h2>
                                    <p className="text-muted">Entrez vos identifiants pour accéder à votre espace</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show">
                                        {error}
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setError('')}
                                        />
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <Input
                                            label="Adresse Email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="exemple@domaine.com"
                                            icon="envelope"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <Input
                                            label="Mot de passe"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            icon="lock"
                                            required
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="rememberMe"
                                            />
                                            <label className="form-check-label small" htmlFor="rememberMe">
                                                Se souvenir de moi
                                            </label>
                                        </div>
                                        <Link
                                            to="/mot-de-passe-oublie"
                                            className="small text-decoration-none"
                                        >
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-100 py-2 mb-3"
                                        loading={loading}
                                        variant="primary"
                                    >
                                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                                    </Button>


                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

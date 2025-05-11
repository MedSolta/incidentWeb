import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { PlusCircle } from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import DataTable from '../../components/DataTable';
import DeleteModal from '../../components/DeleteModal';

const OperatorList = () => {
    const [operateurs, setOperateurs] = useState([]);
    const [filteredOperateurs, setFilteredOperateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedOperateur, setSelectedOperateur] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('actif'); // 'actif' ou 'archive'
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOperateurs = async () => {
            try {
                setLoading(true);
                const endpoint = filterStatus === 'actif' ? '/operateurs' : '/operateurs/operateur-archiver';
                const response = await api.get(endpoint);
                // S'assurer que response.data est toujours un tableau
                const data = Array.isArray(response.data) ? response.data : [];
                setOperateurs(data);
                setFilteredOperateurs(data);
            } catch (err) {
                console.error(err);
                // En cas d'erreur, définir des tableaux vides au lieu d'afficher une erreur
                setOperateurs([]);
                setFilteredOperateurs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOperateurs();
    }, [filterStatus]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setFilteredOperateurs(operateurs);
            return;
        }
        const term = searchTerm.toLowerCase();
        const filtered = operateurs.filter(op =>
            String(op.name || op.nom || '').toLowerCase().includes(term) ||
            String(op.prenom || '').toLowerCase().includes(term) ||
            String(op.email || '').toLowerCase().includes(term)
        );
        setFilteredOperateurs(filtered);
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        setFilteredOperateurs(operateurs);
    };

    const handleDelete = async (id) => {
        try {
            await api.put(`/operateurs/archiver/${id}`);
            setOperateurs(operateurs.filter(op => op.id !== id));
            setFilteredOperateurs(filteredOperateurs.filter(op => op.id !== id));
        } catch (err) {
            setError('Erreur lors de la suppression');
            console.error(err);
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleSendMessage = (operateur) => {
        setSelectedOperateur(operateur);
        setShowMessageModal(true);
    };

    const handleMessageSubmit = async () => {
        try {
            await api.post('/admins/send-message/operateur', {
                recipient_id: selectedOperateur.id,
                content: messageContent
            });
            setShowMessageModal(false);
            setMessageContent('');
            alert('Message envoyé avec succès!');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
            console.error(err);
        }
    };

    const columns = [
        { key: 'id', label: 'ID' },
        {
            key: 'nom_complet',
            label: 'Nom Complet',
            render: (item) => (
                <div className="d-flex align-items-center gap-2">
                    <span>{item.prenom} {item.name || item.nom}</span>
                    <button
                        className="btn btn-sm btn-outline-primary py-0 px-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSendMessage(item);
                        }}
                        title="Envoyer un message"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            style={{ marginBottom: '2px' }}
                        >
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.5.5 0 0 1-.928.086L7.5 12.5l-4.795 3.98a.5.5 0 0 1-.728-.033L.146 10.54a.5.5 0 0 1 .11-.54l15-15a.5.5 0 0 1 .54-.11z" />
                        </svg>
                        <span className="ms-1">Message</span>
                    </button>
                </div>
            )
        },
        { key: 'email', label: 'Email' },
        { key: 'telephone', label: 'Téléphone' },
        {
            key: 'status',
            label: 'Statut',
            render: (item) => (
                <span className={`badge ${item.disabled ? 'bg-danger' : 'bg-success'}`}>
                    {item.disabled ? 'Désactivé' : 'Actif'}
                </span>
            )
        }
    ];

    if (loading) return <div className="text-center my-5">Chargement...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid py-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">Liste des Opérateurs</h2>
                        <Link to="/admin/operator-add" className="btn btn-primary">
                            <PlusCircle size={18} className="me-2" />
                            Ajouter Opérateur
                        </Link>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <SearchBar
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                onSearch={handleSearch}
                                onReset={handleResetSearch}
                                placeholder="Rechercher par nom, prénom ou email..."
                            />
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex justify-content-end">
                                <div className="btn-group" role="group">
                                    <button 
                                        type="button" 
                                        className={`btn ${filterStatus === 'actif' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setFilterStatus('actif')}
                                    >
                                        Actifs
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn ${filterStatus === 'archive' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setFilterStatus('archive')}
                                    >
                                        Archivés
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DataTable
                        data={filteredOperateurs}
                        columns={columns}
                        onView={(id) => navigate(`/admin/operator-detail/${id}`)}
                        onEdit={(id) => navigate(`/admin/operator-edit/${id}`)}
                        onDelete={(item) => {
                            setSelectedOperateur(item);
                            setShowDeleteModal(true);
                        }}
                        emptyMessage="Aucun opérateur trouvé"
                    />

                    <DeleteModal
                        show={showDeleteModal}
                        onHide={() => setShowDeleteModal(false)}
                        onConfirm={() => handleDelete(selectedOperateur?.id)}
                        itemName={`l'opérateur ${selectedOperateur?.name || selectedOperateur?.nom}`}
                    />

                    {/* Modal d'envoi de message */}
                    {showMessageModal && (
                        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            Envoyer un message à {selectedOperateur?.prenom} {selectedOperateur?.name || selectedOperateur?.nom}
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => {
                                                setShowMessageModal(false);
                                                setMessageContent('');
                                            }}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={messageContent}
                                            onChange={(e) => setMessageContent(e.target.value)}
                                            placeholder="Écrivez votre message ici..."
                                        ></textarea>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowMessageModal(false);
                                                setMessageContent('');
                                            }}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleMessageSubmit}
                                            disabled={!messageContent.trim()}
                                        >
                                            Envoyer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default OperatorList;

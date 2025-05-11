import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Spinner, Alert, Form } from 'react-bootstrap';
import { Search, ChevronDown } from 'lucide-react';
import MessageHeader from '../../components/messages/MessageHeader';
import MessageListOp from '../../components/messages/MessageListOp';
import MessageInput from '../../components/messages/MessageInput';
import NoDiscussionSelected from '../../components/messages/NoDiscussionSelected';

const MessagesPage = () => {
    const navigate = useNavigate();
    const [discussions, setDiscussions] = useState([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState({ discussions: false, messages: false });
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Fonction pour faire défiler vers le bas
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Sélection d'une discussion
    const selectDiscussion = useCallback(async (discussionId) => {
        try {
            setLoading(prev => ({ ...prev, messages: true }));
            const [discussionRes, messagesRes] = await Promise.all([
                api.get(`operateurs/op/discussions/${discussionId}`),
                api.get(`operateurs/op/discussions/${discussionId}/messages`)
            ]);

            // S'assurer que counterpart a un displayName
            const counterpart = discussionRes.data.data.counterpart;
            const displayName = `${counterpart.prenom || ''} ${counterpart.nom || ''}`.trim() ||
                `${counterpart.name || ''}`.trim() ||
                'Utilisateur';

            setSelectedDiscussion({
                ...discussionRes.data.data,
                counterpart: {
                    ...counterpart,
                    displayName
                }
            });
            setMessages(messagesRes.data.data.messages);
        } catch (err) {
            setError('Erreur lors du chargement de la discussion');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, messages: false }));
        }
    }, []);

    // Chargement des discussions
    const fetchDiscussions = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, discussions: true }));
            const response = await api.get('operateurs/op/discussions');

            if (!response.data || !response.data.data) {
                throw new Error('Format de réponse inattendu');
            }

            // S'assurer que chaque discussion a un displayName pour son interlocuteur
            const formattedDiscussions = response.data.data.map(d => ({
                ...d,
                counterpart: {
                    ...d.counterpart,
                    displayName: `${d.counterpart.prenom || ''} ${d.counterpart.nom || ''}`.trim() ||
                        `${d.counterpart.name || ''}`.trim() ||
                        'Utilisateur'
                }
            }));

            setDiscussions(formattedDiscussions);

            if (formattedDiscussions.length > 0 && !selectedDiscussion) {
                selectDiscussion(formattedDiscussions[0].id);
            }
        } catch (err) {
            setError('Erreur lors du chargement des discussions');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, discussions: false }));
        }
    }, [selectDiscussion, selectedDiscussion]);

    // Envoi de message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedDiscussion) return;

        const tempId = Date.now();
        const tempMessage = {
            id: tempId,
            content: newMessage,
            created_at: new Date().toISOString(),
            sender_type: 'operateur',
            sender: {
                role: 'operateur',
                name: "Vous",
                prenom: ""
            }
        };

        try {
            // Mise à jour optimiste
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');

            const response = await api.post('operateurs/op/send-message', {
                content: newMessage,
                recipient_id: selectedDiscussion.counterpart.id
            });

            // Remplacement du message temporaire
            setMessages(prev => [
                ...prev.filter(m => m.id !== tempId),
                {
                    ...response.data.data.message,
                    sender: {
                        role: 'operateur',
                        name: "Vous",
                        prenom: ""
                    }
                }
            ]);

            // Mise à jour de la liste des discussions
            setDiscussions(prev => prev.map(d =>
                d.id === selectedDiscussion.id ? {
                    ...d,
                    last_message_at: new Date().toISOString(),
                    last_message: response.data.data.message
                } : d
            ));
        } catch (err) {
            setError('Erreur lors de l\'envoi du message');
            setMessages(prev => prev.filter(m => m.id !== tempId));
            console.error(err);
        }
    };

    // Chargement initial
    useEffect(() => {
        fetchDiscussions();
    }, [fetchDiscussions]);

    // Scroll automatique
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Filtrage des discussions
    const filteredDiscussions = discussions.filter(d => {
        const searchLower = searchTerm.toLowerCase();
        return (
            d.counterpart.nom?.toLowerCase().includes(searchLower) ||
            d.counterpart.prenom?.toLowerCase().includes(searchLower) ||
            d.counterpart.displayName.toLowerCase().includes(searchLower)
        );
    });

    // Groupement des messages par date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.created_at).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    // Formatage de la date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === now.toDateString()) {
            return "Aujourd'hui";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hier";
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    };

    return (
        <div className="container-fluid h-100">
            <div className="row h-100 g-0">
                {/* Liste des discussions */}
                <div className="col-md-4 d-flex flex-column border-end bg-white" style={{ height: '100vh' }}>
                    <div className="p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 fw-bold">Messages</h5>
                            <button variant="light" size="sm" className="rounded-circle btn btn-light">
                                <ChevronDown size={18} />
                            </button>
                        </div>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light border-end-0">
                                <Search size={16} className="text-muted" />
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="Rechercher une conversation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-start-0"
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert variant="danger" className="m-2">
                            {error}
                        </Alert>
                    )}

                    {loading.discussions ? (
                        <div className="d-flex justify-content-center my-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <div className="overflow-auto flex-grow-1">
                            {filteredDiscussions.length === 0 ? (
                                <div className="text-center text-muted p-4">
                                    Aucune conversation trouvée
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {filteredDiscussions.map(discussion => (
                                        <div
                                            key={discussion.id}
                                            className={`list-group-item list-group-item-action d-flex align-items-center p-3 ${selectedDiscussion?.id === discussion.id ? 'active bg-light' : ''}`}
                                            onClick={() => selectDiscussion(discussion.id)}
                                        >
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${discussion.counterpart.prenom}+${discussion.counterpart.nom}&background=random`}
                                                alt={discussion.counterpart.displayName}
                                                className="rounded-circle me-3"
                                                width={48}
                                                height={48}
                                            />
                                            <div className="flex-grow-1 min-width-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 text-truncate text-dark">
                                                        {discussion.counterpart.displayName || `${discussion.counterpart.prenom || ''} ${discussion.counterpart.nom || ''}`.trim()}
                                                    </h6>
                                                    <small className="text-muted ms-2">
                                                        {new Date(discussion.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                                <p className="mb-0 text-truncate text-muted small">
                                                    {discussion.last_message?.content || 'Aucun message'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Zone de chat */}
                <div className="col-md-8 d-flex flex-column bg-light" style={{ height: '100vh' }}>
                    {selectedDiscussion ? (
                        <>
                            <MessageHeader discussion={selectedDiscussion} />
                            {loading.messages ? (
                                <div className="d-flex justify-content-center my-4">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <MessageListOp
                                    messages={messages}
                                    groupedMessages={groupedMessages}
                                    formatDate={formatDate}
                                    messagesEndRef={messagesEndRef}
                                />
                            )}
                            <MessageInput
                                newMessage={newMessage}
                                setNewMessage={setNewMessage}
                                handleSendMessage={handleSendMessage}
                                disabled={loading.messages}
                            />
                        </>
                    ) : (
                        <NoDiscussionSelected />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;




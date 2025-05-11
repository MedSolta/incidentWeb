import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Spinner, Alert, ListGroup, Badge, Image, Form } from 'react-bootstrap';
import { Search, ChevronDown } from 'lucide-react';
import MessageHeader from '../../components/messages/MessageHeader';
import MessageList from '../../components/messages/MessageList';
import MessageInput from '../../components/messages/MessageInput';
import NoDiscussionSelected from '../../components/messages/NoDiscussionSelected';

const MessagesPageOp = () => {
    const [discussions, setDiscussions] = useState([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState({
        discussions: true,
        messages: false
    });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Fonctions utilitaires
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Aujourd'hui";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Hier';
        } else {
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
        }
    };

    const groupMessagesByDate = (messages) => {
        const grouped = {};
        messages.forEach(message => {
            const date = new Date(message.created_at).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(message);
        });
        return grouped;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getCounterpartInfo = (counterpart) => {
        return {
            displayName: `${counterpart.prenom || ''} ${counterpart.name || counterpart.nom || ''}`.trim(),
            avatarUrl: counterpart.file || `https://ui-avatars.com/api/?name=${encodeURIComponent(counterpart.name || counterpart.nom || 'U')}&background=random`
        };
    };

    // Chargement des discussions
    const fetchDiscussions = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, discussions: true }));
            const response = await api.get('admins/discussions-operateur');

            if (!response.data || !response.data.data) {
                throw new Error('Format de réponse inattendu');
            }

            const formattedDiscussions = response.data.data.map(d => ({
                ...d,
                counterpart: {
                    ...d.counterpart,
                    displayName: `${d.counterpart.prenom || ''} ${d.counterpart.name || d.counterpart.nom || ''}`.trim()
                }
            }));

            setDiscussions(formattedDiscussions);

            if (formattedDiscussions.length > 0 && !selectedDiscussion) {
                selectDiscussion(formattedDiscussions[0].id);
            }
        } catch (err) {
            console.error('Erreur détaillée:', {
                message: err.message,
                response: err.response,
                stack: err.stack
            });
            setError(`Erreur lors du chargement des discussions: ${err.message}`);
        } finally {
            setLoading(prev => ({ ...prev, discussions: false }));
        }
    }, [selectedDiscussion]);

    // Sélection d'une discussion
    const selectDiscussion = useCallback(async (discussionId) => {
        if (selectedDiscussion?.id === discussionId) return;

        try {
            setLoading(prev => ({ ...prev, messages: true }));
            const [discussionRes, messagesRes] = await Promise.all([
                api.get(`admins/discussions/${discussionId}/operateur`),
                api.get(`admins/discussions/${discussionId}/messages/operateur`)
            ]);

            setSelectedDiscussion({
                ...discussionRes.data.data,
                counterpart: {
                    ...discussionRes.data.data.counterpart,
                    displayName: `${discussionRes.data.data.counterpart.prenom || ''} ${discussionRes.data.data.counterpart.name || discussionRes.data.data.counterpart.nom || ''}`.trim()
                }
            });
            setMessages(messagesRes.data.data.messages);
        } catch (err) {
            setError('Erreur lors du chargement de la discussion');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, messages: false }));
        }
    }, [selectedDiscussion]);

    // Envoi de message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedDiscussion) return;

        const tempId = Date.now();
        const tempMessage = {
            id: tempId,
            content: newMessage,
            created_at: new Date().toISOString(),
            sender_type: 'admin',
            sender: {
                role: 'admin',
                prenom: "Vous",
                name: "",
                nom: ""
            }
        };

        try {
            // Mise à jour optimiste
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');

            const response = await api.post('admins/send-message/operateur', {
                content: newMessage,
                recipient_id: selectedDiscussion.counterpart.id,
                discussion_id: selectedDiscussion.id
            });

            // Remplacement du message temporaire
            setMessages(prev => [
                ...prev.filter(m => m.id !== tempId),
                {
                    ...response.data.data.message,
                    sender: {
                        role: 'admin',
                        prenom: "Vous",
                        name: "",
                        nom: ""
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
            d.counterpart.name?.toLowerCase().includes(searchLower) ||
            d.counterpart.nom?.toLowerCase().includes(searchLower) ||
            d.counterpart.prenom?.toLowerCase().includes(searchLower) ||
            d.counterpart.displayName.toLowerCase().includes(searchLower)
        );
    });

    if (loading.discussions && !discussions.length) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4">
                <Alert variant="danger" className="d-flex align-items-center">
                    <span className="me-2">✕</span>
                    <div>{error}</div>
                </Alert>
            </div>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="container-fluid h-100">
            <div className="row h-100 g-0">
                {/* DiscussionList intégré directement */}
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

                    <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                        {filteredDiscussions.map(discussion => {
                            const { displayName, avatarUrl } = getCounterpartInfo(discussion.counterpart);

                            return (
                                <ListGroup.Item
                                    key={discussion.id}
                                    action
                                    active={selectedDiscussion?.id === discussion.id}
                                    onClick={() => selectDiscussion(discussion.id)}
                                    className="border-0 py-3 px-3"
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="position-relative me-3">
                                            <Image
                                                src={avatarUrl}
                                                roundedCircle
                                                width={48}
                                                height={48}
                                                className="border border-2 border-white"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://ui-avatars.com/api/?name=U&background=random';
                                                }}
                                            />
                                            {discussion.unread_count > 0 && (
                                                <Badge pill bg="danger" className="position-absolute top-0 end-0">
                                                    {discussion.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0 fw-semibold">{displayName}</h6>
                                                <small className="text-muted">
                                                    {new Date(discussion.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                            <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                                                {discussion.messages?.[discussion.messages.length - 1]?.content || 'Aucun message'}
                                            </p>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                </div>

                <div className="col-md-8 d-flex flex-column bg-light" style={{ height: '100vh' }}>
                    {selectedDiscussion ? (
                        <>
                            <MessageHeader discussion={selectedDiscussion} />
                            {loading.messages ? (
                                <div className="d-flex justify-content-center my-4">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <MessageList
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

export default MessagesPageOp;
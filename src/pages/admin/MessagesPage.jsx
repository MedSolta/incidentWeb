import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Spinner, Alert } from 'react-bootstrap';
import DiscussionList from '../../components/messages/DiscussionList';
import MessageHeader from '../../components/messages/MessageHeader';
import MessageList from '../../components/messages/MessageList';
import MessageInput from '../../components/messages/MessageInput';
import NoDiscussionSelected from '../../components/messages/NoDiscussionSelected';

const MessagesPage = () => {
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

    // Chargement des discussions
    const fetchDiscussions = useCallback(async () => {
        try {
            const response = await api.get('admins/discussions');
            const fetchedDiscussions = response.data.data;
            setDiscussions(fetchedDiscussions);

            if (fetchedDiscussions.length > 0 && !selectedDiscussion) {
                selectDiscussion(fetchedDiscussions[0].id);
            }
        } catch (err) {
            setError('Erreur lors du chargement des discussions');
            console.error(err);
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
                api.get(`admins/discussions/${discussionId}`),
                api.get(`admins/discussions/${discussionId}/messages`)
            ]);

            setSelectedDiscussion(discussionRes.data.data);
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
                nom: ""
            }
        };

        try {
            // Mise à jour optimiste
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');

            const response = await api.post('admins/send-message', {
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
                        nom: ""
                    }
                }
            ]);

            // Mise à jour de la liste des discussions
            setDiscussions(prev => prev.map(d =>
                d.id === selectedDiscussion.id ? {
                    ...d,
                    last_message_at: new Date().toISOString(),
                    messages: [response.data.data.message, ...(d.messages || [])]
                } : d
            ));

        } catch (err) {
            setError('Erreur lors de l\'envoi du message');
            setMessages(prev => prev.filter(m => m.id !== tempId));
            console.error(err);
        }
    };

    // Polling pour les nouveaux messages
    useEffect(() => {
        const interval = setInterval(() => {
            if (selectedDiscussion) {
                api.get(`admins/discussions/${selectedDiscussion.id}/messages`)
                    .then(res => {
                        setMessages(res.data.data.messages);
                    })
                    .catch(console.error);
            }
        }, 5000); // Toutes les 5 secondes

        return () => clearInterval(interval);
    }, [selectedDiscussion]);

    // Chargement initial
    useEffect(() => {
        fetchDiscussions();
    }, [fetchDiscussions]);

    // Scroll automatique
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Filtrage des discussions
    const filteredDiscussions = discussions.filter(d =>
        d.counterpart.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.counterpart.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <DiscussionList
                    discussions={filteredDiscussions}
                    selectedDiscussion={selectedDiscussion}
                    onSelectDiscussion={selectDiscussion}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    loading={loading.discussions}
                />

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

export default MessagesPage;
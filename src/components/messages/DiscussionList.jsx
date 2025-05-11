import React from 'react';
import { ListGroup, Badge, Image, Form } from 'react-bootstrap';
import { Search, ChevronDown } from 'lucide-react';

const DiscussionList = ({ discussions, selectedDiscussion, onSelectDiscussion, searchTerm, setSearchTerm }) => {
    // Fonction pour générer le nom complet selon le modèle
    const getDisplayName = (counterpart) => {
        // Si c'est un opérateur (avec 'name' au lieu de 'nom')
        if (counterpart.name) {
            return `${counterpart.prenom || ''} ${counterpart.name || ''}`.trim();
        }
        // Si c'est un technicien (avec 'nom')
        return `${counterpart.prenom || ''} ${counterpart.nom || ''}`.trim();
    };

    // Fonction pour générer l'URL de l'avatar
    const getAvatarUrl = (counterpart) => {
        if (counterpart.file) {
            return counterpart.file;
        }
        // Pour les opérateurs (name) ou techniciens (nom)
        const namePart = counterpart.name || counterpart.nom || '';
        const firstNamePart = counterpart.prenom || '';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(namePart)}+${encodeURIComponent(firstNamePart)}&background=random`;
    };

    return (
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
                {discussions.map(discussion => {
                    const displayName = getDisplayName(discussion.counterpart);
                    const avatarUrl = getAvatarUrl(discussion.counterpart);

                    return (
                        <ListGroup.Item
                            key={discussion.id}
                            action
                            active={selectedDiscussion?.id === discussion.id}
                            onClick={() => onSelectDiscussion(discussion.id)}
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
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(discussion.counterpart.name || discussion.counterpart.nom || '')}&background=random`;
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
    );
};

export default DiscussionList;
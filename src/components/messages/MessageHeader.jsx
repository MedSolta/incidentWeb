import React from 'react';
import { Button, Image } from 'react-bootstrap';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MessageHeader.css';

const MessageHeader = ({ discussion }) => {
    const navigate = useNavigate();

    // Fonction pour naviguer vers le profil de l'interlocuteur
    const handleProfileClick = () => {
        if (discussion.counterpart.role === 'technicien') {
            navigate(`/admin/technicien-detail/${discussion.counterpart.id}`);
        } else if (discussion.counterpart.role === 'operateur') {
            navigate(`/admin/operator-detail/${discussion.counterpart.id}`);
        }
    };

    return (
        <div className="p-3 border-bottom bg-white d-flex align-items-center">
            <Button
                variant="light"
                className="me-2 d-md-none rounded-circle"
                onClick={() => navigate(-1)}
                size="sm"
            >
                <ArrowLeft size={18} />
            </Button>
            <div className="d-flex align-items-center flex-grow-1">
                <Image
                    src={discussion.counterpart.file || `https://ui-avatars.com/api/?name=${discussion.counterpart.nom}+${discussion.counterpart.prenom}&background=random`}
                    roundedCircle
                    width={40}
                    height={40}
                    className="me-3 border border-2 border-primary"
                />
                <div>
                    <div className="profile-name-container">
                        <h5 
                            className="mb-0 fw-semibold profile-name"
                            onClick={handleProfileClick}
                            title={`Voir le profil de ${discussion.counterpart.prenom} ${discussion.counterpart.nom}`}
                        >
                            {discussion.counterpart.prenom}<small></small> {discussion.counterpart.nom}
                            <User size={16} className="profile-icon ms-2" />
                        </h5>
                    </div>
                    <small className={`badge ${discussion.counterpart.role === 'technicien' ? 'bg-primary-light text-primary' : 'bg-secondary-light text-secondary'} rounded-pill`}>
                        {discussion.counterpart.role === 'technicien' ? 'Technicien' : 'Administrateur'}
                    </small>
                </div>
            </div>
        </div>
    );
};

export default MessageHeader;

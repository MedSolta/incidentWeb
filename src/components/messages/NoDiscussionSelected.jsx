import React from 'react';
import { Search } from 'lucide-react';

const NoDiscussionSelected = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white">
            <div className="text-center p-4">
                <div className="bg-light rounded-circle p-4 mb-3">
                    <Search size={32} className="text-muted" />
                </div>
                <h4 className="fw-semibold mb-2">Aucune discussion sélectionnée</h4>
                <p className="text-muted">Sélectionnez une conversation ou démarrez une nouvelle discussion</p>
            </div>
        </div>
    );
};

export default NoDiscussionSelected;
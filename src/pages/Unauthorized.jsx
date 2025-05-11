import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="container text-center mt-5">
            <h1>403 - Accès non autorisé</h1>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <Link to="/" className="btn btn-primary">
                Retour à l'accueil
            </Link>
        </div>
    );
};

export default Unauthorized;
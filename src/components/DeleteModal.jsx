import { Modal, Button } from 'react-bootstrap';

const DeleteModal = ({
    show,
    onHide,
    onConfirm,
    itemName,
    title = "Confirmer la suppression",
    confirmText = "Supprimer",
    cancelText = "Annuler"
}) => {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Êtes-vous sûr de vouloir supprimer {itemName} ?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    {cancelText}
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteModal;
import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { Paperclip, Smile, Send } from 'lucide-react';

const MessageInput = ({ newMessage, setNewMessage, handleSendMessage }) => {
    return (
        <div className="p-3 border-top bg-white">
            <Form onSubmit={handleSendMessage}>
                <div className="d-flex align-items-center gap-2">
                    <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Écrire un message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ resize: 'none', borderRadius: '20px' }}
                        className="flex-grow-1 border-0 bg-light py-2 px-3"
                    />
                    <Button
                        variant="primary"
                        type="submit"
                        className="rounded-circle p-2"
                        disabled={!newMessage.trim()}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default MessageInput;
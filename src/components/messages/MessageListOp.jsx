import React from 'react';
import { Badge, Image } from 'react-bootstrap';

const MessageListOp = ({ messages, groupedMessages, formatDate, messagesEndRef }) => {
    return (
        <div className="flex-grow-1 p-3 overflow-auto">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                    <div className="text-center my-3">
                        <Badge pill bg="light" className="text-muted fw-normal px-3 py-1">
                            {formatDate(date)}
                        </Badge>
                    </div>
                    {dateMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`d-flex mb-3 ${message.sender.role !== 'admin' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                            {message.sender.role === 'admin' && (
                                <Image
                                    src={
                                        message.sender.nom && message.sender.prenom
                                            ? `https://ui-avatars.com/api/?name=${message.sender.nom}+${message.sender.prenom}`
                                            : `https://ui-avatars.com/api/?name=${message.sender.name || 'U'}`
                                    }
                                    roundedCircle
                                    width={36}
                                    height={36}
                                    className="me-2 align-self-end"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://ui-avatars.com/api/?name=U&background=random';
                                    }}
                                />
                            )}

                            <div
                                className={`p-3 rounded-3 ${message.sender.role !== 'admin'
                                    ? 'bg-primary text-white'
                                    : 'bg-white border shadow-sm'}`}
                                style={{ maxWidth: '75%' }}
                            >
                                {message.sender.role === 'admin' && (
                                    <div className="fw-semibold small mb-1">
                                        {message.sender.prenom || ''} {message.sender.nom || message.sender.name || ''}
                                    </div>
                                )}
                                <p className="mb-1">{message.content}</p>
                                <div className={`text-end small ${message.sender.role !== 'admin' ? 'text-white-50' : 'text-muted'}`}>
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageListOp;

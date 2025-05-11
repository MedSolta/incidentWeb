import React from 'react';
import { Badge, Image } from 'react-bootstrap';

const MessageList = ({ messages, groupedMessages, formatDate, messagesEndRef }) => {
    return (
        <div className="flex-grow-1 p-4 overflow-auto" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}>
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
                            className={`d-flex mb-3 ${message.sender.role === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                            {message.sender.role !== 'admin' && (
                                <Image
                                    src={
                                        message.sender.nom && message.sender.prenom
                                            ? `https://ui-avatars.com/api/?name=${message.sender.nom}+${message.sender.prenom}`
                                            : `https://ui-avatars.com/api/?name=${message.sender.name}`
                                    }
                                    roundedCircle
                                    width={36}
                                    height={36}
                                    className="me-2 align-self-end"
                                />
                            )}

                            <div
                                className={`p-3 rounded-3 ${message.sender.role === 'admin'
                                    ? 'bg-primary text-white'
                                    : 'bg-white border shadow-sm'}`}
                                style={{ maxWidth: '75%' }}
                            >
                                {message.sender.role !== 'admin' && (
                                    <div className="fw-semibold small mb-1">
                                        {message.sender.prenom} {message.sender.nom}
                                    </div>
                                )}
                                <p className="mb-1">{message.content}</p>
                                <div className={`text-end small ${message.sender.role === 'admin' ? 'text-white-50' : 'text-muted'}`}>
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

export default MessageList;
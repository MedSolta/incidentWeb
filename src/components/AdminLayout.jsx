import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    LogOut,
    Menu,
    X,
    MessageSquare,
    User,
    ChevronDown,
    ChevronUp,
    Settings
} from 'lucide-react';
import api from '../utils/api';

// Couleurs modernes et améliorées
const PRIMARY_COLOR = '#4361ee';
const SECONDARY_COLOR = '#3f37c9';
const BACKGROUND_COLOR = '#f8f9fa';
const TEXT_COLOR = '#2b2d42';
const LIGHT_TEXT = '#ffffff';
const HOVER_COLOR = '#f0f2f5';
const BORDER_COLOR = '#e9ecef';
const SHADOW = '0 4px 12px rgba(0,0,0,0.05)';

const AdminLayout = ({
    children,
    sidebarOpen,
    setSidebarOpen,
    activeItem,
    setActiveItem
}) => {
    const navigate = useNavigate();
    const [messagesDropdownOpen, setMessagesDropdownOpen] = useState(false);
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo')) || { name: 'Admin' };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        delete api.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    const handleMessagesClick = (e) => {
        e.preventDefault();
        setMessagesDropdownOpen(!messagesDropdownOpen);
    };

    const handleMessageTypeSelect = (type) => {
        setActiveItem('messages');
        setMessagesDropdownOpen(false);
        navigate(`/admin/messages/${type}`);
    };

    const menuItems = [
        { name: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
        { name: 'operator-list', icon: <Users size={20} />, label: 'Opérateurs' },
        { name: 'technicien-list', icon: <FileText size={20} />, label: 'Techniciens' },
        { name: 'profile', icon: <User size={20} />, label: 'Profil' },
    ];

    const getActiveTitle = () => {
        switch (activeItem) {
            case 'dashboard': return 'Tableau de bord';
            case 'operator-list': return 'Opérateurs';
            case 'technicien-list': return 'Techniciens';
            case 'messages': return 'Messages';
            case 'profile': return 'Profil';
            default: return '';
        }
    };

    // Obtenir les initiales du nom de l'admin
    const getInitials = () => {
        if (!adminInfo.name) return 'A';
        return adminInfo.name.charAt(0).toUpperCase();
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: BACKGROUND_COLOR }}>
            {/* Sidebar */}
            <div
                style={{
                    width: sidebarOpen ? '280px' : '80px',
                    transition: 'all 0.3s ease',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: 'white',
                    borderRight: `1px solid ${BORDER_COLOR}`,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: SHADOW
                }}
            >
                {/* Header Sidebar */}
                <div
                    className="d-flex justify-content-between align-items-center p-3"
                    style={{
                        background: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})`,
                        minHeight: '80px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    {sidebarOpen ? (
                        <div className="d-flex align-items-center">
                            <span className="ms-2 text-white fw-bold" style={{ fontSize: '1.1rem' }}>Espace Admin</span>
                        </div>
                    ): null}
                    <button
                        className="btn btn-link text-white p-0"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ 
                            borderRadius: '50%', 
                            width: '36px', 
                            height: '36px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Profile Section */}
                <div className="p-3 d-flex align-items-center" style={{
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    flexShrink: 0,
                    backgroundColor: HOVER_COLOR
                }}>
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: '45px',
                            height: '45px',
                            background: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <span className="text-white fw-bold">{getInitials()}</span>
                    </div>
                    {sidebarOpen && (
                        <div className="ms-2">
                            <div className="fw-bold" style={{
                                color: TEXT_COLOR,
                                fontSize: '0.95rem'
                            }}>
                                {adminInfo.name || 'Admin'}
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                Administrateur
                            </small>
                        </div>
                    )}
                </div>

                {/* Main Menu */}
                <nav style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem 0',
                    scrollbarWidth: 'thin'
                }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={`/admin/${item.name}`}
                            className={`d-flex align-items-center px-3 py-3 mx-2 mb-1 rounded text-decoration-none ${activeItem === item.name ? 'text-white' : 'text-dark'}`}
                            style={{
                                backgroundColor: activeItem === item.name ? PRIMARY_COLOR : 'transparent',
                                transition: 'all 0.2s',
                                boxShadow: activeItem === item.name ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                ':hover': {
                                    backgroundColor: activeItem === item.name ? PRIMARY_COLOR : HOVER_COLOR
                                }
                            }}
                            onClick={() => setActiveItem(item.name)}
                        >
                            <span style={{
                                color: activeItem === item.name ? LIGHT_TEXT : PRIMARY_COLOR,
                                minWidth: '24px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                {item.icon}
                            </span>
                            {sidebarOpen && (
                                <span className="ms-3" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 500,
                                    opacity: activeItem === item.name ? 1 : 0.8
                                }}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    ))}

                    {/* Menu déroulant Messages */}
                    <div className="position-relative mx-2 mb-1">
                        <button
                            className={`d-flex align-items-center w-100 px-3 py-3 rounded text-decoration-none border-0 ${activeItem === 'messages' ? 'text-white' : 'text-dark'}`}
                            style={{
                                backgroundColor: activeItem === 'messages' ? PRIMARY_COLOR : 'transparent',
                                transition: 'all 0.2s',
                                boxShadow: activeItem === 'messages' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                ':hover': {
                                    backgroundColor: activeItem === 'messages' ? PRIMARY_COLOR : HOVER_COLOR
                                }
                            }}
                            onClick={handleMessagesClick}
                        >
                            <span style={{
                                color: activeItem === 'messages' ? LIGHT_TEXT : PRIMARY_COLOR,
                                minWidth: '24px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <MessageSquare size={20} />
                            </span>
                            {sidebarOpen && (
                                <>
                                    <span className="ms-3" style={{ 
                                        fontSize: '0.9rem', 
                                        fontWeight: 500,
                                        opacity: activeItem === 'messages' ? 1 : 0.8
                                    }}>
                                        Messages
                                    </span>
                                    <span className="ms-auto">
                                        {messagesDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </span>
                                </>
                            )}
                        </button>

                        {messagesDropdownOpen && sidebarOpen && (
                            <div className="w-100 mt-1" style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                overflow: 'hidden'
                            }}>
                                <button
                                    className="dropdown-item d-flex align-items-center px-4 py-2 w-100 border-0 bg-transparent"
                                    onClick={() => handleMessageTypeSelect('technicien')}
                                    style={{
                                        color: TEXT_COLOR,
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: HOVER_COLOR
                                        }
                                    }}
                                >
                                    <FileText size={16} className="me-2" />
                                    Technicien
                                </button>
                                <button
                                    className="dropdown-item d-flex align-items-center px-4 py-2 w-100 border-0 bg-transparent"
                                    onClick={() => handleMessageTypeSelect('operateur')}
                                    style={{
                                        color: TEXT_COLOR,
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: HOVER_COLOR
                                        }
                                    }}
                                >
                                    <Users size={16} className="me-2" />
                                    Opérateur
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="p-3" style={{
                    borderTop: `1px solid ${BORDER_COLOR}`,
                    marginTop: 'auto',
                    flexShrink: 0
                }}>
                    <button
                        onClick={handleLogout}
                        className="w-100 d-flex align-items-center justify-content-center py-2 rounded"
                        style={{
                            color: PRIMARY_COLOR,
                            backgroundColor: 'transparent',
                            border: `1px solid ${PRIMARY_COLOR}`,
                            transition: 'all 0.2s',
                            ':hover': {
                                backgroundColor: 'rgba(67, 97, 238, 0.1)'
                            }
                        }}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="ms-2" style={{ fontWeight: 500 }}>Déconnexion</span>}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                marginLeft: sidebarOpen ? '280px' : '80px',
                flex: 1,
                transition: 'margin-left 0.3s ease',
                minWidth: 0
            }}>
                {/* Top Navigation Bar */}
                <nav
                    style={{
                        position: 'sticky',
                        top: 0,
                        height: '80px',
                        backgroundColor: 'white',
                        boxShadow: SHADOW,
                        zIndex: 999,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 2rem'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <button
                            className="btn btn-outline-primary me-3 d-lg-none"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                border: '1px solid rgba(67, 97, 238, 0.3)',
                                borderRadius: '8px',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Menu size={20} />
                        </button>
                        <h5 className="d-inline-block mb-0 text-dark text-capitalize" style={{ fontWeight: 600 }}>
                            {getActiveTitle()}
                        </h5>
                    </div>

                    {/* Menu Administrateur */}
                    <div className="dropdown" style={{ marginLeft: 'auto' }}>
                        <button
                            className="btn dropdown-toggle d-flex align-items-center"
                            type="button"
                            id="adminDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{
                                color: TEXT_COLOR,
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '8px 16px',
                                transition: 'all 0.2s ease',
                                ':hover': {
                                    backgroundColor: HOVER_COLOR
                                }
                            }}
                        >
                            <div className="me-2">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})`,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <span className="text-white fw-bold">{getInitials()}</span>
                                </div>
                            </div>
                            <span className="text-dark">{adminInfo.name || 'Administrateur'}</span>
                        </button>
                        <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="adminDropdown"
                            style={{
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                borderRadius: '8px',
                                padding: '0.5rem 0',
                                minWidth: '200px'
                            }}
                        >
                            <li>
                                <button
                                    className="dropdown-item d-flex align-items-center"
                                    onClick={() => {
                                        setActiveItem('profile');
                                        navigate('/admin/profile');
                                    }}
                                    style={{
                                        color: TEXT_COLOR,
                                        padding: '0.5rem 1.5rem',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: HOVER_COLOR
                                        }
                                    }}
                                >
                                    <User size={18} className="me-2" />
                                    Profil
                                </button>
                            </li>
                            <li>
                                <button
                                    className="dropdown-item d-flex align-items-center"
                                    onClick={() => {
                                        setActiveItem('settings');
                                        navigate('/admin/settings');
                                    }}
                                    style={{
                                        color: TEXT_COLOR,
                                        padding: '0.5rem 1.5rem',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: HOVER_COLOR
                                        }
                                    }}
                                >
                                    <Settings size={18} className="me-2" />
                                    Paramètres
                                </button>
                            </li>
                            <li><hr className="dropdown-divider my-1" /></li>
                            <li>
                                <button
                                    className="dropdown-item d-flex align-items-center"
                                    onClick={handleLogout}
                                    style={{
                                        color: PRIMARY_COLOR,
                                        padding: '0.5rem 1.5rem',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: HOVER_COLOR
                                        }
                                    }}
                                >
                                    <LogOut size={18} className="me-2" />
                                    Déconnexion
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Page Content */}
                <main style={{
                    padding: '2rem',
                    backgroundColor: BACKGROUND_COLOR,
                    minHeight: 'calc(100vh - 80px)'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

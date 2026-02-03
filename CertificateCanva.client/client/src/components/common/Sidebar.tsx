import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SarvarthLogo from './SarvarthLogo';
import '../../styles/components/sidebar.css';

interface SidebarProps {
    isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard' },
    ];

    const userLinks = [
        { path: '/user/dashboard', label: 'DashBoard' },
        { path: '/user/assets', label: 'Assets' },
        { path: '/user/canvas', label: 'Canvas' },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <SarvarthLogo />
            </div>
            <nav className="sidebar-nav">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <button
                            onClick={handleLogout}
                            className="sidebar-user-role"
                            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: '#666', fontSize: '0.8rem', textAlign: 'left' }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

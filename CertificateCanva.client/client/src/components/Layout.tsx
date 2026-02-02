import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    FileImage,
    PaintBucket,
    Award,
    LogOut,
    Menu,
    X,
    Shield,
} from 'lucide-react';
import './Layout.css';

interface LayoutProps {
    children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, isAdmin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            show: true,
        },
        {
            path: '/canvases',
            label: 'My Canvases',
            icon: PaintBucket,
            show: true,
        },
        {
            path: '/images',
            label: 'My Images',
            icon: FileImage,
            show: true,
        },
        {
            path: '/verify',
            label: 'Verify Certificate',
            icon: Award,
            show: true,
        },
        {
            path: '/admin/users',
            label: 'User Management',
            icon: Users,
            show: isAdmin,
        },
        {
            path: '/admin/dashboard',
            label: 'Admin Dashboard',
            icon: Shield,
            show: isAdmin,
        },
    ];

    return (
        <div className="layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    className="menu-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Link to="/dashboard" className="logo">
                    <Award size={28} />
                    <span>Certificate Canvas</span>
                </Link>
            </header>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/dashboard" className="logo">
                        <Award size={32} />
                        <span>Certificate Canvas</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems
                        .filter((item) => item.show)
                        .map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">
                                {isAdmin ? 'Administrator' : 'User'}
                            </span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">{children || <Outlet />}</div>
            </main>
        </div>
    );
};

export default Layout;

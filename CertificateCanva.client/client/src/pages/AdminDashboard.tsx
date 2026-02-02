import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../api';
import {
    Users,
    PaintBucket,
    Award,
    Activity,
    Link as LinkIcon,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import './AdminDashboard.css';

interface DashboardStats {
    totalUsers: number;
    totalCanvases: number;
    activeCanvases: number;
    totalCertificates: number;
    authorizedCertificates: number;
}

interface ActiveSession {
    id: string;
    title: string;
    user_name: string;
    user_email: string;
    session_start: string;
    last_active: string;
    is_active: boolean;
}

interface VerificationLink {
    id: string;
    verification_code: string;
    certificate_title: string;
    author_name: string;
    user_name: string;
    is_authorized: boolean;
    is_active: boolean;
    created_at: string;
}

interface ActivityLog {
    id: string;
    user_name: string;
    canvas_title: string;
    action_type: string;
    created_at: string;
}

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalCanvases: 0,
        activeCanvases: 0,
        totalCertificates: 0,
        authorizedCertificates: 0,
    });
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [verificationLinks, setVerificationLinks] = useState<VerificationLink[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [usersRes, sessionsRes, activeRes, certsRes, linksRes, logsRes] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getCanvasSessions(),
                adminApi.getActiveCanvasSessions(),
                adminApi.getCertificates(),
                adminApi.getVerificationLinks(),
                adminApi.getActivityLogs(),
            ]);

            const users = usersRes.data.data || [];
            const sessions = sessionsRes.data.data || [];
            const active = activeRes.data.data || [];
            const certs = certsRes.data.data || [];
            const links = linksRes.data.data || [];
            const logs = logsRes.data.data || [];

            setStats({
                totalUsers: users.length,
                totalCanvases: sessions.length,
                activeCanvases: active.length,
                totalCertificates: certs.length,
                authorizedCertificates: certs.filter((c: any) => c.is_authorized).length,
            });

            setActiveSessions(active);
            setVerificationLinks(links.slice(0, 10));
            setActivityLogs(logs.slice(0, 10));
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        // Auto-refresh every 30 seconds for real-time updates
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <p>Sarvarth Certificate Platform Overview</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card users">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>

                <div className="stat-card canvases">
                    <div className="stat-icon">
                        <PaintBucket size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalCanvases}</h3>
                        <p>Total Canvases</p>
                    </div>
                </div>

                <div className="stat-card active">
                    <div className="stat-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.activeCanvases}</h3>
                        <p>Active Sessions</p>
                    </div>
                </div>

                <div className="stat-card certificates">
                    <div className="stat-icon">
                        <Award size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.authorizedCertificates}</h3>
                        <p>Authorized Certificates</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                {/* Active Sessions */}
                <div className="admin-section">
                    <div className="section-header">
                        <h2>
                            <Activity size={20} />
                            Real-Time Canvas Activity
                        </h2>
                    </div>
                    <div className="activity-table">
                        {activeSessions.length === 0 ? (
                            <div className="empty-state">
                                <Activity size={32} />
                                <p>No active canvas sessions</p>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Canvas</th>
                                        <th>Session Start</th>
                                        <th>Last Active</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeSessions.map((session) => (
                                        <tr key={session.id}>
                                            <td>
                                                <div className="user-info">
                                                    <span className="user-name">{session.user_name}</span>
                                                    <span className="user-email">{session.user_email}</span>
                                                </div>
                                            </td>
                                            <td>{session.title}</td>
                                            <td>{formatDate(session.session_start)}</td>
                                            <td>{getTimeAgo(session.last_active)}</td>
                                            <td>
                                                <span className={`status-badge ${session.is_active ? 'active' : 'inactive'}`}>
                                                    {session.is_active ? (
                                                        <>
                                                            <span className="pulse"></span>
                                                            Active
                                                        </>
                                                    ) : (
                                                        'Inactive'
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Verification Links */}
                <div className="admin-section">
                    <div className="section-header">
                        <h2>
                            <LinkIcon size={20} />
                            Recent Verification Links
                        </h2>
                    </div>
                    <div className="links-grid">
                        {verificationLinks.length === 0 ? (
                            <div className="empty-state">
                                <LinkIcon size={32} />
                                <p>No verification links generated yet</p>
                            </div>
                        ) : (
                            verificationLinks.map((link) => (
                                <div key={link.id} className="link-card">
                                    <div className="link-header">
                                        <code className="verification-code">{link.verification_code}</code>
                                        <span className={`auth-status ${link.is_authorized ? 'authorized' : 'pending'}`}>
                                            {link.is_authorized ? (
                                                <CheckCircle size={14} />
                                            ) : (
                                                <XCircle size={14} />
                                            )}
                                        </span>
                                    </div>
                                    <div className="link-info">
                                        <p className="cert-title">{link.certificate_title}</p>
                                        <p className="author">By {link.author_name}</p>
                                        <p className="user">Created by {link.user_name}</p>
                                        <p className="date">{formatDate(link.created_at)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Activity Logs */}
                <div className="admin-section">
                    <div className="section-header">
                        <h2>
                            <Clock size={20} />
                            Recent Activity
                        </h2>
                    </div>
                    <div className="activity-list">
                        {activityLogs.length === 0 ? (
                            <div className="empty-state">
                                <Clock size={32} />
                                <p>No recent activity</p>
                            </div>
                        ) : (
                            activityLogs.map((log) => (
                                <div key={log.id} className="activity-item">
                                    <div className={`activity-icon ${log.action_type}`}>
                                        {log.action_type === 'save' ? (
                                            <Award size={16} />
                                        ) : log.action_type === 'export' ? (
                                            <Eye size={16} />
                                        ) : (
                                            <Activity size={16} />
                                        )}
                                    </div>
                                    <div className="activity-info">
                                        <p>
                                            <strong>{log.user_name}</strong>{' '}
                                            {log.action_type === 'save'
                                                ? 'saved and authorized'
                                                : log.action_type === 'export'
                                                    ? 'exported'
                                                    : log.action_type === 'session_start'
                                                        ? 'started editing'
                                                        : 'updated'}{' '}
                                            <strong>{log.canvas_title}</strong>
                                        </p>
                                        <span className="activity-time">{getTimeAgo(log.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Notice */}
            <div className="admin-notice">
                <div className="notice-content">
                    <p>
                        <strong>Note:</strong> As an admin, you can view all canvas sessions and activity but cannot design canvases.
                        Use a user account to create and design certificates.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

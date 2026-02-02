import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { canvasApi, imagesApi } from '../api';
import {
    PaintBucket,
    FileImage,
    Award,
    TrendingUp,
    Clock,
    Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

interface DashboardStats {
    totalCanvases: number;
    authorizedCanvases: number;
    totalImages: number;
    recentCanvases: any[];
}

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalCanvases: 0,
        authorizedCanvases: 0,
        totalImages: 0,
        recentCanvases: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [canvasRes, imagesRes] = await Promise.all([
                    canvasApi.getAll(),
                    imagesApi.getAll(),
                ]);

                const canvases = canvasRes.data.data || [];
                const images = imagesRes.data.data || [];

                setStats({
                    totalCanvases: canvases.length,
                    authorizedCanvases: canvases.filter((c: any) => c.is_authorized).length,
                    totalImages: images.length,
                    recentCanvases: canvases.slice(0, 5),
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>
                        {getGreeting()}, <span className="user-name">{user?.name}</span>!
                    </h1>
                    <p>Here's an overview of your certificate workspace</p>
                </div>
                <div className="header-actions">
                    <Link to="/canvases" className="btn btn-primary">
                        <Plus size={20} />
                        <span>Manage Canvases</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-primary">
                        <PaintBucket size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">
                            {loading ? '-' : stats.totalCanvases}
                        </span>
                        <span className="stat-label">Total Canvases</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-success">
                        <Award size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">
                            {loading ? '-' : stats.authorizedCanvases}
                        </span>
                        <span className="stat-label">Authorized Certificates</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-secondary">
                        <FileImage size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">
                            {loading ? '-' : stats.totalImages}
                        </span>
                        <span className="stat-label">Uploaded Images</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-accent">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">
                            {loading ? '-' :
                                stats.totalCanvases > 0
                                    ? Math.round((stats.authorizedCanvases / stats.totalCanvases) * 100)
                                    : 0
                            }%
                        </span>
                        <span className="stat-label">Authorization Rate</span>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {/* Recent Canvases */}
                <div className="card recent-canvases">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Clock size={20} />
                            Recent Canvases
                        </h3>
                        <Link to="/canvases" className="btn btn-sm btn-outline">
                            View All
                        </Link>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="loading-placeholder">
                                <div className="skeleton" style={{ height: '60px', marginBottom: '10px' }} />
                                <div className="skeleton" style={{ height: '60px', marginBottom: '10px' }} />
                                <div className="skeleton" style={{ height: '60px' }} />
                            </div>
                        ) : stats.recentCanvases.length > 0 ? (
                            <div className="canvas-list">
                                {stats.recentCanvases.map((canvas: any) => (
                                    <Link
                                        key={canvas.id}
                                        to={`/canvas/${canvas.id}/edit`}
                                        className="canvas-item"
                                    >
                                        <div className="canvas-icon">
                                            <PaintBucket size={20} />
                                        </div>
                                        <div className="canvas-info">
                                            <span className="canvas-title">{canvas.title}</span>
                                            <span className="canvas-date">
                                                {new Date(canvas.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="canvas-status">
                                            {canvas.is_authorized ? (
                                                <span className="badge badge-success">Authorized</span>
                                            ) : (
                                                <span className="badge badge-warning">Draft</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <PaintBucket size={48} />
                                <p>No canvases yet</p>
                                <Link to="/canvases" className="btn btn-primary btn-sm">
                                    Create your first canvas
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card quick-actions">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div className="card-body">
                        <div className="action-grid">
                            <Link to="/canvases" className="action-item">
                                <div className="action-icon">
                                    <PaintBucket size={24} />
                                </div>
                                <span>Canvases</span>
                            </Link>
                            <Link to="/images" className="action-item">
                                <div className="action-icon">
                                    <FileImage size={24} />
                                </div>
                                <span>Upload</span>
                            </Link>
                            <Link to="/verify" className="action-item">
                                <div className="action-icon">
                                    <Award size={24} />
                                </div>
                                <span>Verify</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

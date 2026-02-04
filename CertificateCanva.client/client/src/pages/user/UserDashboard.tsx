import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { canvasApi } from '../../api';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/pages/dashboard.css';

const UserDashboard: React.FC = () => {
    const [canvases, setCanvases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        canvasApi.getAll()
            .then(res => setCanvases(res.data.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        try {
            const res = await canvasApi.create('Untitled');
            navigate(`/canvas/${res.data.data.id}`);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Sidebar isAdmin={false} />
            <main className="main-content">
                <div className="page-container">
                    <header className="page-header">
                        <h1 className="page-title">Dashboard</h1>
                        <input type="text" className="page-search" placeholder="Search..." />
                    </header>

                    <section className="recents-section">
                        <h2 className="recents-title">Recents</h2>
                        {loading ? (
                            <div className="flex-center" style={{ padding: '40px' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <div className="recents-grid">
                                {canvases.map(canvas => (
                                    <div
                                        key={canvas.id}
                                        className="grid-item"
                                        onClick={() => navigate(`/canvas/${canvas.id}`)}
                                    >
                                        <div className="grid-item-image">
                                            <span className="grid-item-placeholder">☁️</span>
                                        </div>
                                        <div className="grid-item-label">{canvas.title || 'Untitled'}</div>
                                    </div>
                                ))}
                                <div className="grid-item" onClick={handleCreate} style={{ cursor: 'pointer' }}>
                                    <div className="grid-item-image">
                                        <span className="grid-item-placeholder">+</span>
                                    </div>
                                    <div className="grid-item-label">New Canvas</div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
};

export default UserDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { canvasApi } from '../api';
import {
    Plus,
    PaintBucket,
    Search,
    Trash2,
    Edit,
    Award,
    Calendar,
    X,
    Check,
    Eye,
    ExternalLink,
} from 'lucide-react';
import './Canvases.css';

interface Canvas {
    id: string;
    title: string;
    is_saved: boolean;
    is_authorized: boolean;
    created_at: string;
    updated_at: string;
    verification_code?: string;
}

export const Canvases: React.FC = () => {
    const navigate = useNavigate();
    const [canvases, setCanvases] = useState<Canvas[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'authorized' | 'pending'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCanvasTitle, setNewCanvasTitle] = useState('');
    const [creating, setCreating] = useState(false);

    const loadCanvases = useCallback(async () => {
        try {
            setLoading(true);
            const response = await canvasApi.getAll();
            setCanvases(response.data.data || []);
        } catch (error) {
            console.error('Failed to load canvases:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCanvases();
    }, [loadCanvases]);

    const handleCreate = async () => {
        if (!newCanvasTitle.trim()) {
            alert('Please enter a title');
            return;
        }

        setCreating(true);
        try {
            const response = await canvasApi.create(newCanvasTitle);
            const newCanvas = response.data.data;
            setShowCreateModal(false);
            setNewCanvasTitle('');
            // Navigate to editor
            navigate(`/canvas/${newCanvas.id}/edit`);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create canvas');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this canvas?')) return;

        try {
            await canvasApi.delete(id);
            setCanvases(prev => prev.filter(c => c.id !== id));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete canvas');
        }
    };

    const filteredCanvases = canvases.filter(canvas => {
        const matchesSearch = canvas.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'authorized' && canvas.is_authorized) ||
            (filterStatus === 'pending' && !canvas.is_authorized);
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="canvases-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <PaintBucket className="header-icon" />
                        My Canvases
                    </h1>
                    <p>Create and manage your certificate designs</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={20} />
                    New Canvas
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search canvases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'authorized' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('authorized')}
                    >
                        <Check size={14} />
                        Authorized
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pending
                    </button>
                </div>
            </div>

            {/* Canvas Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="loader"></div>
                    <p>Loading canvases...</p>
                </div>
            ) : filteredCanvases.length === 0 ? (
                <div className="empty-state">
                    <PaintBucket size={64} />
                    <h3>No canvases found</h3>
                    <p>
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first canvas to get started'}
                    </p>
                    {!searchTerm && filterStatus === 'all' && (
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={20} />
                            Create Canvas
                        </button>
                    )}
                </div>
            ) : (
                <div className="canvas-grid">
                    {filteredCanvases.map((canvas) => (
                        <div key={canvas.id} className="canvas-card">
                            <div className="canvas-preview">
                                <PaintBucket size={48} />
                            </div>
                            <div className="canvas-info">
                                <h3>{canvas.title}</h3>
                                <div className="canvas-meta">
                                    <span className="meta-item">
                                        <Calendar size={14} />
                                        {formatDate(canvas.created_at)}
                                    </span>
                                    <span className={`status-badge ${canvas.is_authorized ? 'authorized' : 'pending'}`}>
                                        {canvas.is_authorized ? (
                                            <>
                                                <Award size={12} />
                                                Authorized
                                            </>
                                        ) : (
                                            'Not Saved'
                                        )}
                                    </span>
                                </div>
                                {canvas.verification_code && (
                                    <div className="verification-info">
                                        <span className="verification-code">
                                            Code: {canvas.verification_code}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="canvas-actions">
                                <Link
                                    to={`/canvas/${canvas.id}/edit`}
                                    className="btn btn-secondary btn-sm"
                                    title="Edit Canvas"
                                >
                                    <Edit size={16} />
                                    Edit
                                </Link>
                                {canvas.verification_code && (
                                    <Link
                                        to={`/verify/${canvas.verification_code}`}
                                        className="btn btn-secondary btn-sm"
                                        title="View Certificate"
                                        target="_blank"
                                    >
                                        <Eye size={16} />
                                        View
                                    </Link>
                                )}
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(canvas.id)}
                                    title="Delete Canvas"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Canvas</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="canvas-title">Canvas Title</label>
                                <input
                                    id="canvas-title"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter canvas title..."
                                    value={newCanvasTitle}
                                    onChange={(e) => setNewCanvasTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={creating || !newCanvasTitle.trim()}
                            >
                                {creating ? 'Creating...' : 'Create & Open Editor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Canvases;

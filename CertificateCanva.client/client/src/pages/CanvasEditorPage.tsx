import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { canvasApi } from '../api';
import { CanvasEditor } from '../components/CanvasEditor/CanvasEditor';
import { ArrowLeft, Loader2 } from 'lucide-react';
import './CanvasEditorPage.css';

interface CanvasData {
    id: string;
    title: string;
    canvas_data: any;
    is_saved: boolean;
    is_authorized: boolean;
    verification_code?: string;
}

export const CanvasEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [canvas, setCanvas] = useState<CanvasData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadCanvas(id);
        }
    }, [id]);

    const loadCanvas = async (canvasId: string) => {
        try {
            setLoading(true);
            const response = await canvasApi.getOne(canvasId);
            setCanvas(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load canvas');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = (result: any) => {
        if (canvas) {
            setCanvas({
                ...canvas,
                is_saved: true,
                is_authorized: true,
                verification_code: result.verification_code,
            });
        }
    };

    if (loading) {
        return (
            <div className="editor-page-loading">
                <Loader2 className="spinner" size={48} />
                <p>Loading canvas...</p>
            </div>
        );
    }

    if (error || !canvas) {
        return (
            <div className="editor-page-error">
                <h2>Error</h2>
                <p>{error || 'Canvas not found'}</p>
                <Link to="/canvases" className="btn btn-primary">
                    Back to Canvases
                </Link>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <div className="editor-header">
                <Link to="/canvases" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Canvases
                </Link>
                <div className="editor-title">
                    <h1>{canvas.title}</h1>
                    {canvas.is_authorized && (
                        <span className="authorized-badge">✓ Authorized</span>
                    )}
                </div>
            </div>

            <CanvasEditor
                canvasId={canvas.id}
                initialData={canvas}
                title={canvas.title}
                onSave={handleSave}
            />
        </div>
    );
};

export default CanvasEditorPage;

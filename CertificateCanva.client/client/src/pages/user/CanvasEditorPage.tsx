import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { canvasApi } from '../../api';
import '../../styles/pages/dashboard.css'; // Reuse dashboard styles for loading state

const CanvasEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [canvasData, setCanvasData] = useState<any>(null);
    const [EditorComponent, setEditorComponent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
        // Load Editor component dynamically
        import('../../components/AdvancedEditor/Editor').then(module => {
            setEditorComponent(() => module.AdvancedEditor);
        });

        // Load Canvas Data
        if (id) {
            canvasApi.getOne(id)
                .then(res => {
                    const data = res.data.data;
                    setCanvasData({
                        id: data.id,
                        json: data.canvas_data || "{}",
                        width: data.width || 1200,
                        height: data.height || 900,
                        holder_name: data.holder_name,
                        certificate_title: data.title, // Use title as certificate title default
                        issue_date: data.issue_date,
                        organization_name: data.organization_name,
                        certificate_id: data.certificate_id,
                        is_authorized: data.is_authorized
                    });
                })
                .catch(err => {
                    console.error("Failed to load canvas", err);
                    navigate('/user/dashboard');
                })
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    const handleSave = useCallback(async (values: any) => {
        if (!id) return;
        try {
            await canvasApi.save(id, {
                canvas_data: values.json,
                title: values.title || values.certificate_title,
                holder_name: values.holder_name,
                certificate_title: values.certificate_title,
                issue_date: values.issue_date,
                organization_name: values.organization_name
            });
            // Reload to get updated data if needed, or just notify user
            // For now, we assume success
        } catch (error) {
            console.error("Failed to save", error);
        }
    }, [id]);

    if (!id || loading || !EditorComponent) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return <EditorComponent initialData={canvasData} onSave={handleSave} />;
};

export default CanvasEditorPage;

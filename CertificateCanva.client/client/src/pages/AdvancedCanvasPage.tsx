import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { canvasApi } from '../api';
import { AdvancedEditor } from '../components/AdvancedEditor/Editor';

const SarvarthLogo: React.FC = () => (
    <div className="flex items-center">
        <img
            src="/sarvarth-logo.png"
            alt="Sarvarth"
            className="h-10 object-contain"
        />
    </div>
);

const AdvancedCanvasPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [canvas, setCanvas] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState('Certificate of Achievement');

    useEffect(() => {
        if (id) {
            setLoading(true);
            canvasApi.getOne(id).then(res => {
                setCanvas(res.data.data);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setError("Failed to load canvas or unauthorized access");
                setLoading(false);
            });
        }
    }, [id]);

    const handleSave = async (values: any) => {
        if (!id) return;
        try {
            const res = await canvasApi.save(id, {
                canvas_data: values.json,
                title: values.title || canvas.title || 'Untitled',
                holder_name: values.holder_name,
                certificate_title: values.certificate_title,
                issue_date: values.issue_date,
                organization_name: values.organization_name
            });
            // Update local state with new metadata (like certificate_id)
            setCanvas(res.data.data);
        } catch (e) {
            console.error("Failed to save", e);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await canvasApi.create(title || 'Untitled');
            navigate(`/canvas/${res.data.data.id}`, {
                replace: true,
                state: location.state // Pass initial image forward if any
            });
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="text-center">
                    <div
                        className="animate-spin w-12 h-12 border-4 border-gray-200 rounded-full mx-auto mb-4"
                        style={{ borderTopColor: '#ee7158' }}
                    />
                    <SarvarthLogo />
                </div>
            </div>
        );
    }

    if (!id) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f5f5f0' }}>
                <div className="w-full max-w-lg">
                    <div className="flex justify-center mb-8">
                        <SarvarthLogo />
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Create New Design
                        </h2>
                        <p className="text-gray-500 mb-8">Start designing your certificate</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 transition-all"
                                    style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                                    placeholder="Certificate of Achievement"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-center"
                                    onClick={handleCreate}
                                >
                                    <div className="w-12 h-8 bg-gray-200 rounded mx-auto mb-2" />
                                    <span className="text-xs text-gray-600">Landscape</span>
                                </button>
                                <button
                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-center"
                                    onClick={handleCreate}
                                >
                                    <div className="w-8 h-10 bg-gray-200 rounded mx-auto mb-2" />
                                    <span className="text-xs text-gray-600">Portrait</span>
                                </button>
                                <button
                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-center"
                                    onClick={handleCreate}
                                >
                                    <div className="w-10 h-10 bg-gray-200 rounded mx-auto mb-2" />
                                    <span className="text-xs text-gray-600">Square</span>
                                </button>
                            </div>

                            <button
                                onClick={handleCreate}
                                className="w-full py-3.5 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                                style={{ backgroundColor: '#ee7158' }}
                            >
                                Start Designing
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-sm hover:underline"
                                style={{ color: '#3d5a5a' }}
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Canvas</h2>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 text-white rounded-lg"
                        style={{ backgroundColor: '#ee7158' }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!canvas) return null;

    return (
        <div className="h-screen w-full">
            <AdvancedEditor
                initialData={{
                    id: canvas.id,
                    json: canvas.canvas_data || "",
                    width: canvas.width || 1200,
                    height: canvas.height || 900,
                    holder_name: canvas.holder_name,
                    certificate_title: canvas.certificate_title,
                    issue_date: canvas.issue_date,
                    organization_name: canvas.organization_name,
                    certificate_id: canvas.certificate_id,
                    is_authorized: canvas.is_authorized
                }}
                onSave={handleSave}
            />
        </div>
    );
};

export default AdvancedCanvasPage;

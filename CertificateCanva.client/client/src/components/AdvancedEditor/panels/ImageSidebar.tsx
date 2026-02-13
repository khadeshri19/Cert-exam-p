import { useRef, useState, useEffect } from "react";
import { Upload, Trash2, Plus } from "lucide-react";

import type { ActiveTool, Editor } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ScrollArea } from "../ScrollArea";
import { imagesApi } from "../../../api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getImageUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    return `${API_URL}/${cleanPath}`;
};

interface ImageSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (activeTool === "images") {
            fetchImages();
        }
    }, [activeTool]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await imagesApi.getAll();
            setImages(res.data.data || []);
        } catch (e) {
            console.error('Failed to fetch images:', e);
        }
        setLoading(false);
    };

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploading(true);
            try {
                await imagesApi.upload(file);
                fetchImages();
            } catch (err) {
                console.error('Upload failed:', err);
            }
            setUploading(false);
        }
    };

    const handleAddToCanvas = (url: string) => {
        editor?.addImage(url);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this image?')) return;
        try {
            await imagesApi.delete(id);
            fetchImages();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <aside
            style={{
                display: activeTool === "images" ? "flex" : "none",
                backgroundColor: 'white',
                position: 'relative',
                borderRight: '1px solid #e5e7eb',
                zIndex: 40,
                width: '300px',
                height: '100%',
                flexDirection: 'column',
                overflow: 'visible'
            }}
        >
            <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>Upload your assets</h2>
            </div>

            <div style={{ padding: '16px' }}>
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={inputRef}
                    onChange={onUpload}
                />
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'white',
                        border: '2px solid #2563eb',
                        color: '#2563eb',
                        fontWeight: 500,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        opacity: uploading ? 0.5 : 1
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    Images
                </button>
            </div>

            <ScrollArea>
                <div style={{ padding: '16px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                            <div className="spinner" style={{
                                width: '32px',
                                height: '32px',
                                border: '3px solid #f3f4f6',
                                borderTop: '3px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                        </div>
                    ) : images.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    onClick={() => handleAddToCanvas(getImageUrl(img.file_url))}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("image_url", getImageUrl(img.file_url));
                                    }}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1/1',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: '1px solid #f3f4f6',
                                        backgroundColor: '#f9fafb',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#f3f4f6'}
                                >
                                    <img
                                        src={getImageUrl(img.file_url)}
                                        alt={img.file_name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                                    />
                                    <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                                        <button
                                            onClick={(e) => handleDelete(img.id, e)}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ef4444',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <Trash2 style={{ width: '12px', height: '12px' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Upload style={{ width: '32px', height: '32px', color: '#d1d5db', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>No assets uploaded yet</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

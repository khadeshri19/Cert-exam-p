import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { filesApi } from '../../../api';

interface UploadPanelProps {
    canvasId: string;
    onAddImage: (imageUrl: string) => void;
    onSetBackground: (imageUrl: string) => void;
}

interface UploadedFile {
    id: string;
    file_name: string;
    original_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
}

const UploadPanel: React.FC<UploadPanelProps> = ({
    canvasId,
    onAddImage,
    onSetBackground,
}) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load existing files
    useEffect(() => {
        loadFiles();
    }, [canvasId]);

    const loadFiles = async () => {
        try {
            const response = await filesApi.getAll(canvasId);
            setFiles(response.data.data || []);
        } catch (error) {
            console.error('Failed to load files:', error);
        }
    };

    const handleUpload = async (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Allowed: JPG, PNG, PDF');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Maximum size: 5MB');
            return;
        }

        setIsUploading(true);

        try {
            const response = await filesApi.upload(file, canvasId);
            const uploadedFile = response.data.data;
            setFiles((prev) => [uploadedFile, ...prev]);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleAddToCanvas = (file: UploadedFile) => {
        const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${file.file_url}`;
        onAddImage(fullUrl);
    };

    const handleSetAsBackground = (file: UploadedFile) => {
        const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${file.file_url}`;
        onSetBackground(fullUrl);
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm('Delete this file?')) return;

        try {
            await filesApi.delete(fileId);
            setFiles((prev) => prev.filter((f) => f.id !== fileId));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete file');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="upload-panel">
            {/* Dropzone */}
            <div
                className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="upload-icon" size={48} />
                <p>{isUploading ? 'Uploading...' : 'Drag & drop or click to upload'}</p>
                <span className="allowed-formats">Allowed: JPG, PNG, PDF (max 5MB)</span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Uploaded Files */}
            {files.length > 0 && (
                <div className="uploaded-files">
                    <h4 className="panel-section-title">Uploaded Files</h4>
                    {files.map((file) => (
                        <div key={file.id} className="uploaded-file">
                            {file.file_type !== 'pdf' ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${file.file_url}`}
                                    alt={file.original_name}
                                />
                            ) : (
                                <div className="file-icon">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                            <div className="file-info">
                                <div className="file-name">{file.original_name}</div>
                                <div className="file-size">{formatFileSize(file.file_size)}</div>
                            </div>
                            <div className="file-actions">
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleAddToCanvas(file)}
                                    title="Add to canvas"
                                >
                                    <ImageIcon size={14} />
                                </button>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleSetAsBackground(file)}
                                    title="Set as background"
                                    style={{ marginLeft: 4 }}
                                >
                                    BG
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(file.id)}
                                    title="Delete"
                                    style={{ marginLeft: 4 }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UploadPanel;

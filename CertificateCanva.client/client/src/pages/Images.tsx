import React, { useState, useEffect, useCallback, useRef } from 'react';
import { imagesApi } from '../api';
import {
    Upload,
    FileImage,
    Trash2,
    X,
    Image as ImageIcon,
    Eye,
    AlertCircle,
    Check,
} from 'lucide-react';
import './Images.css';

interface UploadedImage {
    id: string;
    file_name: string;
    original_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const Images: React.FC = () => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal states
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Drag and drop
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await imagesApi.getAll();
            setImages(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch images:', error);
            setError('Failed to load images');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Allowed: PNG, JPG, SVG, PDF');
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            setError('File size exceeds 5MB limit');
            return;
        }

        setUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 5, 95));
            }, 100);

            await imagesApi.upload(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            await fetchImages();
            setSuccess('File uploaded successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to upload file');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDelete = async () => {
        if (!selectedImage) return;

        setDeleting(true);

        try {
            await imagesApi.delete(selectedImage.id);
            setImages(prev => prev.filter(img => img.id !== selectedImage.id));
            setShowDeleteModal(false);
            setSelectedImage(null);
            setSuccess('File deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to delete file');
        } finally {
            setDeleting(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const isImage = (type: string) => {
        return type.startsWith('image/') || type === 'image' || !type.includes('pdf');
    };

    return (
        <div className="images-page">
            <div className="page-header">
                <div>
                    <h1>Media Manager</h1>
                    <p>Upload and manage your certificate assets</p>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button className="alert-close" onClick={() => setError('')}>
                        <X size={16} />
                    </button>
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <Check size={20} />
                    <span>{success}</span>
                    <button className="alert-close" onClick={() => setSuccess('')}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Upload Area */}
            <div
                className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,application/pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    hidden
                />

                {uploading ? (
                    <div className="upload-progress">
                        <div className="progress-circle">
                            <svg viewBox="0 0 36 36">
                                <path
                                    className="circle-bg"
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="circle-progress"
                                    strokeDasharray={`${uploadProgress}, 100`}
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="progress-text">{uploadProgress}%</span>
                        </div>
                        <p>Uploading Asset...</p>
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">
                            <Upload size={48} />
                        </div>
                        <h3>Drop files here or click to upload</h3>
                        <p>Supports PNG, JPG, SVG, PDF (max 5MB)</p>
                    </>
                )}
            </div>

            {/* Images Grid */}
            <div className="images-section">
                <h2>Uploaded Assets ({images.length})</h2>

                {loading ? (
                    <div className="images-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="image-card skeleton-card">
                                <div className="skeleton" style={{ height: '150px' }} />
                            </div>
                        ))}
                    </div>
                ) : images.length > 0 ? (
                    <div className="images-grid">
                        {images.map((image) => (
                            <div key={image.id} className="image-card">
                                <div className="image-preview">
                                    {isImage(image.file_type) ? (
                                        <img
                                            src={getImageUrl(image.file_url)}
                                            alt={image.original_name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Load+Error';
                                            }}
                                        />
                                    ) : (
                                        <div className="file-placeholder">
                                            <FileImage size={48} />
                                            <span>PDF</span>
                                        </div>
                                    )}
                                </div>
                                <div className="image-info">
                                    <h4 className="image-name" title={image.original_name}>
                                        {image.original_name}
                                    </h4>
                                    <p className="image-meta">
                                        {formatFileSize(image.file_size)} •{' '}
                                        {new Date(image.uploaded_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="image-actions">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => {
                                            setSelectedImage(image);
                                            setShowPreviewModal(true);
                                        }}
                                        title="Preview"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            setSelectedImage(image);
                                            setShowDeleteModal(true);
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state card">
                        <FileImage size={64} />
                        <h3>No assets uploaded</h3>
                        <p>Upload your first design asset to get started</p>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreviewModal && selectedImage && (
                <div className="modal-backdrop" onClick={() => setShowPreviewModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedImage.original_name}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowPreviewModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body preview-body">
                            {isImage(selectedImage.file_type) ? (
                                <img
                                    src={getImageUrl(selectedImage.file_url)}
                                    alt={selectedImage.original_name}
                                    className="preview-image"
                                />
                            ) : (
                                <div className="file-placeholder large">
                                    <FileImage size={96} />
                                    <p>PDF Preview not available</p>
                                    <a
                                        href={getImageUrl(selectedImage.file_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ marginTop: '20px' }}
                                    >
                                        Open PDF
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <p className="image-details">
                                {formatFileSize(selectedImage.file_size)} •{' '}
                                {selectedImage.file_type} •{' '}
                                Uploaded on {new Date(selectedImage.uploaded_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedImage && (
                <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Asset</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Are you sure you want to delete{' '}
                                <strong>{selectedImage.original_name}</strong>? This action cannot be
                                undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Asset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Images;

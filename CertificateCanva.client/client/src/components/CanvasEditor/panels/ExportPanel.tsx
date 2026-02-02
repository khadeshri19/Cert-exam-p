import React from 'react';
import { Image as ImageIcon, FileText, AlertTriangle } from 'lucide-react';

interface ExportPanelProps {
    canExport: boolean;
    isSaved: boolean;
    verificationUrl: string | null;
    onExport: (format: 'png' | 'pdf') => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
    canExport,
    isSaved,
    verificationUrl,
    onExport,
}) => {
    return (
        <div className="export-panel">
            {/* Export Warning */}
            {!canExport && (
                <div className="export-warning">
                    <AlertTriangle size={20} style={{ marginBottom: '8px' }} />
                    <p style={{ margin: 0 }}>
                        <strong>Export Disabled</strong>
                        <br />
                        {!isSaved
                            ? 'Save the canvas first to enable export'
                            : 'Generate verification link to enable export'}
                    </p>
                </div>
            )}

            {/* Export Options */}
            <div className="panel-section">
                <h4 className="panel-section-title">Export Format</h4>
                <div className="export-options">
                    <button
                        className="export-option"
                        onClick={() => onExport('png')}
                        disabled={!canExport}
                    >
                        <div className="export-option-icon">
                            <ImageIcon size={24} />
                        </div>
                        <div className="export-option-info">
                            <h4>PNG Image</h4>
                            <p>High quality image format</p>
                        </div>
                    </button>

                    <button
                        className="export-option"
                        onClick={() => onExport('pdf')}
                        disabled={!canExport}
                    >
                        <div className="export-option-icon">
                            <FileText size={24} />
                        </div>
                        <div className="export-option-info">
                            <h4>PDF Document</h4>
                            <p>Print-ready document format</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Verification Info */}
            {canExport && verificationUrl && (
                <div className="panel-section">
                    <div style={{
                        padding: '12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}>
                        <p style={{ margin: 0, color: 'var(--color-success)' }}>
                            <strong>✓ Verification Embedded</strong>
                        </p>
                        <p style={{ margin: '8px 0 0', color: 'var(--color-text-secondary)' }}>
                            The exported certificate will include the verification link for authenticity.
                        </p>
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="panel-section">
                <div style={{
                    padding: '12px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                }}>
                    <strong>Export Flow:</strong>
                    <ol style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
                        <li>Design your certificate on the canvas</li>
                        <li>Save to generate verification link</li>
                        <li>Export as PNG or PDF</li>
                        <li>Share with recipients</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default ExportPanel;

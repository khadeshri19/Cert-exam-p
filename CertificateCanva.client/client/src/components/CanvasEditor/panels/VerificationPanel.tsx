import React from 'react';
import { Check, AlertCircle, Copy, Link as LinkIcon, Save } from 'lucide-react';

interface VerificationPanelProps {
    isSaved: boolean;
    isSaving: boolean;
    verificationCode: string | null;
    verificationUrl: string | null;
    title: string;
    authorName: string;
    onTitleChange: (title: string) => void;
    onAuthorNameChange: (authorName: string) => void;
    onSave: () => void;
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({
    isSaved,
    isSaving,
    verificationCode,
    verificationUrl,
    title,
    authorName,
    onTitleChange,
    onAuthorNameChange,
    onSave,
}) => {
    const copyToClipboard = () => {
        if (verificationUrl) {
            navigator.clipboard.writeText(verificationUrl);
            alert('Verification link copied!');
        }
    };

    return (
        <div className="verification-panel">
            {/* Certificate Details */}
            <div className="panel-section">
                <h4 className="panel-section-title">Certificate Details</h4>
                <div className="panel-row">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Certificate Title *"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                    />
                </div>
                <div className="panel-row">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Author Name *"
                        value={authorName}
                        onChange={(e) => onAuthorNameChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="panel-section">
                <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={onSave}
                    disabled={isSaving || !title.trim() || !authorName.trim()}
                >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save & Generate Link'}
                </button>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px', textAlign: 'center' }}>
                    Saving will generate a verification link
                </p>
            </div>

            {/* Verification Status */}
            <div className="panel-section">
                <h4 className="panel-section-title">Verification Status</h4>
                <div className={`verification-status ${isSaved ? 'saved' : 'not-saved'}`}>
                    <div className="verification-status-icon">
                        {isSaved ? <Check size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <h4>
                        {isSaved ? 'Certificate Authorized' : 'Not Saved Yet'}
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '8px 0 0' }}>
                        {isSaved
                            ? 'Verification link is generated and active'
                            : 'Save the canvas to generate verification link'}
                    </p>
                </div>
            </div>

            {/* Verification Link */}
            {verificationCode && verificationUrl && (
                <div className="panel-section">
                    <h4 className="panel-section-title">Verification Link</h4>
                    <div className="verification-link">
                        <LinkIcon size={14} style={{ marginRight: '8px', flexShrink: 0 }} />
                        {verificationUrl}
                    </div>
                    <button className="btn btn-secondary copy-btn" onClick={copyToClipboard}>
                        <Copy size={14} />
                        Copy Link
                    </button>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '12px' }}>
                        <strong>Code:</strong> {verificationCode}
                    </p>
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
                    <strong>How it works:</strong>
                    <ul style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
                        <li>Fill in certificate title and author name</li>
                        <li>Click "Save & Generate Link"</li>
                        <li>Share the verification link with recipients</li>
                        <li>Anyone can verify the certificate publicly</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VerificationPanel;

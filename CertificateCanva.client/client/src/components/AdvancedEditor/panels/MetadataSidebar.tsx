import { useState, useEffect } from "react";
import { User, FileText, Calendar, Building2, Copy, Check } from "lucide-react";

import type { ActiveTool, Editor } from "../types";

interface MetadataSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    metadata: {
        holder_name: string;
        certificate_title: string;
        issue_date: string;
        organization_name: string;
    };
    onMetadataChange: (metadata: any) => void;
    certificateId?: string;
    onGenerate?: () => void;
    isSaving?: boolean;
}

export const MetadataSidebar = ({
    editor: _editor,
    activeTool: _activeTool,
    onChangeActiveTool: _onChangeActiveTool,
    metadata,
    onMetadataChange,
    certificateId,
    onGenerate,
    isSaving
}: MetadataSidebarProps) => {
    const [localMetadata, setLocalMetadata] = useState(metadata);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLocalMetadata(metadata);
    }, [metadata]);

    const handleChange = (field: string, value: string) => {
        const updated = { ...localMetadata, [field]: value };
        setLocalMetadata(updated);
        onMetadataChange(updated);
    };

    const handleCopyId = () => {
        if (certificateId) {
            navigator.clipboard.writeText(certificateId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="metadata-header">
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: 0 }}>Certificate Info</h3>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Enter certificate details</p>
            </div>

            <div className="metadata-form" style={{ overflowY: 'auto' }}>
                <div className="metadata-field">
                    <label className="metadata-label">
                        <User size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                        Name
                    </label>
                    <input
                        className="metadata-input"
                        value={localMetadata.holder_name}
                        onChange={(e) => handleChange('holder_name', e.target.value)}
                        placeholder="Holder Name"
                    />
                </div>

                <div className="metadata-field">
                    <label className="metadata-label">
                        <FileText size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                        Title
                    </label>
                    <input
                        className="metadata-input"
                        value={localMetadata.certificate_title}
                        onChange={(e) => handleChange('certificate_title', e.target.value)}
                        placeholder="Certificate Title"
                    />
                </div>

                <div className="metadata-field">
                    <label className="metadata-label">
                        <Calendar size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                        Date
                    </label>
                    <input
                        type="date"
                        className="metadata-input"
                        value={localMetadata.issue_date}
                        onChange={(e) => handleChange('issue_date', e.target.value)}
                    />
                </div>

                <div className="metadata-field">
                    <label className="metadata-label">
                        <Building2 size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                        Organization
                    </label>
                    <input
                        className="metadata-input"
                        value={localMetadata.organization_name}
                        onChange={(e) => handleChange('organization_name', e.target.value)}
                        placeholder="Organization Name"
                    />
                </div>

                {certificateId && (
                    <div className="certificate-id-display">
                        <label className="certificate-id-label">Certificate ID</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <code className="certificate-id-value" style={{ flex: 1 }}>{certificateId}</code>
                            <button onClick={handleCopyId} className="btn-outline" style={{ padding: 6 }}>
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                )}

                <button
                    className="generate-button"
                    onClick={onGenerate}
                    disabled={isSaving}
                    style={{ marginTop: 'auto', opacity: isSaving ? 0.7 : 1 }}
                >
                    {isSaving ? 'GENERATING...' : 'GENERATE'}
                </button>
            </div>
        </div>
    );
};

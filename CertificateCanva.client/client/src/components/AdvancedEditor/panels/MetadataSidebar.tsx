import { useState, useEffect } from "react";
import { User, FileText, Calendar, Building2, Copy, Check, ChevronsRight } from "lucide-react";

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
    onChangeActiveTool,
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', position: 'relative' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>Certificate Info</h3>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Enter certificate details</p>
            </div>

            <button
                onClick={() => onChangeActiveTool("select")}
                style={{
                    position: 'absolute',
                    left: '-28px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '28px',
                    height: '64px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRight: 'none',
                    borderRadius: '12px 0 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 50,
                    color: '#9ca3af',
                    boxShadow: '-1px 0 2px rgba(0,0,0,0.05)'
                }}
            >
                <ChevronsRight size={16} />
            </button>

            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} />
                        Name
                    </label>
                    <input
                        style={{ padding: '8px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none' }}
                        value={localMetadata.holder_name}
                        onChange={(e) => handleChange('holder_name', e.target.value)}
                        placeholder="Holder Name"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} />
                        Title
                    </label>
                    <input
                        style={{ padding: '8px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none' }}
                        value={localMetadata.certificate_title}
                        onChange={(e) => handleChange('certificate_title', e.target.value)}
                        placeholder="Certificate Title"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        Date
                    </label>
                    <input
                        type="date"
                        style={{ padding: '8px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none' }}
                        value={localMetadata.issue_date}
                        onChange={(e) => handleChange('issue_date', e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={14} />
                        Organization
                    </label>
                    <input
                        style={{ padding: '8px 12px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none' }}
                        value={localMetadata.organization_name}
                        onChange={(e) => handleChange('organization_name', e.target.value)}
                        placeholder="Organization Name"
                    />
                </div>

                {certificateId && (
                    <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>Certificate ID</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code style={{ flex: 1, padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{certificateId}</code>
                            <button
                                onClick={handleCopyId}
                                style={{ padding: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={onGenerate}
                    disabled={isSaving}
                    style={{
                        marginTop: 'auto',
                        padding: '12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        opacity: isSaving ? 0.7 : 1
                    }}
                >
                    {isSaving ? 'GENERATING...' : 'GENERATE'}
                </button>
            </div>
        </div>
    );
};

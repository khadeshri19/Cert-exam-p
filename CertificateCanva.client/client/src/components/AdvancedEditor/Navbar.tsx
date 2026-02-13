import {
    CheckCircle,
    ShieldCheck,
    ChevronLeft,
    Undo2,
    Redo2
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { certificateApi } from "../../api";

import type { ActiveTool, Editor } from "./types";

interface NavbarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    id?: string;
    certificateId?: string;
    isAuthorized?: boolean;
};

export const Navbar = ({
    editor,
    activeTool: _activeTool,
    onChangeActiveTool: _onChangeActiveTool,
    id,
    certificateId: _certificateId,
    isAuthorized: initialIsAuthorized
}: NavbarProps) => {
    const navigate = useNavigate();
    const { } = useAuth();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(initialIsAuthorized);
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    const handleExport = (format: 'png' | 'jpg' | 'svg' | 'json') => {
        switch (format) {
            case 'png':
                editor?.savePng();
                break;
            case 'jpg':
                editor?.saveJpg();
                break;
            case 'svg':
                editor?.saveSvg();
                break;
            case 'json':
                editor?.saveJson();
                break;
        }
        setShowExportMenu(false);
    };

    const handleAuthorize = async () => {
        if (!id) return;
        setIsAuthorizing(true);
        try {
            await certificateApi.authorize(id);
            setIsAuthorized(true);
            alert("Certificate authorized successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to authorize certificate");
        } finally {
            setIsAuthorizing(false);
        }
    };

    const buttonStyle = {
        padding: '8px 16px',
        backgroundColor: '#ef4444',
        color: 'white',
        fontSize: '14px',
        fontWeight: 500,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.2s',
    };

    const toolBtnStyle = {
        padding: '8px',
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px'
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', backgroundColor: 'white' }}>
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate('/user/dashboard')}
                    style={{ ...toolBtnStyle, backgroundColor: '#f3f4f6' }}
                >
                    <ChevronLeft size={20} />
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        style={toolBtnStyle}
                        onClick={() => editor?.onUndo()}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        style={toolBtnStyle}
                        onClick={() => editor?.onRedo()}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Redo2 size={18} />
                    </button>
                </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: isAuthorized ? '#10b981' : '#3b82f6',
                        opacity: isAuthorizing ? 0.7 : 1
                    }}
                    onClick={handleAuthorize}
                    disabled={isAuthorized || isAuthorizing}
                >
                    {isAuthorized ? <CheckCircle size={16} /> : <ShieldCheck size={16} />}
                    {isAuthorized ? 'Authorized' : 'Authorize'}
                </button>

                <div style={{ position: 'relative' }}>
                    <button
                        style={buttonStyle}
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                        Download
                    </button>
                    {showExportMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderRadius: '4px',
                            padding: '4px',
                            zIndex: 100,
                            minWidth: '120px',
                            border: '1px solid #e5e7eb'
                        }}>
                            {['png', 'jpg', 'svg', 'json'].map((ext) => (
                                <button
                                    key={ext}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#374151',
                                        borderRadius: '2px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    onClick={() => handleExport(ext as any)}
                                >
                                    {ext.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
import SarvarthLogo from "../common/SarvarthLogo";

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
    const { isAdmin } = useAuth();
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


    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left */}
            <div className="editor-nav-left">
                <button onClick={() => navigate('/user/dashboard')} className="btn-outline" style={{ padding: '8px', border: 'none' }}>
                    <ChevronLeft size={20} />
                </button>
                

                <div style={{ display: 'flex', gap: 5, marginLeft: 20 }}>
                    <button className="tool-button" onClick={() => editor?.onUndo()}>
                        <Undo2 size={18} />
                    </button>
                    <button className="tool-button" onClick={() => editor?.onRedo()}>
                        <Redo2 size={18} />
                    </button>
                </div>
            </div>

            {/* Right */}
            <div className="editor-nav-right">
                <button
                    className="export-button"
                    onClick={handleAuthorize}
                    disabled={isAuthorized || isAuthorizing}
                    style={{ backgroundColor: isAuthorized ? '#10b981' : undefined }}
                >
                    {isAuthorized ? <CheckCircle size={16} /> : <ShieldCheck size={16} />}
                    {isAuthorized ? 'Authorized' : 'Authorize'}
                </button>

                <div style={{ position: 'relative' }}>
                    <button className="export-button" onClick={() => setShowExportMenu(!showExportMenu)}>
                        Download
                    </button>
                    {showExportMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 5,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            borderRadius: 4,
                            padding: 5,
                            zIndex: 100,
                            minWidth: 120,
                            border: '1px solid #eee'
                        }}>
                            <button style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleExport('png')}>
                                PNG
                            </button>
                            <button style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleExport('jpg')}>
                                JPG
                            </button>
                            <button style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleExport('svg')}>
                                SVG
                            </button>
                            <button style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleExport('json')}>
                                JSON
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

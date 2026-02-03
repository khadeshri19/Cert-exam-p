import {
    Download,
    MousePointerClick,
    Redo2,
    Undo2,
    ChevronLeft,
    FileImage,
    FileText,
    CheckCircle,
    ExternalLink,
    ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { certificateApi } from "../../api";

import type { ActiveTool, Editor } from "./types";
import { cn } from "../../lib/utils";

interface NavbarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    id?: string;
    certificateId?: string;
    isAuthorized?: boolean;
};

const SarvarthLogo: React.FC = () => (
    <div className="flex items-center">
        <img
            src="/sarvarth-logo.png"
            alt="Sarvarth"
            className="h-8 object-contain"
        />
    </div>
);

export const Navbar = ({
    editor,
    activeTool,
    onChangeActiveTool,
    id,
    certificateId,
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

    const handleVerifyClick = () => {
        if (!certificateId) {
            alert("Please save the certificate first to generate a Verification ID");
            return;
        }
        window.open(`/verify/${certificateId}`, "_blank");
    };

    return (
        <nav className="w-full flex items-center px-4 h-[60px] gap-x-6 border-b bg-white shadow-sm">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ChevronLeft className="size-5" />
            </button>

            <div className="flex items-center gap-x-3">
                <SarvarthLogo />
                <div className="h-6 w-px bg-gray-200" />
                <span className="text-sm font-medium text-gray-600">Canvas Editor</span>
            </div>

            <div className="flex-1 flex items-center gap-x-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50">
                    <button
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            activeTool === "select"
                                ? "bg-white shadow-sm text-gray-800"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                        onClick={() => onChangeActiveTool("select")}
                        title="Select"
                    >
                        <MousePointerClick className="size-4" />
                    </button>
                    <button
                        disabled={!editor?.canUndo()}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        onClick={() => editor?.onUndo()}
                        title="Undo"
                    >
                        <Undo2 className="size-4" />
                    </button>
                    <button
                        disabled={!editor?.canRedo()}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        onClick={() => editor?.onRedo()}
                        title="Redo"
                    >
                        <Redo2 className="size-4" />
                    </button>
                </div>

                {isAuthorized && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 animate-in fade-in zoom-in duration-300">
                        <ShieldCheck className="size-4" />
                        <span className="text-xs font-semibold">Authorized</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-x-3">
                {/* 2.C Verification Button */}
                <button
                    onClick={handleVerifyClick}
                    className="flex items-center gap-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-all"
                >
                    <ExternalLink className="size-4" />
                    Verify Certificate
                </button>

                {/* 2.D Admin Authorize Button */}
                {isAdmin && !isAuthorized && (
                    <button
                        onClick={handleAuthorize}
                        disabled={isAuthorizing}
                        className="flex items-center gap-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <CheckCircle className="size-4" />
                        {isAuthorizing ? "Authorizing..." : "Authorize"}
                    </button>
                )}

                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center gap-x-2 px-5 py-2.5 text-white rounded-xl font-medium transition-all hover:shadow-lg"
                        style={{ backgroundColor: '#ee7158' }}
                    >
                        Export
                        <Download className="size-4" />
                    </button>

                    {showExportMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowExportMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                                <button
                                    onClick={() => handleExport('png')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <FileImage className="size-4 text-blue-500" />
                                    Export as PNG
                                </button>
                                <button
                                    onClick={() => handleExport('jpg')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <FileImage className="size-4 text-green-500" />
                                    Export as JPG
                                </button>
                                <button
                                    onClick={() => handleExport('svg')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <FileText className="size-4 text-purple-500" />
                                    Export as SVG
                                </button>
                                <div className="border-t border-gray-100" />
                                <button
                                    onClick={() => handleExport('json')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <FileText className="size-4 text-gray-500" />
                                    Save Project
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

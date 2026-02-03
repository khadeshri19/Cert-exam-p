import {
    Minimize,
    ZoomIn,
    ZoomOut
} from "lucide-react";

import type { Editor } from "./types";

interface FooterProps {
    editor: Editor | undefined;
};

export const Footer = ({ editor }: FooterProps) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', padding: '0 16px', gap: 16 }}>
            <div className="zoom-controls">
                <button className="zoom-button" onClick={() => editor?.zoomOut()}>
                    <ZoomOut size={16} />
                </button>
                <button className="zoom-button" onClick={() => editor?.autoZoom()}>
                    <Minimize size={16} />
                </button>
                <button className="zoom-button" onClick={() => editor?.zoomIn()}>
                    <ZoomIn size={16} />
                </button>
            </div>
        </div>
    );
};

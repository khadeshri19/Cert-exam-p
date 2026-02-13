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
    const btnStyle = {
        padding: '6px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', padding: '0 16px', gap: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    style={btnStyle}
                    onClick={() => editor?.zoomOut()}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    <ZoomOut size={16} />
                </button>
                <button
                    style={btnStyle}
                    onClick={() => editor?.autoZoom()}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    <Minimize size={16} />
                </button>
                <button
                    style={btnStyle}
                    onClick={() => editor?.zoomIn()}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    <ZoomIn size={16} />
                </button>
            </div>
        </div>
    );
};

import {
    ArrowUp,
    ArrowDown,
    Trash,
    Copy
} from "lucide-react";

import { isTextType } from "./utils";
import type {
    ActiveTool,
    Editor,
} from "./types";

interface ToolbarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const Toolbar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: ToolbarProps) => {
    const selectedObjectType = editor?.selectedObjects[0]?.type;

    const isText = isTextType(selectedObjectType);
    const isImage = selectedObjectType === "image";

    if (editor?.selectedObjects.length === 0) {
        return (
            <div style={{ height: 56, borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', alignItems: 'center', padding: '8px' }} />
        );
    }

    const fillColor = editor?.getActiveFillColor();
    const strokeColor = editor?.getActiveStrokeColor();

    const buttonStyle = {
        padding: '8px',
        borderRadius: '4px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const activeStyle = {
        backgroundColor: '#f3f4f6'
    };

    return (
        <div style={{ height: 56, borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', alignItems: 'center', padding: '0 8px', gap: 8 }}>
            {!isImage && (
                <button
                    onClick={() => onChangeActiveTool("fill")}
                    style={{ ...buttonStyle, ...(activeTool === "fill" ? activeStyle : {}) }}
                >
                    <div
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            border: '1px solid #ccc',
                            backgroundColor: fillColor
                        }}
                    />
                </button>
            )}
            {!isText && (
                <button
                    onClick={() => onChangeActiveTool("stroke-color")}
                    style={{ ...buttonStyle, ...(activeTool === "stroke-color" ? activeStyle : {}) }}
                >
                    <div
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: strokeColor,
                            backgroundColor: 'white'
                        }}
                    />
                </button>
            )}
            <div style={{ height: 24, width: 1, backgroundColor: '#e5e7eb', margin: '0 8px' }} />
            <button
                onClick={() => editor?.bringForward()}
                style={buttonStyle}
                title="Bring Forward"
            >
                <ArrowUp size={16} />
            </button>
            <button
                onClick={() => editor?.sendBackwards()}
                style={buttonStyle}
                title="Send Backwards"
            >
                <ArrowDown size={16} />
            </button>
            <button
                onClick={() => {
                    editor?.onCopy();
                    editor?.onPaste();
                }}
                style={buttonStyle}
                title="Duplicate"
            >
                <Copy size={16} />
            </button>
            <button
                onClick={() => editor?.delete()}
                style={{ ...buttonStyle, color: '#dc2626', marginLeft: 'auto' }}
                title="Delete"
            >
                <Trash size={16} />
            </button>
        </div>
    );
};

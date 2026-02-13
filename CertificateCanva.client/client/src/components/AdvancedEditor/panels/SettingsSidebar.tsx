import type { ActiveTool, Editor } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ScrollArea } from "../ScrollArea";
import { useState } from "react";

interface SettingsSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const SettingsSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: SettingsSidebarProps) => {
    const workspace = editor?.getWorkspace();
    const [width, setWidth] = useState(workspace?.width?.toString() || "1200");
    const [height, setHeight] = useState(workspace?.height?.toString() || "900");

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editor?.changeSize({
            width: parseInt(width),
            height: parseInt(height),
        });
    };

    return (
        <aside
            style={{
                display: activeTool === "resize" ? "flex" : "none",
                backgroundColor: 'white',
                position: 'relative',
                borderRight: '1px solid #e5e7eb',
                zIndex: 40,
                width: '300px',
                height: '100%',
                flexDirection: 'column',
                overflow: 'visible'
            }}
        >
            <ToolSidebarHeader
                title="Resize"
                description="Change the workspace dimensions"
            />
            <ScrollArea>
                <form
                    style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    onSubmit={onSubmit}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Width</label>
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Height</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '8px 0',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontWeight: 500,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                        Resize Canvas
                    </button>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                        <p style={{ fontSize: '12px', fontWeight: 500, color: '#9ca3af', marginBottom: '12px' }}>Popular sizes</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => { setWidth("1200"); setHeight("900"); }}
                                style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', transition: 'background-color 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Desktop (1200x900)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setWidth("1080"); setHeight("1080"); }}
                                style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', transition: 'background-color 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Social Post (1080x1080)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setWidth("842"); setHeight("595"); }}
                                style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', transition: 'background-color 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                A4 Landscape (842x595)
                            </button>
                        </div>
                    </div>
                </form>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

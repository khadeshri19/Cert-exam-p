import type { ActiveTool, Editor } from "../types";
import { STROKE_WIDTH } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ScrollArea } from "../ScrollArea";

interface StrokeWidthSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const StrokeWidthSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: StrokeWidthSidebarProps) => {
    const width = editor?.getActiveStrokeWidth() || STROKE_WIDTH;
    const dashArray = editor?.getActiveStrokeDashArray() || [];

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const onChangeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
        editor?.changeStrokeWidth(parseInt(e.target.value));
    };

    return (
        <aside
            style={{
                display: activeTool === "stroke-width" ? "flex" : "none",
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
                title="Stroke width"
                description="Change the border thickness"
            />
            <ScrollArea>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Width</span>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{width}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            value={width}
                            onChange={onChangeWidth}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Line type</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => editor?.changeStrokeDashArray([])}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: dashArray.length === 0 ? '#f3f4f6' : 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }} />
                            </button>
                            <button
                                onClick={() => editor?.changeStrokeDashArray([5, 5])}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: JSON.stringify(dashArray) === '[5,5]' ? '#f3f4f6' : 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ height: '2px', borderTop: '2px dashed black', width: '100%' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

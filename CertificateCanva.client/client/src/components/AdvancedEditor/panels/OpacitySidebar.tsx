import type { ActiveTool, Editor } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ScrollArea } from "../ScrollArea";

interface OpacitySidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const OpacitySidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: OpacitySidebarProps) => {
    const value = (editor?.getActiveOpacity() || 1) * 100;

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        editor?.changeOpacity(val / 100);
    };

    return (
        <aside
            style={{
                display: activeTool === "opacity" ? "flex" : "none",
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
                title="Opacity"
                description="Change the transparency of your element"
            />
            <ScrollArea>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Value</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{Math.round(value)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={value}
                        onChange={onChange}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

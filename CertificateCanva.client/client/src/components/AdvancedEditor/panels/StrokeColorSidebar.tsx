import type { ActiveTool, Editor } from "../types";
import { STROKE_COLOR } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ColorPicker } from "../ColorPicker";
import { ScrollArea } from "../ScrollArea";

interface StrokeColorSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const StrokeColorSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: StrokeColorSidebarProps) => {
    const value = editor?.getActiveStrokeColor() || STROKE_COLOR;

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const onChange = (value: string) => {
        editor?.changeStrokeColor(value);
    };

    return (
        <aside
            style={{
                display: activeTool === "stroke-color" ? "flex" : "none",
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
                title="Stroke color"
                description="Add stroke color to your element"
            />
            <ScrollArea>
                <div style={{ padding: '16px' }}>
                    <ColorPicker
                        value={value}
                        onChange={onChange}
                    />
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

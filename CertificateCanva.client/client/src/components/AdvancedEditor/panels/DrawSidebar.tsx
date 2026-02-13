import type {
    ActiveTool,
    Editor,
} from "../types";
import { STROKE_COLOR, STROKE_WIDTH } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ColorPicker } from "../ColorPicker";
import { ScrollArea } from "../ScrollArea";

interface DrawSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const DrawSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: DrawSidebarProps) => {
    const colorValue = editor?.getActiveStrokeColor() || STROKE_COLOR;
    const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;

    const onClose = () => {
        editor?.disableDrawingMode();
        onChangeActiveTool("select");
    };

    const onColorChange = (value: string) => {
        editor?.changeStrokeColor(value);
    };

    const onWidthChange = (value: number) => {
        editor?.changeStrokeWidth(value);
    };

    return (
        <aside
            style={{
                display: activeTool === "draw" ? "flex" : "none",
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
                title="Drawing mode"
                description="Modify brush settings"
            />
            <ScrollArea>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #f3f4f6' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500 }}>
                        Brush width
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        value={widthValue}
                        onChange={(e) => onWidthChange(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ padding: '16px' }}>
                    <ColorPicker
                        value={colorValue}
                        onChange={onColorChange}
                    />
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

import type {
    ActiveTool,
    Editor,
} from "../types";
import { STROKE_COLOR, STROKE_WIDTH } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ColorPicker } from "../ColorPicker";
import { ScrollArea } from "../ScrollArea";

import { cn } from "../../../lib/utils";

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
            className={cn(
                "bg-white relative border-r border-gray-200 z-[40] w-[300px] h-full flex flex-col",
                activeTool === "draw" ? "visible" : "hidden",
            )}
        >
            <ToolSidebarHeader
                title="Drawing mode"
                description="Modify brush settings"
            />
            <ScrollArea>
                <div className="p-4 space-y-6 border-b">
                    <label className="text-sm font-medium">
                        Brush width
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        value={widthValue}
                        onChange={(e) => onWidthChange(parseInt(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div className="p-4 space-y-6">
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

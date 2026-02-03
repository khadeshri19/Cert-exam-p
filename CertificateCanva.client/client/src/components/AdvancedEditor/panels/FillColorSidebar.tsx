import type { ActiveTool, Editor } from "../types";
import { FILL_COLOR } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ColorPicker } from "../ColorPicker";
import { ScrollArea } from "../ScrollArea";

import { cn } from "../../../lib/utils";

interface FillColorSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FillColorSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: FillColorSidebarProps) => {
    const value = editor?.getActiveFillColor() || FILL_COLOR;

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const onChange = (value: string) => {
        editor?.changeFillColor(value);
    };

    return (
        <aside
            className={cn(
                "bg-white relative border-r border-gray-200 z-[40] w-[300px] h-full flex flex-col",
                activeTool === "fill" ? "visible" : "hidden",
            )}
        >
            <ToolSidebarHeader
                title="Fill color"
                description="Add fill color to your element"
            />
            <ScrollArea>
                <div className="p-4 space-y-6">
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

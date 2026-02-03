import type { ActiveTool, Editor } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ScrollArea } from "../ScrollArea";

import { cn } from "../../../lib/utils";

interface TextSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TextSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: TextSidebarProps) => {
    const onClose = () => {
        onChangeActiveTool("select");
    };

    return (
        <aside
            className={cn(
                "bg-white relative border-r border-gray-200 z-[40] w-[300px] h-full flex flex-col",
                activeTool === "text" ? "visible" : "hidden",
            )}
        >
            <ToolSidebarHeader
                title="Text"
                description="Add text to your canvas"
            />
            <ScrollArea>
                <div className="p-4 space-y-3">
                    <button
                        className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200"
                        onClick={() => editor?.addText("Textbox")}
                    >
                        Add a textbox
                    </button>

                    <div className="pt-2">
                        <p className="text-xs font-medium text-gray-500 mb-2">Quick Add</p>
                        <div className="space-y-2">
                            <button
                                className="w-full px-4 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 text-left"
                                onClick={() => editor?.addText("Heading", {
                                    fontSize: 80,
                                    fontWeight: 700,
                                })}
                            >
                                <span className="text-2xl font-bold text-gray-800">
                                    Heading
                                </span>
                            </button>

                            <button
                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 text-left"
                                onClick={() => editor?.addText("Subheading", {
                                    fontSize: 44,
                                    fontWeight: 600,
                                })}
                            >
                                <span className="text-xl font-semibold text-gray-700">
                                    Subheading
                                </span>
                            </button>

                            <button
                                className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 text-left"
                                onClick={() => editor?.addText("Paragraph", {
                                    fontSize: 32,
                                })}
                            >
                                <span className="text-base text-gray-600">
                                    Paragraph text
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

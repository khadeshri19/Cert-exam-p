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

import { cn } from "../../lib/utils";

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
            <div className="shrink-0 h-[56px] border-b bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2" />
        );
    }

    const fillColor = editor?.getActiveFillColor();
    const strokeColor = editor?.getActiveStrokeColor();

    return (
        <div className="shrink-0 h-[56px] border-b bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2">
            {!isImage && (
                <button
                    onClick={() => onChangeActiveTool("fill")}
                    className={cn(
                        "p-2 hover:bg-slate-100 rounded-md",
                        activeTool === "fill" && "bg-slate-100"
                    )}
                >
                    <div
                        className="rounded-sm size-4 border"
                        style={{ backgroundColor: fillColor }}
                    />
                </button>
            )}
            {!isText && (
                <button
                    onClick={() => onChangeActiveTool("stroke-color")}
                    className={cn(
                        "p-2 hover:bg-slate-100 rounded-md",
                        activeTool === "stroke-color" && "bg-slate-100"
                    )}
                >
                    <div
                        className="rounded-sm size-4 border-2 bg-white"
                        style={{ borderColor: strokeColor }}
                    />
                </button>
            )}
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <button
                onClick={() => editor?.bringForward()}
                className="p-2 hover:bg-slate-100 rounded-md"
                title="Bring Forward"
            >
                <ArrowUp className="size-4" />
            </button>
            <button
                onClick={() => editor?.sendBackwards()}
                className="p-2 hover:bg-slate-100 rounded-md"
                title="Send Backwards"
            >
                <ArrowDown className="size-4" />
            </button>
            <button
                onClick={() => {
                    editor?.onCopy();
                    editor?.onPaste();
                }}
                className="p-2 hover:bg-slate-100 rounded-md"
                title="Duplicate"
            >
                <Copy className="size-4" />
            </button>
            <button
                onClick={() => editor?.delete()}
                className="p-2 hover:bg-slate-100 rounded-md text-red-600 ml-auto"
                title="Delete"
            >
                <Trash className="size-4" />
            </button>
        </div>
    );
};

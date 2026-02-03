import {
    LayoutTemplate,
    ImageIcon,
    Pencil,
    Palette,
    Shapes,
    Type,
    FileText,
} from "lucide-react";

import type { ActiveTool } from "./types";
import { SidebarItem } from "./SidebarItem";

interface SidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const Sidebar = ({
    activeTool,
    onChangeActiveTool,
}: SidebarProps) => {
    return (
        <aside className="bg-white flex flex-col w-[80px] h-full border-r border-gray-200 overflow-y-auto">
            <ul className="flex flex-col py-2">
                <SidebarItem
                    icon={LayoutTemplate}
                    label="Templates"
                    isActive={activeTool === "templates"}
                    onClick={() => onChangeActiveTool("templates")}
                />
                <SidebarItem
                    icon={ImageIcon}
                    label="Images"
                    isActive={activeTool === "images"}
                    onClick={() => onChangeActiveTool("images")}
                />
                <SidebarItem
                    icon={Type}
                    label="Text"
                    isActive={activeTool === "text"}
                    onClick={() => onChangeActiveTool("text")}
                />
                <SidebarItem
                    icon={Shapes}
                    label="Shapes"
                    isActive={activeTool === "shapes"}
                    onClick={() => onChangeActiveTool("shapes")}
                />
                <SidebarItem
                    icon={Pencil}
                    label="Draw"
                    isActive={activeTool === "draw"}
                    onClick={() => onChangeActiveTool("draw")}
                />
                <SidebarItem
                    icon={Palette}
                    label="Fill"
                    isActive={activeTool === "fill"}
                    onClick={() => onChangeActiveTool("fill")}
                />
                <div className="my-2 border-t border-gray-100" />
                <SidebarItem
                    icon={FileText}
                    label="Cert Info"
                    isActive={activeTool === "metadata"}
                    onClick={() => onChangeActiveTool("metadata")}
                />
            </ul>
        </aside>
    );
};

import {
    LayoutTemplate,
    ImageIcon,
    Pencil,
    Maximize,
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
        <aside className="editor-tools" style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid var(--border-color)', padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
                <SidebarItem
                    icon={Type}
                    label="Text"
                    isActive={activeTool === "text"}
                    onClick={() => onChangeActiveTool("text")}
                />
                <SidebarItem
                    icon={Shapes}
                    label="Elements"
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
                    icon={ImageIcon}
                    label="Assets"
                    isActive={activeTool === "images"}
                    onClick={() => onChangeActiveTool("images")}
                />
                <SidebarItem
                    icon={Maximize}
                    label="Resize"
                    isActive={activeTool === "resize"}
                    onClick={() => onChangeActiveTool("resize")}
                />

                <div style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />

                <SidebarItem
                    icon={LayoutTemplate}
                    label="Templates"
                    isActive={activeTool === "templates"}
                    onClick={() => onChangeActiveTool("templates")}
                />
                <SidebarItem
                    icon={FileText}
                    label="Cert Info"
                    isActive={activeTool === "metadata"}
                    onClick={() => onChangeActiveTool("metadata")}
                />
            </div>
        </aside>
    );
};

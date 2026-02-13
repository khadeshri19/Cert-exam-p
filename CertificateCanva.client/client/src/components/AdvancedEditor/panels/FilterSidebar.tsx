import type { ActiveTool, Editor } from "../types";
import { filters } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ScrollArea } from "../ScrollArea";

interface FilterSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FilterSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: FilterSidebarProps) => {
    const onClose = () => {
        onChangeActiveTool("select");
    };

    return (
        <aside
            style={{
                display: activeTool === "filter" ? "flex" : "none",
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
                title="Filters"
                description="Apply filters to your image"
            />
            <ScrollArea>
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            style={{
                                width: '100%',
                                padding: '12px',
                                textAlign: 'left',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#1f2937',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                            onClick={() => editor?.changeImageFilter(filter)}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

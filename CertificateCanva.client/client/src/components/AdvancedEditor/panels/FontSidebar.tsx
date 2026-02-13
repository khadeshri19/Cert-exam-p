import type { ActiveTool, Editor } from "../types";
import { fonts } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ScrollArea } from "../ScrollArea";

interface FontSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FontSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: FontSidebarProps) => {
    const value = editor?.getActiveFontFamily();

    const onClose = () => {
        onChangeActiveTool("select");
    };

    return (
        <aside
            style={{
                display: activeTool === "font" ? "flex" : "none",
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
                title="Font"
                description="Change the font family"
            />
            <ScrollArea>
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {fonts.map((font) => (
                        <button
                            key={font}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                textAlign: 'left',
                                backgroundColor: value === font ? '#f3f4f6' : 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontFamily: font,
                                color: '#1f2937'
                            }}
                            onClick={() => editor?.changeFontFamily(font)}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = value === font ? '#f3f4f6' : 'transparent'}
                        >
                            {font}
                        </button>
                    ))}
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

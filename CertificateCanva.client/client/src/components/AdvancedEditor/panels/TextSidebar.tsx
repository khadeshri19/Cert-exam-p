import type { ActiveTool, Editor } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ScrollArea } from "../ScrollArea";

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
            style={{
                display: activeTool === "text" ? "flex" : "none",
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
            <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button style={{ fontSize: '14px', fontWeight: 600, borderBottom: '2px solid #2563eb', paddingBottom: '4px', background: 'none', border: 'none', borderBottomStyle: 'solid', cursor: 'pointer' }}>Text</button>
                    <button style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', paddingBottom: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>My fonts</button>
                </div>
            </div>

            <ScrollArea>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: 'white',
                            color: '#1f2937',
                            fontWeight: 'bold',
                            fontSize: '20px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            border: '2px solid black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        onClick={() => editor?.addText("Heading", {
                            fontSize: 80,
                            fontWeight: 700,
                        })}
                    >
                        Create header
                    </button>

                    <button
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'white',
                            color: '#1f2937',
                            fontWeight: 600,
                            fontSize: '18px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            border: '2px solid black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        onClick={() => editor?.addText("Subheading", {
                            fontSize: 44,
                            fontWeight: 600,
                        })}
                    >
                        Create sub header
                    </button>

                    <button
                        style={{
                            width: '100%',
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            color: '#1f2937',
                            fontWeight: 500,
                            fontSize: '16px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            border: '2px solid black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        onClick={() => editor?.addText("Paragraph", {
                            fontSize: 32,
                        })}
                    >
                        Create body text
                    </button>

                    <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Default text styles</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Additional text presets can go here */}
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

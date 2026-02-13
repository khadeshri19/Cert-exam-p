import { IoTriangle } from "react-icons/io5";
import { FaDiamond } from "react-icons/fa6";
import { FaCircle, FaSquare, FaSquareFull } from "react-icons/fa";
import { Search } from "lucide-react";

import type { ActiveTool, Editor } from "../types";
import { ShapeTool } from "../ShapeTool";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ScrollArea } from "../ScrollArea";

interface ShapeSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
};

export const ShapeSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: ShapeSidebarProps) => {
    const onClose = () => {
        onChangeActiveTool("select");
    };

    return (
        <aside
            style={{
                display: activeTool === "shapes" ? "flex" : "none",
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
            <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '16px',
                            color: '#9ca3af'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            width: '100%',
                            paddingLeft: '40px',
                            paddingRight: '16px',
                            paddingTop: '8px',
                            paddingBottom: '8px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <ScrollArea>
                <div style={{ padding: '16px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '12px' }}>Lines</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => editor?.changeSize({ width: 0, height: 0 })} // Placeholder
                                style={{ width: '100%', height: '2px', backgroundColor: '#d1d5db', border: 'none', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#9ca3af'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                            />
                            <button
                                onClick={() => editor?.changeSize({ width: 0, height: 0 })} // Placeholder
                                style={{ width: '100%', height: '0', borderTop: '2px dashed #d1d5db', background: 'none', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.borderTopColor = '#9ca3af'}
                                onMouseOut={(e) => e.currentTarget.style.borderTopColor = '#d1d5db'}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1, height: '2px', backgroundColor: '#d1d5db' }} />
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d1d5db' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '12px' }}>Shapes</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <ShapeTool
                                onClick={() => editor?.addRectangle()}
                                icon={FaSquareFull}
                            />
                            <ShapeTool
                                onClick={() => editor?.addCircle()}
                                icon={FaCircle}
                            />
                            <div
                                style={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    border: '1px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                                onClick={() => editor?.addTriangle()}
                            >
                                <IoTriangle style={{ width: '24px', height: '24px', color: '#9ca3af', transform: 'rotate(45deg)' }} />
                            </div>
                            <ShapeTool
                                onClick={() => editor?.addSoftRectangle()}
                                icon={FaSquare}
                            />
                            <ShapeTool
                                onClick={() => editor?.addTriangle()}
                                icon={IoTriangle}
                            />
                            <ShapeTool
                                onClick={() => editor?.addDiamond()}
                                icon={FaDiamond}
                            />
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};

import * as fabric from "fabric";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
    ActiveTool,
} from "./types";
import { selectionDependentTools } from "./types";
import { useEditor } from "../../hooks/use-editor";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

import { ShapeSidebar } from "./panels/ShapeSidebar";
import { FillColorSidebar } from "./panels/FillColorSidebar";
import { TextSidebar } from "./panels/TextSidebar";
import { ImageSidebar } from "./panels/ImageSidebar";
import { DrawSidebar } from "./panels/DrawSidebar";
import { MetadataSidebar } from "./panels/MetadataSidebar";

import { cn } from "../../lib/utils";

interface EditorProps {
    initialData: {
        id: string;
        json: string;
        width: number;
        height: number;
        holder_name?: string;
        certificate_title?: string;
        issue_date?: string;
        organization_name?: string;
        certificate_id?: string;
        is_authorized?: boolean;
    };
    onSave?: (values: any) => void;
};

export const AdvancedEditor = ({ initialData, onSave }: EditorProps) => {
    const [activeTool, setActiveTool] = useState<ActiveTool>("select");
    const [metadata, setMetadata] = useState({
        holder_name: initialData.holder_name || "",
        certificate_title: initialData.certificate_title || "",
        issue_date: initialData.issue_date || new Date().toISOString().split('T')[0],
        organization_name: initialData.organization_name || "",
    });

    const debouncedSave = useCallback(
        debounce(
            (values: {
                json: string,
                height: number,
                width: number,
            }) => {
                onSave?.({
                    ...values,
                    ...metadata
                });
            },
            500
        ), [onSave, metadata]);

    const onClearSelection = useCallback(() => {
        if (selectionDependentTools.includes(activeTool)) {
            setActiveTool("select");
        }
    }, [activeTool]);

    const { init, editor } = useEditor({
        defaultState: initialData.json,
        defaultWidth: initialData.width,
        defaultHeight: initialData.height,
        clearSelectionCallback: onClearSelection,
        saveCallback: debouncedSave,
    });

    const onChangeActiveTool = useCallback((tool: ActiveTool) => {
        if (tool === "draw") {
            editor?.enableDrawingMode();
        }

        if (activeTool === "draw" && tool !== "draw") {
            editor?.disableDrawingMode();
        }

        if (tool === activeTool) {
            return setActiveTool("select");
        }

        setActiveTool(tool);
    }, [activeTool, editor]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            controlsAboveOverlay: true,
            preserveObjectStacking: true,
        });

        init({
            initialCanvas: canvas,
            initialContainer: containerRef.current,
        });

        return () => {
            canvas.dispose();
        };
    }, [init]);

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
            <Navbar
                editor={editor}
                activeTool={activeTool}
                onChangeActiveTool={onChangeActiveTool}
                id={initialData.id}
                certificateId={initialData.certificate_id}
                isAuthorized={initialData.is_authorized}
            />
            <div className="flex-1 flex overflow-hidden relative">
                <Sidebar
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />

                <ShapeSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <FillColorSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <TextSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <ImageSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <DrawSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <MetadataSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                    metadata={metadata}
                    onMetadataChange={setMetadata}
                />

                <main className="flex-1 overflow-auto relative flex flex-col">
                    <Toolbar
                        editor={editor}
                        activeTool={activeTool}
                        onChangeActiveTool={onChangeActiveTool}
                        key={activeTool}
                    />
                    <div
                        className={cn(
                            "flex-1",
                            editor?.canvas?.isDrawingMode && "cursor-crosshair"
                        )}
                        style={{ backgroundColor: '#e5e7eb' }}
                        ref={containerRef}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                    <Footer editor={editor} />
                </main>
            </div>
        </div>
    );
};

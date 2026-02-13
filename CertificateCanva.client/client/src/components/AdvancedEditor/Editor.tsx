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
import { StrokeColorSidebar } from "./panels/StrokeColorSidebar";
import { StrokeWidthSidebar } from "./panels/StrokeWidthSidebar";
import { OpacitySidebar } from "./panels/OpacitySidebar";
import { FontSidebar } from "./panels/FontSidebar";
import { FilterSidebar } from "./panels/FilterSidebar";
import { TextSidebar } from "./panels/TextSidebar";
import { ImageSidebar } from "./panels/ImageSidebar";
import { DrawSidebar } from "./panels/DrawSidebar";
import { MetadataSidebar } from "./panels/MetadataSidebar";
import { SettingsSidebar } from "./panels/SettingsSidebar";

import '../../styles/pages/editor.css';

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
    onSave?: (values: any) => Promise<void>;
};

export const AdvancedEditor = ({ initialData, onSave }: EditorProps) => {
    const [activeTool, setActiveTool] = useState<ActiveTool>("select");
    const [isSaving, setIsSaving] = useState(false);
    const [certificateId, setCertificateId] = useState(initialData.certificate_id || "");
    const [metadata, setMetadata] = useState({
        holder_name: initialData.holder_name || "",
        certificate_title: initialData.certificate_title || "",
        issue_date: initialData.issue_date || new Date().toISOString().split('T')[0],
        organization_name: initialData.organization_name || "",
    });

    useEffect(() => {
        if (initialData.certificate_id) {
            setCertificateId(initialData.certificate_id);
        }
    }, [initialData.certificate_id]);

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
        defaultWidth: initialData.width || 1912,
        defaultHeight: initialData.height || 1080,
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

    const handleGenerate = useCallback(async () => {
        if (!editor || isSaving) return;

        setIsSaving(true);
        try {
            const values = {
                json: editor.getJson(),
                width: editor.getWorkspace()?.width || 1200,
                height: editor.getWorkspace()?.height || 900,
                ...metadata,
                title: metadata.certificate_title || "Certificate"
            };

            await onSave?.(values);
        } catch (error) {
            console.error("Failed to generate certificate:", error);
        } finally {
            setIsSaving(false);
        }
    }, [editor, metadata, onSave, isSaving]);

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
        <div className="editor-container">
            {/* Left Tool Strip */}
            <Sidebar
                activeTool={activeTool}
                onChangeActiveTool={onChangeActiveTool}
            />

            {/* Secondary Panels (Hidden/Visible handled by components themselves typically, but we should position them) */}
            {/* We wrap them in a container that sits next to Sidebar if we want them to push content, 
                or absolute if they overlay. Assuming they are panels: */}
            <div style={{ position: 'relative', zIndex: 10 }}>
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
                <StrokeColorSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <StrokeWidthSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <OpacitySidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <FontSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <FilterSidebar
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
                <SettingsSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
            </div>

            {/* Main Workspace */}
            <div className="editor-workspace">
                <div className="editor-navbar">
                    <Navbar
                        editor={editor}
                        activeTool={activeTool}
                        onChangeActiveTool={onChangeActiveTool}
                        id={initialData.id}
                        certificateId={certificateId}
                        isAuthorized={initialData.is_authorized}
                    />
                </div>

                <div
                    className="editor-canvas-area"
                    style={{ position: 'relative' }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const url = e.dataTransfer.getData("image_url");
                        if (url && editor) {
                            editor.addImage(url);
                        }
                    }}
                >
                    <Toolbar
                        editor={editor}
                        activeTool={activeTool}
                        onChangeActiveTool={onChangeActiveTool}
                        key={activeTool}
                    />
                    <div
                        style={{ height: '100%', width: '100%', flex: 1, overflow: 'hidden' }}
                        ref={containerRef}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                </div>

                <div className="editor-footer">
                    <Footer editor={editor} />
                </div>
            </div>

            {/* Right Metadata */}
            {activeTool === "metadata" && (
                <div className="editor-metadata" style={{ width: '300px', borderLeft: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                    <MetadataSidebar
                        editor={editor}
                        activeTool={activeTool}
                        onChangeActiveTool={onChangeActiveTool}
                        metadata={metadata}
                        onMetadataChange={setMetadata}
                        certificateId={certificateId}
                        onGenerate={handleGenerate}
                        isSaving={isSaving}
                    />
                </div>
            )}
        </div>
    );
};

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, IText, FabricImage } from 'fabric';
import { canvasApi } from '../../api';
import './CanvasEditor.css';

// Sidebar Panels
import { TextPanel, UploadPanel, VerificationPanel, ExportPanel } from './panels';

interface CanvasEditorProps {
    canvasId: string;
    initialData?: any;
    title: string;
    onSave?: (data: any) => void;
}

type PanelType = 'text' | 'upload' | 'verification' | 'export';

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
    canvasId,
    initialData,
    title: initialTitle,
    onSave,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const [activePanel, setActivePanel] = useState<PanelType>('text');
    const [selectedObject, setSelectedObject] = useState<any>(null);

    // Canvas state
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [verificationCode, setVerificationCode] = useState<string | null>(null);
    const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
    const [canExport, setCanExport] = useState(false);

    // Form state
    const [title, setTitle] = useState(initialTitle);
    const [authorName, setAuthorName] = useState('');

    // Activity heartbeat
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initialize Fabric canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            selection: true,
        });

        fabricRef.current = canvas;

        // Load initial data if exists
        if (initialData?.canvas_data) {
            try {
                canvas.loadFromJSON(initialData.canvas_data).then(() => {
                    canvas.renderAll();
                });
            } catch (error) {
                console.error('Failed to load canvas data:', error);
            }
        }

        // Selection events
        canvas.on('selection:created', (e) => {
            setSelectedObject(e.selected?.[0] || null);
        });

        canvas.on('selection:updated', (e) => {
            setSelectedObject(e.selected?.[0] || null);
        });

        canvas.on('selection:cleared', () => {
            setSelectedObject(null);
        });

        // Check initial verification status
        checkVerificationStatus();

        // Start activity heartbeat
        startHeartbeat();

        return () => {
            canvas.dispose();
            stopHeartbeat();
        };
    }, [canvasId]);

    // Heartbeat for activity tracking
    const startHeartbeat = useCallback(() => {
        heartbeatRef.current = setInterval(async () => {
            try {
                await canvasApi.updateActivity(canvasId);
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        }, 30000); // Every 30 seconds
    }, [canvasId]);

    const stopHeartbeat = useCallback(() => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
        }
    }, []);

    // End session on unmount
    useEffect(() => {
        return () => {
            canvasApi.endSession(canvasId).catch(console.error);
        };
    }, [canvasId]);

    // Check verification status
    const checkVerificationStatus = async () => {
        try {
            const response = await canvasApi.getVerificationStatus(canvasId);
            const data = response.data.data;
            if (data.has_verification) {
                setVerificationCode(data.verification_code);
                setVerificationUrl(data.verification_url);
                setIsSaved(true);
                setCanExport(true);
            }
        } catch (error) {
            console.error('Failed to check verification status:', error);
        }
    };

    // Get canvas JSON data
    const getCanvasData = () => {
        if (!fabricRef.current) return null;
        return fabricRef.current.toJSON();
    };

    // Add text to canvas
    const addText = (options: {
        text: string;
        fontFamily?: string;
        fontSize?: number;
        fill?: string;
        fontWeight?: string;
        fontStyle?: string;
        underline?: boolean;
        textAlign?: string;
    }) => {
        if (!fabricRef.current) return;

        const text = new IText(options.text || 'New Text', {
            left: 100,
            top: 100,
            fontFamily: options.fontFamily || 'Inter',
            fontSize: options.fontSize || 24,
            fill: options.fill || '#000000',
            fontWeight: options.fontWeight || 'normal',
            fontStyle: options.fontStyle || 'normal',
            underline: options.underline || false,
            textAlign: options.textAlign || 'left',
        });

        fabricRef.current.add(text);
        fabricRef.current.setActiveObject(text);
        fabricRef.current.renderAll();
    };

    // Update selected text
    const updateSelectedText = (property: string, value: any) => {
        if (!fabricRef.current || !selectedObject) return;

        selectedObject.set(property, value);
        fabricRef.current.renderAll();
    };

    // Add image to canvas
    const addImageToCanvas = async (imageUrl: string) => {
        if (!fabricRef.current) return;

        try {
            const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });

            // Scale image to fit canvas
            const maxWidth = 400;
            const maxHeight = 400;

            if (img.width && img.width > maxWidth) {
                img.scaleToWidth(maxWidth);
            }
            if (img.height && img.scaleY && img.height * img.scaleY > maxHeight) {
                img.scaleToHeight(maxHeight);
            }

            img.set({
                left: 100,
                top: 100,
            });

            fabricRef.current.add(img);
            fabricRef.current.setActiveObject(img);
            fabricRef.current.renderAll();
        } catch (error) {
            console.error('Failed to load image:', error);
        }
    };

    // Set background image
    const setBackgroundImage = async (imageUrl: string) => {
        if (!fabricRef.current) return;

        try {
            const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
            const canvas = fabricRef.current;

            if (img.width && img.height) {
                img.scaleX = canvas.width! / img.width;
                img.scaleY = canvas.height! / img.height;
            }

            canvas.backgroundImage = img;
            canvas.renderAll();
        } catch (error) {
            console.error('Failed to set background:', error);
        }
    };

    // SAVE canvas - generates verification link
    const handleSave = async () => {
        if (!title.trim() || !authorName.trim()) {
            alert('Please enter both title and author name to save');
            return;
        }

        setIsSaving(true);

        try {
            const canvasData = getCanvasData();
            const response = await canvasApi.save(canvasId, {
                canvas_data: canvasData,
                title,
                author_name: authorName,
            });

            const result = response.data.data;
            setVerificationCode(result.verification_code);
            setVerificationUrl(result.verification_url);
            setIsSaved(true);
            setCanExport(true);

            if (onSave) {
                onSave(result);
            }

            alert('Canvas saved! Verification link generated.');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save canvas');
        } finally {
            setIsSaving(false);
        }
    };

    // Export canvas
    const handleExport = async (format: 'png' | 'pdf') => {
        if (!isSaved || !canExport) {
            alert('Please save the canvas first to enable export');
            return;
        }

        if (!fabricRef.current) return;

        try {
            // Log export
            await canvasApi.logExport(canvasId, format);

            if (format === 'png') {
                const dataUrl = fabricRef.current.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2,
                });

                const link = document.createElement('a');
                link.download = `${title || 'certificate'}.png`;
                link.href = dataUrl;
                link.click();
            } else if (format === 'pdf') {
                const dataUrl = fabricRef.current.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2,
                });

                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${title || 'Certificate'}</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; flex-direction: column; }
                  img { max-width: 100%; height: auto; }
                  .verification { text-align: center; margin-top: 20px; font-family: Arial; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div>
                  <img src="${dataUrl}" alt="Certificate" />
                  <div class="verification">
                    Verify at: ${verificationUrl}
                  </div>
                </div>
                <script>window.print();</script>
              </body>
            </html>
          `);
                }
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Export failed. Make sure to save first.');
        }
    };

    // Delete selected object
    const deleteSelected = () => {
        if (!fabricRef.current || !selectedObject) return;
        fabricRef.current.remove(selectedObject);
        setSelectedObject(null);
    };

    return (
        <div className="canvas-editor">
            {/* Sidebar */}
            <div className="editor-sidebar">
                <div className="sidebar-tabs">
                    <button
                        className={`sidebar-tab ${activePanel === 'text' ? 'active' : ''}`}
                        onClick={() => setActivePanel('text')}
                    >
                        Text
                    </button>
                    <button
                        className={`sidebar-tab ${activePanel === 'upload' ? 'active' : ''}`}
                        onClick={() => setActivePanel('upload')}
                    >
                        Upload
                    </button>
                    <button
                        className={`sidebar-tab ${activePanel === 'verification' ? 'active' : ''}`}
                        onClick={() => setActivePanel('verification')}
                    >
                        Verify
                    </button>
                    <button
                        className={`sidebar-tab ${activePanel === 'export' ? 'active' : ''}`}
                        onClick={() => setActivePanel('export')}
                    >
                        Export
                    </button>
                </div>

                <div className="sidebar-content">
                    {activePanel === 'text' && (
                        <TextPanel
                            onAddText={addText}
                            selectedObject={selectedObject}
                            onUpdateText={updateSelectedText}
                            onDelete={deleteSelected}
                        />
                    )}
                    {activePanel === 'upload' && (
                        <UploadPanel
                            canvasId={canvasId}
                            onAddImage={addImageToCanvas}
                            onSetBackground={setBackgroundImage}
                        />
                    )}
                    {activePanel === 'verification' && (
                        <VerificationPanel
                            isSaved={isSaved}
                            isSaving={isSaving}
                            verificationCode={verificationCode}
                            verificationUrl={verificationUrl}
                            title={title}
                            authorName={authorName}
                            onTitleChange={setTitle}
                            onAuthorNameChange={setAuthorName}
                            onSave={handleSave}
                        />
                    )}
                    {activePanel === 'export' && (
                        <ExportPanel
                            canExport={canExport}
                            isSaved={isSaved}
                            verificationUrl={verificationUrl}
                            onExport={handleExport}
                        />
                    )}
                </div>
            </div>

            {/* Canvas Area */}
            <div className="canvas-area">
                <div className="canvas-container">
                    <canvas ref={canvasRef} id="fabric-canvas" />
                </div>
            </div>
        </div>
    );
};

export default CanvasEditor;

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';

interface CanvasEditorProps {
    canvasId: string;
    initialData?: string;
    onSave?: (data: string) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ canvasId, initialData, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<fabric.FabricObject | null>(null);
    const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'shapes' | 'images' | 'background'>('templates');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize canvas
    useEffect(() => {
        if (canvasRef.current && !canvas) {
            const fabricCanvas = new fabric.Canvas(canvasRef.current, {
                width: 800,
                height: 600,
                backgroundColor: '#ffffff',
                selection: true,
            });

            // Load initial data if provided
            if (initialData) {
                try {
                    fabricCanvas.loadFromJSON(JSON.parse(initialData)).then(() => {
                        fabricCanvas.renderAll();
                    });
                } catch (e) {
                    console.error('Failed to load canvas data:', e);
                }
            }

            fabricCanvas.on('selection:created', (e) => {
                setSelectedObject(e.selected?.[0] || null);
            });

            fabricCanvas.on('selection:updated', (e) => {
                setSelectedObject(e.selected?.[0] || null);
            });

            fabricCanvas.on('selection:cleared', () => {
                setSelectedObject(null);
            });

            setCanvas(fabricCanvas);

            return () => {
                fabricCanvas.dispose();
            };
        }
    }, []);

    // Add text
    const addText = (text: string, options?: Partial<fabric.ITextProps>) => {
        if (!canvas) return;
        const textObj = new fabric.IText(text, {
            left: 100,
            top: 100,
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#333333',
            ...options,
        });
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
    };

    // Add shape
    const addShape = (type: 'rect' | 'circle' | 'triangle' | 'line') => {
        if (!canvas) return;
        let shape: fabric.FabricObject;

        switch (type) {
            case 'rect':
                shape = new fabric.Rect({
                    left: 100,
                    top: 100,
                    width: 150,
                    height: 100,
                    fill: '#6366f1',
                    stroke: '#4f46e5',
                    strokeWidth: 2,
                    rx: 8,
                    ry: 8,
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    left: 100,
                    top: 100,
                    radius: 50,
                    fill: '#10b981',
                    stroke: '#059669',
                    strokeWidth: 2,
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    left: 100,
                    top: 100,
                    width: 100,
                    height: 100,
                    fill: '#f59e0b',
                    stroke: '#d97706',
                    strokeWidth: 2,
                });
                break;
            case 'line':
                shape = new fabric.Line([50, 50, 200, 50], {
                    stroke: '#333333',
                    strokeWidth: 3,
                });
                break;
            default:
                return;
        }

        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
    };

    // Add image
    const addImage = async (url: string) => {
        if (!canvas) return;
        try {
            const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
            img.scaleToWidth(200);
            img.set({ left: 100, top: 100 });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        } catch (e) {
            console.error('Failed to add image:', e);
        }
    };

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            addImage(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    // Set background color
    const setBackgroundColor = (color: string) => {
        if (!canvas) return;
        canvas.backgroundColor = color;
        canvas.renderAll();
    };

    // Delete selected object
    const deleteSelected = () => {
        if (!canvas || !selectedObject) return;
        canvas.remove(selectedObject);
        setSelectedObject(null);
        canvas.renderAll();
    };

    // Duplicate selected object
    const duplicateSelected = async () => {
        if (!canvas || !selectedObject) return;
        const cloned = await selectedObject.clone();
        cloned.set({
            left: (selectedObject.left || 0) + 20,
            top: (selectedObject.top || 0) + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
    };

    // Bring to front
    const bringToFront = () => {
        if (!canvas || !selectedObject) return;
        canvas.bringObjectToFront(selectedObject);
        canvas.renderAll();
    };

    // Send to back
    const sendToBack = () => {
        if (!canvas || !selectedObject) return;
        canvas.sendObjectToBack(selectedObject);
        canvas.renderAll();
    };

    // Save canvas
    const handleSave = useCallback(() => {
        if (!canvas || !onSave) return;
        const data = JSON.stringify(canvas.toJSON());
        onSave(data);
    }, [canvas, onSave]);

    // Export as image
    const exportAsImage = (format: 'png' | 'jpeg') => {
        if (!canvas) return;
        const dataUrl = canvas.toDataURL({
            format,
            quality: 1,
            multiplier: 2,
        });
        const link = document.createElement('a');
        link.download = `certificate-${canvasId}.${format === 'jpeg' ? 'jpg' : format}`;
        link.href = dataUrl;
        link.click();
    };

    // Certificate templates
    const templates = [
        { name: 'Classic', bg: '#fef3c7', accent: '#d97706' },
        { name: 'Modern', bg: '#f0f9ff', accent: '#0284c7' },
        { name: 'Elegant', bg: '#fdf2f8', accent: '#db2777' },
        { name: 'Professional', bg: '#f8fafc', accent: '#475569' },
    ];

    const applyTemplate = async (template: typeof templates[0]) => {
        if (!canvas) return;
        canvas.clear();
        setBackgroundColor(template.bg);

        // Add border
        const border = new fabric.Rect({
            left: 20,
            top: 20,
            width: 760,
            height: 560,
            fill: 'transparent',
            stroke: template.accent,
            strokeWidth: 4,
            selectable: false,
        });
        canvas.add(border);

        // Add title
        const title = new fabric.IText('CERTIFICATE', {
            left: 400,
            top: 80,
            fontFamily: 'Georgia',
            fontSize: 48,
            fontWeight: 'bold',
            fill: template.accent,
            originX: 'center',
        });
        canvas.add(title);

        // Add subtitle
        const subtitle = new fabric.IText('of Achievement', {
            left: 400,
            top: 140,
            fontFamily: 'Georgia',
            fontSize: 24,
            fill: '#666666',
            originX: 'center',
        });
        canvas.add(subtitle);

        // Add recipient text
        const recipientLabel = new fabric.IText('This is to certify that', {
            left: 400,
            top: 220,
            fontFamily: 'Arial',
            fontSize: 18,
            fill: '#666666',
            originX: 'center',
        });
        canvas.add(recipientLabel);

        // Add name placeholder
        const name = new fabric.IText('[Recipient Name]', {
            left: 400,
            top: 280,
            fontFamily: 'Georgia',
            fontSize: 36,
            fontStyle: 'italic',
            fill: template.accent,
            originX: 'center',
        });
        canvas.add(name);

        // Add description
        const description = new fabric.IText('has successfully completed', {
            left: 400,
            top: 350,
            fontFamily: 'Arial',
            fontSize: 18,
            fill: '#666666',
            originX: 'center',
        });
        canvas.add(description);

        // Add course name
        const course = new fabric.IText('[Course Name]', {
            left: 400,
            top: 400,
            fontFamily: 'Georgia',
            fontSize: 28,
            fontWeight: 'bold',
            fill: '#333333',
            originX: 'center',
        });
        canvas.add(course);

        // Add date
        const date = new fabric.IText(`Date: ${new Date().toLocaleDateString()}`, {
            left: 200,
            top: 500,
            fontFamily: 'Arial',
            fontSize: 14,
            fill: '#666666',
        });
        canvas.add(date);

        canvas.renderAll();
    };

    return (
        <div className="flex h-full bg-slate-900">
            {/* Left Sidebar */}
            <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    {(['templates', 'text', 'shapes', 'images', 'background'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${activeTab === tab
                                    ? 'text-white bg-slate-700'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'templates' && (
                        <div className="space-y-3">
                            <h3 className="text-white font-medium mb-3">Certificate Templates</h3>
                            {templates.map((template) => (
                                <button
                                    key={template.name}
                                    onClick={() => applyTemplate(template)}
                                    className="w-full p-3 rounded-lg text-left transition-all hover:scale-105"
                                    style={{ backgroundColor: template.bg, borderLeft: `4px solid ${template.accent}` }}
                                >
                                    <span className="font-medium" style={{ color: template.accent }}>
                                        {template.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'text' && (
                        <div className="space-y-3">
                            <h3 className="text-white font-medium mb-3">Add Text</h3>
                            <button
                                onClick={() => addText('Heading', { fontSize: 48, fontWeight: 'bold' })}
                                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-left"
                            >
                                <span className="text-2xl font-bold">Heading</span>
                            </button>
                            <button
                                onClick={() => addText('Subheading', { fontSize: 32 })}
                                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-left"
                            >
                                <span className="text-xl">Subheading</span>
                            </button>
                            <button
                                onClick={() => addText('Body text', { fontSize: 18 })}
                                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-left"
                            >
                                <span className="text-base">Body text</span>
                            </button>
                        </div>
                    )}

                    {activeTab === 'shapes' && (
                        <div className="space-y-3">
                            <h3 className="text-white font-medium mb-3">Add Shapes</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => addShape('rect')}
                                    className="aspect-square bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center"
                                >
                                    <div className="w-12 h-8 bg-purple-500 rounded" />
                                </button>
                                <button
                                    onClick={() => addShape('circle')}
                                    className="aspect-square bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center"
                                >
                                    <div className="w-10 h-10 bg-green-500 rounded-full" />
                                </button>
                                <button
                                    onClick={() => addShape('triangle')}
                                    className="aspect-square bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center"
                                >
                                    <div
                                        className="w-0 h-0"
                                        style={{
                                            borderLeft: '20px solid transparent',
                                            borderRight: '20px solid transparent',
                                            borderBottom: '35px solid #f59e0b',
                                        }}
                                    />
                                </button>
                                <button
                                    onClick={() => addShape('line')}
                                    className="aspect-square bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center"
                                >
                                    <div className="w-12 h-1 bg-slate-300" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div className="space-y-3">
                            <h3 className="text-white font-medium mb-3">Add Image</h3>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full px-4 py-8 bg-slate-700 text-white rounded-lg hover:bg-slate-600 border-2 border-dashed border-slate-500 flex flex-col items-center gap-2"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Upload Image</span>
                            </button>
                        </div>
                    )}

                    {activeTab === 'background' && (
                        <div className="space-y-3">
                            <h3 className="text-white font-medium mb-3">Background Color</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
                                    '#fef3c7', '#fef9c3', '#ecfccb', '#d1fae5',
                                    '#cffafe', '#e0f2fe', '#dbeafe', '#e0e7ff',
                                    '#ede9fe', '#fae8ff', '#fce7f3', '#ffe4e6',
                                ].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setBackgroundColor(color)}
                                        className="w-full aspect-square rounded-lg border-2 border-slate-600 hover:border-purple-500 transition-all"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        {selectedObject && (
                            <>
                                <button
                                    onClick={deleteSelected}
                                    className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={duplicateSelected}
                                    className="px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm"
                                >
                                    Duplicate
                                </button>
                                <button
                                    onClick={bringToFront}
                                    className="px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm"
                                >
                                    Front
                                </button>
                                <button
                                    onClick={sendToBack}
                                    className="px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm"
                                >
                                    Back
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => exportAsImage('png')}
                            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700 text-sm font-medium"
                        >
                            Export PNG
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto bg-slate-900 flex items-center justify-center p-8">
                    <div className="shadow-2xl">
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CanvasEditor;

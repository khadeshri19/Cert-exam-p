import { useRef, useState, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";

import type { ActiveTool, Editor } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ScrollArea } from "../ScrollArea";
import { imagesApi } from "../../../api";

import { cn } from "../../../lib/utils";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getImageUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    return `${API_URL}/${cleanPath}`;
};

interface ImageSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (activeTool === "images") {
            fetchImages();
        }
    }, [activeTool]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await imagesApi.getAll();
            setImages(res.data.data || []);
        } catch (e) {
            console.error('Failed to fetch images:', e);
        }
        setLoading(false);
    };

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploading(true);
            try {
                await imagesApi.upload(file);
                fetchImages();
            } catch (err) {
                console.error('Upload failed:', err);
            }
            setUploading(false);
        }
    };

    const handleAddToCanvas = (url: string) => {
        editor?.addImage(url);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this image?')) return;
        try {
            await imagesApi.delete(id);
            fetchImages();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <aside
            className={cn(
                "bg-white relative border-r border-gray-200 z-[40] w-[300px] h-full flex flex-col",
                activeTool === "images" ? "visible" : "hidden"
            )}
        >
            <ToolSidebarHeader title="Images" description="Add images to your canvas" />
            <div className="p-4 border-b border-gray-200">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={inputRef}
                    onChange={onUpload}
                />
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full text-white font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: '#ee7158' }}
                >
                    <Upload className="size-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
            </div>
            <ScrollArea>
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin w-8 h-8 border-3 border-gray-200 border-t-coral-500 rounded-full" style={{ borderTopColor: '#ee7158' }} />
                        </div>
                    ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    onClick={() => handleAddToCanvas(getImageUrl(img.file_url))}
                                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-gray-100 hover:border-gray-300 transition-all hover:shadow-lg bg-gray-50"
                                >
                                    <img
                                        src={getImageUrl(img.file_url)}
                                        alt={img.file_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <button
                                            onClick={(e) => handleDelete(img.id, e)}
                                            className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-lg transition-all"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs truncate">{img.file_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="size-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">No images yet</p>
                            <p className="text-xs text-gray-400 mt-1">Upload images to use in your design</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};
